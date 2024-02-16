'use strict';

/*Si se pulsa el botón de volver, se cambia la visibilidad, solo si se está mostrando el botón.*/
document.addEventListener('DOMContentLoaded', function () {
	const visibility = document.getElementById('visibilidad');
	if (visibility) {
		visibility.addEventListener('click', changeVisibility);
	}
	/*Actualizo la visibilidad.*/
	visibilityUpdate();
});

let pageSize;
/*Obtengo los datos de los fugitivos de la página seleccionada.*/
async function getFugitives(page, sex = '', hair = '', eyes = '') {
	const url = new URL('https://api.fbi.gov/wanted/v1/list');
	/*Establezco los parámetros para la URL.*/
	const params = { page, sex, hair, eyes };
	/*Elimino los parámetros vacíos*/
	Object.keys(params).forEach(key => params[key] === '' && delete params[key]);
	url.search = new URLSearchParams(params).toString();
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(response.statusText);
		}
		const data = await response.json();
		/*Establezco el número de fugitivos por página de la paginación en función del número de fugitivos de la primera página.*/
		if (page === 1) {
			pageSize = data.items.length;
		}
		/*Muestro los fugitivos*/
		displayFugitives(data.items);
		/*Creo la paginación en función de los fugitivos a mostrar y de la cantidad de fugitivos por página.*/
		createPagination(data.page, Math.ceil(data.total / pageSize));
	} catch (error) {
		console.error('Error al obtener los datos:', error);
	}
}

/*Muestro los fugitivos.*/
function displayFugitives(fugitives) {
	const contenedor = document.querySelector('#contenedor');
	/*Vacío el contenedor.*/
	contenedor.innerHTML = '';
	fugitives.forEach(fugitive => {
		let img;
		/*Compruebo si el fugitivo tiene imágenes.*/
		if (fugitive.images && fugitive.images.length > 0) {
			img = fugitive.images[0].thumb;
		} else {
			/*Imagen auxiliar en caso de error en su obtención.*/
			img = 'ASSETS/img_aux.jpeg';
		}
		/*Creo un fugitivo.*/
		const fugitiveDiv = document.createElement('div');
		fugitiveDiv.classList.add('fugitivo');
		fugitiveDiv.innerHTML = `
        	<div class="foto">
                <img src="${img}" alt="Fugitivo" onerror="this.onerror=null; this.src='ASSETS/img_aux.jpeg';">
            </div>
        	<div class="titulo_fugitivo">
                <div class="contenido_titulo_fugitivo">${fugitive.title}</div>
            </div>`;

		/*Añado el evento de click al fugitivo.*/
		fugitiveDiv.addEventListener('click', function () {
			/*Llamada que muestra los detalles del fugitivo.*/
			showFugitiveDetails(fugitive.uid);
		});
		/*Añado el div del fugitivo a su contenedor.*/
		contenedor.appendChild(fugitiveDiv);
	});
}

/*Función para cambiar la visibilidad.*/
function changeVisibility() {
	/*Compruebo si 'fugitiveDetailsVisible' está guardado en el almacenamiento local con valor true.*/
	const detallesVisibles = localStorage.getItem('fugitiveDetailsVisible') === 'true';
	/*Cambio al valor opuesto el valor de 'fugitiveDetailsVisible'.*/
	localStorage.setItem('fugitiveDetailsVisible', !detallesVisibles);
	/*Elimino el uid del fugitivo en caso de que 'detallesVisibles' sea false.*/
	if (!detallesVisibles) {
		localStorage.removeItem('selectedFugitiveUID');
	}
	/*Recargo la página.*/
	location.reload();
}

/*Función para actualizar la visibilidad, muestro los detalles de un fugitivo o todos los fugitivos.*/
function visibilityUpdate() {
	const detallesVisibles = localStorage.getItem('fugitiveDetailsVisible') === 'true';
	const main = document.querySelector('main');
	const allFugitiveDetails = document.querySelector('.todo_detalles_fugitivo');
	const visibility = document.getElementById('visibilidad');

	main.style.display = detallesVisibles ? 'none' : 'flex';
	allFugitiveDetails.style.display = detallesVisibles ? 'flex' : 'none';
	if (visibility) {
		visibility.style.display = detallesVisibles ? 'flex' : 'none';
	}
}

/*Muestro en detalle al fugitivo seleccionado.*/
async function showFugitiveDetails(uid) {
	/*Establezco los valores del almacenamiento local.*/
	localStorage.setItem('selectedFugitiveUID', uid);
	localStorage.setItem('fugitiveDetailsVisible', 'true');
	const url = new URL('https://api.fbi.gov/@wanted-person/' + uid);
	const main = document.querySelector('main');
	const allFugitiveDetails = document.querySelector('.todo_detalles_fugitivo');
	main.style.display = 'none';
	allFugitiveDetails.style.display = 'flex';

	url.search = new URLSearchParams().toString();
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(response.statusText);
		}
		const fugitive = await response.json();
		let img;
		let info_medio;
		let imagenes = "";
		/*Muestro las imágenes del fugitivo.*/
		if (fugitive.images && fugitive.images.length > 0) {
			img = fugitive.images[0].original;
			/*Muestro 4 imágenes en caso de haberlas y si el fugitivo tiene 5 o más no muestro la primera.*/
			let start = fugitive.images.length >= 5 ? 1 : 0;
			for (let i = start; i < fugitive.images.length && i < start + 4; i++) {
				imagenes += `
                	<div class="imagenes">
         	           <img src="${fugitive.images[i].original}" alt="Imagen adicional" onerror="this.onerror=null; this.src='ASSETS/img_aux.jpeg';">
                	</div>`;
			}
			/*Muestro una imagen auxiliar en caso de dar un error al intentar mostrar una imagen.*/
		} else {
			img = 'ASSETS/img_aux.jpeg';
		}
		/*Añado a una variable el título del fugitivo para más tarde mostrarlo.*/
		let datos = `<div class="title">
						${fugitive.title}
					</div>`;

		/*Si el fugitivo tiene descripción la añado.*/
		if (fugitive.description) {
			datos += `<div class="description">
						<b>Description: </b>${fugitive.description}
					</div>`;
		}
		/*Si el fugitivo tiene nacionalidad la añado.*/
		if (fugitive.nationality) {
			datos += `<div class="nationality">
						<b>Nationality: </b>${fugitive.nationality}
					</div>`;
		}
		/*Si el fugitivo tiene localizaciones las añado.*/
		if (fugitive.locations) {
			const locations = fugitive.locations[0].toUpperCase() + fugitive.locations.slice(1);
			datos += `<div class="location">
						<b>Locations: </b>${locations}
					</div>`;
		}
		/*Si el fugitivo tiene raza la añado.*/
		if (fugitive.race) {
			const race = fugitive.race[0].toUpperCase() + fugitive.race.slice(1);
			datos += `<div class="race">
						<b>Race: </b>${race}
					</div>`;
		}
		/*Si el fugitivo tiene sexo lo añado.*/
		if (fugitive.sex) {
			const sex = fugitive.sex[0].toUpperCase() + fugitive.sex.slice(1);
			datos += `<div class="sex">
						<b>Sex: </b>${sex}
					</div>`;
		}
		/*Si el fugitivo tiene edad la añado.*/
		if (fugitive.age_max && fugitive.age_min) {
			/*Si la edad máxima y la mínima coinciden, la añado.*/
			if (fugitive.age_max === fugitive.age_min) {
				datos += `<div class="age">
							<b>Age: </b>${fugitive.age_max}
						</div>`;
			/*De lo contrario establezco un rango y lo añado.*/
			} else {
				datos += `<div class="age">
							<b>Age: </b>From ${fugitive.age_min} to ${fugitive.age_max} years old
						</div>`;
			}
		}
		/*Si el fugitivo tiene detalles sobre el pelo los añado.*/
		if (fugitive.hair_raw) {
			datos += `<div class="hair">
						<b>Hair: </b>${fugitive.hair_raw}
					</div>`;
		}
		/*Si el fugitivo tiene detalles sobre los ojos los añado.*/
		if (fugitive.eyes_raw) {
			datos += `<div class="eyes">
						<b>Eyes: </b>${fugitive.eyes_raw}
					</div>`;
		}
		/*Mostraré los detalles del fugitivo si tiene, de lo contrario muestro sus cargos.*/
		if (fugitive.details != null) {
			info_medio = fugitive.details;
		} else {
			info_medio = fugitive.caution;
		}
		/*Muestro todo.*/
		const element = document.createRange().createContextualFragment(
			`<div class="datos">
                        	<div class="arriba">
                            	<div class="imagen_principal">
                                	<img src="${img}" alt="Fugitivo" onerror="this.onerror=null; this.src='ASSETS/img_aux.jpeg';">
                                </div>
                            	<div class="datos_importantes">
									${datos}
                            	</div>
                        	</div>
                        	<div class="medio">
        	                    <div class="titulo_medio">
                                	Details
                            	</div>
                            	<div class="info_medio">
                                    ${info_medio}
               	             </div>
                        	</div>
                        	<div class="abajo">
                            	${imagenes}
                        	</div>
                	</div>`
		);
		/*Añado la información del fugitivo.*/
		allFugitiveDetails.appendChild(element);
		/*Actualizo la visibilidad.*/
		visibilityUpdate();
	} catch (error) {
		console.error('Error al obtener la información del fugitivo:', error);
	}
	/*Añado el UID del fugitivo y establezco que se están mostrando los datos de un fugitivo al almacenamiento local.*/
	localStorage.setItem('selectedFugitiveUID', uid);
	localStorage.setItem('fugitiveDetailsVisible', 'true');
	/*Actualizo la visibilidad.*/
	visibilityUpdate();
}

/*Creación de la paginación.*/
function createPagination(currentPage, totalPages) {
	const paginationContainer = document.querySelector('#paginacion');
	/*Limpio los botones existentes.*/
	paginationContainer.innerHTML = '';

	/*Asigno el rango de páginas a mostrar antes y después de la página actual.*/
	const range = 2;
	let start;
	let end;
	/*Establezco el inicio y el final de los botones que se mostrarán.*/
	if (currentPage === 3 || currentPage + 2 === totalPages) {
		start = Math.max(currentPage - range, 2);
		end = Math.min(currentPage + range, totalPages - 1);
	} else if (currentPage === 2 || currentPage + 1 === totalPages) {
		start = Math.max(currentPage - range, 3);
		end = Math.min(currentPage + range, totalPages - 2);
	} else {
		start = Math.max(currentPage - range, 1);
		end = Math.min(currentPage + range, totalPages);
	}

	/*Botón para la primera página.*/
	if (currentPage > 1) {
		/*Llamada a la función para crear el botón correspondiente.*/
		const firstPageButton = createPageButton(1, currentPage);
		paginationContainer.appendChild(firstPageButton);
	}

	/*Botones para las páginas anteriores a la actual.*/
	for (let i = start; i < currentPage; i++) {
		if (currentPage !== 1 && currentPage !== 2 && currentPage !== 3 && i === start) {
			/*En caso de haber más botones de los mostrados desde el primer botón hasta la página actual se llamará a la función para mostrar unos puntos suspensivos.*/
			divMore(paginationContainer);
		}
		/*Llamada a la función para crear el botón correspondiente.*/
		const pageButton = createPageButton(i, currentPage);
		paginationContainer.appendChild(pageButton);
	}

	/*Botón para la página actual.*/
	/*Llamada a la función para crear el botón correspondiente.*/
	const currentPageButton = createPageButton(currentPage, currentPage);
	/*Deshabilito el botón de la página actual.*/
	currentPageButton.disabled = true;
	paginationContainer.appendChild(currentPageButton);

	/*Botones para las páginas siguientes a la actual.*/
	for (let i = currentPage + 1; i <= end; i++) {
		/*Llamada a la función para crear el botón correspondiente.*/
		const pageButton = createPageButton(i, currentPage);
		paginationContainer.appendChild(pageButton);
		if (currentPage + 3 !== totalPages && currentPage + 2 !== totalPages && currentPage + 1 !== totalPages && i === end) {
			/*En caso de haber más botones de los mostrados hasta mostrar el último botón de la paginación se llamará a la función para mostrar unos puntos suspensivos.*/
			divMore(paginationContainer);
		}
	}
	/*Botón de la última página.*/
	if (currentPage < totalPages) {
		/*Llamada a la función para crear el botón correspondiente.*/
		const lastPageButton = createPageButton(totalPages, currentPage);
		paginationContainer.appendChild(lastPageButton);
	}
}

/*Muestro un div con puntos suspensivos.*/
function divMore(paginationContainer) {
	const divMore = document.createElement('div');
	divMore.classList.add('divMore');
	divMore.textContent = '...';
	paginationContainer.appendChild(divMore);
}

/*Creo el botón de la página correspondiente.*/
function createPageButton(page, currentPage) {
	const button = document.createElement('button');
	button.textContent = page;
	button.addEventListener('click', function (event) {
		/*Prevengo la recarga de la página.*/
		event.preventDefault();
		/*Mantengo los filtros.*/
		const sex = filtroForm.sex.value;
		const hair = filtroForm.hair.value.toLowerCase();
		const eyes = filtroForm.eyes.value.toLowerCase();
		getFugitives(page, sex, hair, eyes);
	});
	/*Deshabilito el botón de la página actual.*/
	if (page === currentPage) {
		button.disabled = true;
	}
	return button;
}

document.addEventListener('DOMContentLoaded', () => {
	/*Selecciono los enlaces de Home.*/
	const homeLinks = document.querySelectorAll('.homeLink');
	/*Les añado un evento de click.*/
	homeLinks.forEach(function (homeLink) {
		homeLink.addEventListener('click', function (event) {
			/*Intercepto el comportamiento del enlace.*/
			event.preventDefault();
			/*Elimino el UID guardado.*/
			localStorage.removeItem('selectedFugitiveUID');
			/*Elimino el elemento que indica si se debe mostrar los detalles de un fugitivo o todos los fugitivos. Al hacer esto se mostrarán todos los fugitivos.*/
			localStorage.removeItem('fugitiveDetailsVisible');
			/*Recargo la página.*/
			location.reload();
		});
	});

	const filtroForm = document.getElementById('filtroForm');
	if (filtroForm) {
		filtroForm.addEventListener('submit', function (event) {
			/*Prevengo la recarga de la página.*/
			event.preventDefault();
			/*Obtengo los valores ingresados en los filtros.*/
			const sex = filtroForm.sex.value;
			const hair = filtroForm.hair.value.toLowerCase();
			const eyes = filtroForm.eyes.value.toLowerCase();
			/* Llamar a getFugitives con la página actual y los filtros aplicados*/
			getFugitives(1, sex, hair, eyes);
		});
	}

	const detallesVisibles = localStorage.getItem('fugitiveDetailsVisible') === 'true';
	const savedUID = localStorage.getItem('selectedFugitiveUID');

	/*Muestro los detalles de un fugitivo si hay un UID guardado y los detalles deben ser visibles.*/
	if (savedUID && detallesVisibles) {
		showFugitiveDetails(savedUID);
	} else {
		visibilityUpdate();
	}
	/*Carga inicial de los fugitivos.*/
	if (!savedUID || !detallesVisibles) {
		getFugitives(1);
	}
});

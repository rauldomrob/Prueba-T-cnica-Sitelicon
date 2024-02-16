from flask import Flask, request, jsonify
from flask_restful import Resource, Api
from datetime import datetime

app = Flask(__name__)
api = Api(app)

#Almacenamiento de usuarios y contactos
usuarios = {}
contactos = {}
usuario_id = 1
contacto_id = 1

#Clase usuario con operaciones CRUD
class Usuario(Resource):
    #Obtengo un usuario por su id
    def get(self, id):
        if id in usuarios:
            return usuarios[id]
        return {'message': 'Usuario no encontrado'}, 404

    #Creo un nuevo usuario
    def post(self):
        global usuario_id
        data = request.get_json()
        data['id'] = usuario_id
        #Convierto a formato ISO
        data['timestamps'] = datetime.now().isoformat()  
        usuarios[usuario_id] = data
        usuario_id += 1
        return usuarios[usuario_id - 1], 201

    #Actualizo un usuario
    def put(self, id):
        if id in usuarios:
            data = request.get_json()
            usuarios[id].update(data)
            return usuarios[id], 200
        return {'message': 'Usuario no encontrado'}, 404

    #Elimino un usuario
    def delete(self, id):
        if id in usuarios:
            del usuarios[id]
            return jsonify({'message': 'Usuario eliminado'}), 200
        return jsonify({'message': 'Usuario no encontrado'}), 404

#Clase contacto con operaciones CRUD
class Contact(Resource):
    #Obtengo un contacto por su id
    def get(self, id):
        if id in contactos:
            return contactos[id]
        return {'message': 'Contacto no encontrado'}, 404

    #Creo un nuevo contacto
    def post(self):
        global contacto_id
        data = request.get_json()
        data['id'] = contacto_id
        #Convierto a formato ISO
        data['timestamps'] = datetime.now().isoformat()
        contactos[contacto_id] = data
        contacto_id += 1
        return contactos[contacto_id - 1], 201

    #Actualizo un contacto
    def put(self, id):
        if id in contactos:
            data = request.get_json()
            contactos[id].update(data)
            return contactos[id], 200
        return {'message': 'Contacto no encontrado'}, 404

    #Elimino un contacto
    def delete(self, id):
        if id in contactos:
            del contactos[id]
            return {'message': 'Contacto eliminado'}, 200
        return {'message': 'Contacto no encontrado'}, 404

#Registro las rutas para la API
api.add_resource(Usuario, '/usuario', '/usuario/<int:id>')
api.add_resource(Contact, '/contacto', '/contacto/<int:id>')

#Ejecuto la aplicación en modo debug
if __name__ == '__main__':
    app.run(debug=True)
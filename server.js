var express = require("express");
const url = require('url');
var bodyParser = require("body-parser");
const Profesor = require('./profesores');
const passport = require('passport');

//swagger documentation config
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const path = require("path");

const swaggerSpec = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Api de Profesores",
            version: "1.0.0"
        },
        servers: [
            {
                url: "http://localhost:3000", 
                description: "Servidor de desarrollo en localhost"
            },
            {
                url: "https://api-usevilla-fis-2021-g4-juancarlosestradanieto.cloud.okteto.net/", 
                description: "Servidor de despliegue de Okteto"
            }
        ]
    },
    apis: [`${path.join(__dirname, "./server.js")}`]
};

require('./passport');

var BASE_API_PATH = "/api/v1";

var app = express();
app.use(bodyParser.json());
app.use(passport.initialize());

//swagger documentation config
app.use("/api-doc", swaggerUI.serve, swaggerUI.setup(swaggerJsDoc(swaggerSpec)));

/**
 * @swagger
 * components:
 *  schemas:
 *    Profesor:
 *      type: object
 *      properties:
 *        identificacion:
 *          type: string
 *          description: La identificación del profesor.
 *        nombre:
 *          type: string
 *          description: El nombre del profesor.
 *        password:
 *          type: string
 *          description: La contraseña del profesor.
 *        editable:
 *          type: boolean
 *          description: Si se puede o no editar profesor.
 *      required:
 *        - identificacion
 *        - nombre
 *        - password
 *      example:
 *        identificacion: 999999
 *        nombre: John Doe
 *        password: 123456
 *        editable: true
 * 
 * 
 *  securitySchemes:
 *    ApiKeyAuth:       # arbitrary name for the security scheme
 *      type: apiKey
 *      in: header       # can be "header", "query" or "cookie"
 *      name: apikey    # name of the header, query parameter or cookie
 *  
 *  responses:
 *    UnauthorizedError:
 *      description: API key es invalida o está ausente.
 *        
 */

/**
 * @swagger
 * /api/v1/initialize:
 *    get:
 *      summary: Crea o actualiza a sus valores por defecto al usuario director.
 *      tags: [Profesor]
 *      responses:
 *        401: 
 *          $ref: '#/components/responses/UnauthorizedError'
 *        500: 
 *          description: Error al intentar hacer el upsert.
 *        200: 
 *          description: Se ha configurado el profesor director.
 *      security:
 *        - ApiKeyAuth: []
 */
app.get(BASE_API_PATH+"/initialize", 
    passport.authenticate("localapikey", {session: false}), 
    (request, response) => {

        //inserción del director
        var identificacion = "000000";
        var profesorDirector = {
            "identificacion": identificacion,
            "nombre": "Director",
            "password": "123456",
            "editable": false
        };
        var filtro = {"identificacion": identificacion};

        Profesor.findOneAndUpdate(filtro, {$set: profesorDirector}, {upsert: true}, function(error, profesor) {
            if(error)
            {
                console.log(Date() + " - "+error);
                response.sendStatus(500);
            }
            else
            {
                response.statusMessage = "Se ha configurado el usuario director.";
                response.status(200).end();
                return response;
            }
        });

});

app.get("/", (request, response) => {
    response.send("<html><body><h1>My Server.</h1></body></html>");
});

app.get(BASE_API_PATH+"/healthz", (request, response) => {
    response.sendStatus(200);
});

/**
 * @swagger
 * /api/v1/profesores:
 *    get:
 *      summary: Retorna todos los profesores.
 *      tags: [Profesor]
 *      responses:
 *        401: 
 *          $ref: '#/components/responses/UnauthorizedError'
 *        500: 
 *          description: Error al intentar consultar los profesores.
 *        200: 
 *          description: Profesores consultados con éxito.
 *          content: 
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/Profesor'
 *      security:
 *        - ApiKeyAuth: []
 */
app.get(BASE_API_PATH+"/profesores",
    passport.authenticate("localapikey", {session: false}),
    (request, response) => {
    console.log(Date() + "GET - /profesores");

    Profesor.find({}, function(error, resultados) {
        if(error)
        {
            console.log(Date() + " - "+error);
            response.sendStatus(500);
        }
        else
        {
            response.send(resultados.map((profesor) => {
                return profesor.limpiar();
            }));
        }
    });
});


/**
 * @swagger
 * /api/v1/profesores/{id}:
 *    get:
 *      summary: Retorna un profesor al recibir un id válido.
 *      tags: [Profesor]
 *      parameters:
 *        - in: path
 *          name: id
 *          schema:
 *            type: string
 *          required: true
 *          description: Id del profesor.
 *      responses:
 *        401: 
 *          $ref: '#/components/responses/UnauthorizedError'
 *        500: 
 *          description: Error al intentar consultar el profesor.
 *        404: 
 *          description: Profesor no encontrado.
 *        200: 
 *          description: Profesor consultado con éxito.
 *          content: 
 *            application/json:
 *              schema:
 *                type: object
 *                $ref: '#/components/schemas/Profesor'
 *      security:
 *        - ApiKeyAuth: []
 */
//obtener un profesor por id
app.get(BASE_API_PATH+"/profesores/:id", 
    passport.authenticate("localapikey", {session: false}),
    (request, response) => {
    console.log(Date() + "GET - /profesores/"+request.params.id);

    Profesor.findById(request.params.id).then((profesor) => {
        if (!profesor) {
            return response.status(404).send();
        }
        response.send(profesor);
    })
    .catch((error) => {
        response.status(500).send(error);
    });
});

/**
 * @swagger
 * /api/v1/profesores.byIdentificacion/{identificacion}:
 *    get:
 *      summary: Retorna un profesor al recibir una identificación válida.
 *      tags: [Profesor]
 *      parameters:
 *        - in: path
 *          name: identificacion
 *          schema:
 *            type: string
 *          required: true
 *          description: Identificación del profesor.
 *      responses:
 *        401: 
 *          $ref: '#/components/responses/UnauthorizedError'
 *        500: 
 *          description: Error al intentar consultar el profesor.
 *        404: 
 *          description: Profesor no encontrado.
 *        200: 
 *          description: Profesor consultado con éxito.
 *          content: 
 *            application/json:
 *              schema:
 *                type: object
 *                $ref: '#/components/schemas/Profesor'
 *      security:
 *        - ApiKeyAuth: []
 */
//obtener un profesor por identificación
app.get(BASE_API_PATH+"/profesores.byIdentificacion/:identificacion", 
    passport.authenticate("localapikey", {session: false}),
    (request, response) => {
    console.log(Date() + "GET - /profesores.byIdentificacion/"+request.params.identificacion);

    Profesor.findOne({identificacion: request.params.identificacion}).then((profesor) => {
        if (!profesor) {
            return response.status(404).send();
        }
        response.send(profesor);
    })
    .catch((error) => {
        response.status(500).send(error);
    });
});


/**
 * @swagger
 * /api/v1/profesores:
 *    post:
 *      summary: Crea un nuevo profesor
 *      tags: [Profesor]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              $ref: '#/components/schemas/Profesor'
 *      responses:
 *        401: 
 *          $ref: '#/components/responses/UnauthorizedError'
 *        409: 
 *          description: La identificación ya está registrada.
 *        400: 
 *          description: Error al intentar crear el profesor.
 *        500: 
 *          description: Error al intentar crear el profesor.
 *        201: 
 *          description: Profesor creado.
 *      security:
 *        - ApiKeyAuth: []
 */

//el body llega vacío con postman pero funciona haciendo el post desde terminal
//curl -i -X POST "http://localhost:3000/api/v1/profesores" -H "Content-Type: application/json" -d "{\"identificacion\":\"444444\",\"nombre\":\"Perencejo\",\"editable\":true}"
app.post(BASE_API_PATH+"/profesores",
    passport.authenticate("localapikey", {session: false}),
    (request, response) => {
    console.log(Date() + "POST - /profesores");
    var profesor = request.body;
    // console.log("profesor");
    // console.log(profesor);

    Profesor.count({"identificacion": profesor.identificacion}, function (err, count) {
        //console.log(count);
        if(count > 0)
        {
            //response.sendStatus(500);
            //return response.status(409).send("La identificación ya está registrada.");
            //response.status(409);
            //return response.send("La identificación ya está registrada.");
            //return response.status(409).send('La identificación ya está registrada.');
            response.statusMessage = "La identificación ya está registrada.";
            response.status(409).end();
            return response;
        }
        else
        {
            Profesor.create(profesor, function(error) {
                if(error)
                {
                    console.log(Date() + " - "+error);

                    if(error.errors)
                    {
                        //console.log("error.errors");
                        //console.log(error.errors);
                        //console.log("error.message");
                        //console.log(error.message);
                        response.statusMessage = error.message;
                        response.status(400).end();
                        return response;
                    }

                    response.sendStatus(500);
                }
                else
                {
                    response.sendStatus(201);
                }
            });
        }
    });

});

/**
 * @swagger
 * /api/v1/profesores/{id}:
 *    patch:
 *      summary: Actualiza un profesor al recibir un id válido.
 *      tags: [Profesor]
 *      parameters:
 *        - in: path
 *          name: id
 *          schema:
 *            type: string
 *          required: true
 *          description: Id del profesor.
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              $ref: '#/components/schemas/Profesor'
 *      responses:
 *        401: 
 *          $ref: '#/components/responses/UnauthorizedError'
 *        500: 
 *          description: Error al intentar consultar el profesor.
 *        404: 
 *          description: Profesor no encontrado.
 *        409: 
 *          description: La identificación ya está registrada.
 *        200: 
 *          description: Profesor actualizado con éxito.
 *          content: 
 *            application/json:
 *              schema:
 *                type: object
 *                $ref: '#/components/schemas/Profesor'
 *      security:
 *        - ApiKeyAuth: []
 */
app.patch(BASE_API_PATH+"/profesores/:id", 
    passport.authenticate("localapikey", {session: false}),
    (request, response) => {
    console.log(Date() + "PATCH - /profesores");
    var id = request.params.id;
    var datos = request.body;
    // console.log("id "+id);
    // console.log("datos "+datos);

    Profesor.count({"identificacion": datos.identificacion, _id: { $ne: id }}, function (err, count) {
        // console.log(count);
        if(count > 0)
        {
            //return response.status(409).send({message: "No se pudo guardar el cambio. Existe otro profesor con esa identificación."});
            response.statusMessage = "No se pudo guardar el cambio. Existe otro profesor con esa identificación.";
            response.status(409).end();
            return response;
        }
        else
        {
            Profesor.findByIdAndUpdate(id, datos, {new: true})
            .then((profesor) => {
                if (!profesor) 
                {
                    return response.status(404).send();
                }
                response.send(profesor);
            })
            .catch((error) => {
                response.status(500).send(error);
            });
        }
    });

});

/**
 * @swagger
 * /api/v1/profesores/{id}:
 *    delete:
 *      summary: Elimina un profesor al recibir un id válido.
 *      tags: [Profesor]
 *      parameters:
 *        - in: path
 *          name: id
 *          schema:
 *            type: string
 *          required: true
 *          description: Id del profesor.
 *      responses:
 *        401: 
 *          $ref: '#/components/responses/UnauthorizedError'
 *        500: 
 *          description: Error al intentar consultar el profesor.
 *        404: 
 *          description: Profesor no encontrado.
 *        200: 
 *          description: Profesor eliminado con éxito.
 *          content: 
 *            application/json:
 *              schema:
 *                type: object
 *                $ref: '#/components/schemas/Profesor'
 *      security:
 *        - ApiKeyAuth: []
 */
//obtener un profesor por id
app.delete(BASE_API_PATH+"/profesores/:id",
    passport.authenticate("localapikey", {session: false}),
    (request, response) => {
    console.log(Date() + "DELETE - /profesores");
    // var profesor_id = request.params.id;
    // console.log("profesor_id");
    // console.log(profesor_id);

    Profesor.findByIdAndDelete(request.params.id).then((profesor) => {
        if (!profesor) {
            return response.status(404).send();
        }
        response.send(profesor);
    }).catch((error) => {
        response.status(500).send(error);
    });
});

module.exports = app;

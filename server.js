var express = require("express");
const url = require('url');
var bodyParser = require("body-parser");
const Profesor = require('./profesores');

var BASE_API_PATH = "/api/v1";

var app = express();
app.use(bodyParser.json());

app.get(BASE_API_PATH+"/initialize", (request, response) => {

    //inserción del director

    var identificacion = "000000";
    var profesorDirector = {
        "identificacion": identificacion,
        "nombre": "Director",
        "password": "123456",
        "editable": false
    };
    var filtro = {"identificacion": identificacion};

    Profesor.count(filtro, function (err, count) {
        console.log(count);
        if(count == 0)
        {
            Profesor.create(profesorDirector, function(error) {
                if(error)
                {
                    console.log(Date() + " - "+error);
        
                    if(error.errors)
                    {
                        response.statusMessage = error.message;
                        response.status(400).end();
                        return response;
                    }
        
                    response.sendStatus(500);
                }
                else
                {
                    response.statusMessage = "Se ha creado el usuario director.";
                    response.status(201).end();
                    return response;
                }
            });
        }
        else
        {
            response.statusMessage = "El director ya existe.";
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

app.get(BASE_API_PATH+"/profesores", (request, response) => {
    console.log(Date() + "GET - /profesores");

    const queryObject = url.parse(request.url,true).query;
    //console.log("queryObject");
    //console.log(queryObject);
    //console.log("queryObject.identificacion");
    //console.log(queryObject.identificacion);
    var identificacion = queryObject.identificacion;

    //console.log("request.url");
    //console.log(request.url);
    var filtros = {}
    
    if(typeof queryObject.identificacion !== 'undefined')
    {
        var filtros = {"identificacion": identificacion};
    }    

    Profesor.find(filtros, function(error, resultados) {
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

//obtener un profesor por id
app.get(BASE_API_PATH+"/profesores/:id", (request, response) => {
    console.log(Date() + "GET - /profesores/"+request.params.id);

    Profesor.findById(request.params.id).then((profesor) => {
        if (!profesor) {
            return response.status(404).send();
        }
        response.send(profesor);
    }).catch((error) => {
        response.status(500).send(error);
    });

});

//el body llega vacío con postman pero funciona haciendo el post desde terminal
//curl -i -X POST "http://localhost:3000/api/v1/profesores" -H "Content-Type: application/json" -d "{\"identificacion\":\"444444\",\"nombre\":\"Perencejo\",\"editable\":true}"
app.post(BASE_API_PATH+"/profesores", (request, response) => {
    console.log(Date() + "POST - /profesores");
    var profesor = request.body;
    console.log("profesor");
    console.log(profesor);

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

app.patch(BASE_API_PATH+"/profesores/:id", (request, response) => {
    console.log(Date() + "PATCH - /profesores");
    var id = request.params.id;
    var datos = request.body;
    console.log("id "+id);
    console.log("datos "+datos);

    Profesor.count({"identificacion": datos.identificacion, _id: { $ne: id }}, function (err, count) {
        console.log(count);
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

app.delete(BASE_API_PATH+"/profesores/:id", (request, response) => {
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

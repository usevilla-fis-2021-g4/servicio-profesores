var express = require("express");
var bodyParser = require("body-parser");
const Profesor = require('./profesores');
var cors = require('cors');

var BASE_API_PATH = "/api/v1";

var app = express();
app.use(bodyParser.json());
app.use(cors());

//INICIO CORS
// Add headers before the routes are defined
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
//FIN CORS

//inserción del director
var profesorDirector = {"identificacion": "000000", "nombre": "Paul Mccartney", "editable": false, password: "ElCuartetoDeNos"};
Profesor.count({"identificacion": "000000"}, function (err, count) {
    console.log(count);
    if(count == 0)Profesor.create(profesorDirector);
});

app.get("/", (request, response) => {
    response.send("<html><body><h1>My Server.</h1></body></html>");
});

app.get(BASE_API_PATH+"/healthz", (request, response) => {
    response.sendStatus(200);
});

app.get(BASE_API_PATH+"/profesores", (request, response) => {
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

//el body llega vacío con postman pero funciona haciendo el post desde terminal
//curl -i -X POST "http://localhost:3000/api/v1/profesores" -H "Content-Type: application/json" -d "{\"identificacion\":\"444444\",\"nombre\":\"Perencejo\",\"editable\":true}"
app.post(BASE_API_PATH+"/profesores", (request, response) => {
    console.log(Date() + "POST - /profesores");
    var profesor = request.body;
    // console.log("profesor");
    // console.log(profesor);

    Profesor.create(profesor, function(error) {
        if(error)
        {
            console.log(Date() + " - "+error);
            response.sendStatus(500);
        }
        else
        {
            response.sendStatus(201);
        }

    });
});

module.exports = app;
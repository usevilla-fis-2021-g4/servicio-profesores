var express = require("express");
var bodyParser = require("body-parser");
var DataStore = require("nedb");

var port = 3000;
var BASE_API_PATH = "/api/v1";
var DB_FILE_NAME = __dirname + "/profesores.json";

/*
var profesores = [    
    {"identificacion": "000000", "nombre": "Director", "editable": false},
    {"identificacion": "111111", "nombre": "Fulano", "editable": true},
    {"identificacion": "222222", "nombre": "Mengano", "editable": true},
    {"identificacion": "333333", "nombre": "Zutano", "editable": true}
];
*/

console.log("Starting API server...");

var app = express();
app.use(bodyParser.json());

var db = new DataStore({
    filename: DB_FILE_NAME,
    autoload: true
});

//inserción del diorector
var profesorDirector = {"identificacion": "000000", "nombre": "Director", "editable": false};
db.count({"identificacion": "000000"}, function (err, count) {
    console.log(count);
    if(count == 0)db.insert(profesorDirector);
});

app.get("/", (request, response) => {
    response.send("<html><body><h1>My Server.</h1></body></html>");
});

app.get(BASE_API_PATH+"/healthz", (request, response) => {
    response.sendStatus(200);
});

app.get(BASE_API_PATH+"/profesores", (request, response) => {
    console.log(Date() + "GET - /profesores");

    db.find({}, function(err, resultados) {
        if(err)
        {
            response.sendStatus(500);
        }
        else
        {
            response.send(resultados);
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

    db.insert(profesor, function(err, newDoc) {
        if(err)
        {
            console.log(Date() + " - "+err);
            response.sendStatus(500);
        }
        else
        {
            response.sendStatus(201);
        }

    });
});

app.listen(port);

console.log("Server ready!");
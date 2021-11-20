var express = require("express");
var bodyParser = require("body-parser");

var port = 3000;
var BASE_API_PATH = "/api/v1";

var profesores = [    
    {"identificacion": "000000", "nombre": "Director", "editable": false},
    {"identificacion": "111111", "nombre": "Fulano", "editable": true},
    {"identificacion": "222222", "nombre": "Mengano", "editable": true},
    {"identificacion": "333333", "nombre": "Zutano", "editable": true}
];

console.log("Starting API server...");

var app = express();

app.use(bodyParser.json());

app.get("/", (request, response) => {
    response.send("<html><body><h1>My Server.</h1></body></html>");
});

app.get(BASE_API_PATH+"/profesores", (request, response) => {
    console.log(Date() + "GET - /profesores");
    response.send(profesores);
});

//el body llega vacío con postman pero funciona haciendo el post desde terminal
//curl -i -X POST "http://localhost:3000/api/v1/profesores" -H "Content-Type: application/json" -d "{\"identificacion\":\"444444\",\"nombre\":\"Perencejo\",\"editable\":true}"
app.post(BASE_API_PATH+"/profesores", (request, response) => {
    console.log(Date() + "POST - /profesores");
    var profesor = request.body;
    console.log("profesor");
    console.log(profesor);
    
    profesores.push(profesor);
    response.sendStatus(201);
});

app.listen(port);

console.log("Server ready!");
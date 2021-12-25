const app = require("../server.js");
const request = require("supertest");
const Profesor = require('../profesores.js');

describe("Hello world test", () => {

    it("Should do a stupid test", () => {
        const a = 5;
        const b = 3;
        const sum = a + b;

        expect(sum).toBe(8);
    });
});

describe("Api Profesores", () => {
    describe("GET /", () => {
        it("Should return a html document", () => {

            return request(app).get("/").then((response) => {
                expect(response.status).toBe(200);
                expect(response.type).toEqual(expect.stringContaining("html"));
                expect(response.text).toEqual(expect.stringContaining("h1"));
            });

        });
    });

    describe("GET /profesores", () => {

        beforeAll(() => {

            var profesores = [
                new Profesor({
                    "identificacion": "000000",
                    "nombre": "Cero",
                    "password": "000000",
                    "editable": true
                })
                ,
                new Profesor({
                    "identificacion": "111111",
                    "nombre": "Uno",
                    "password": "111111",
                    "editable": true
                })
            ];

            // console.log("profesores");
            // console.log(profesores);

            dbFind = jest.spyOn(Profesor, "find");
            dbFind.mockImplementation((query, callback) => {
                callback(null, profesores);
            });
            
        });

        it("Should return all profesores", () => {
            return request(app).get("/api/v1/profesores").then((response) => {

                // console.log("response.body");
                // console.log(response.body);

                expect(response.statusCode).toBe(200);
                expect(response.body).toBeArrayOfSize(2);
                expect(dbFind).toBeCalledWith({}, expect.any(Function));
            });
        });
    });

    describe("POST /profesores", () => {

        let nuevoProfesor = {
            "identificacion": "111111",
            "nombre": "Uno",
            "password": "111111",
            "editable": true
        };

        let filtro = {"identificacion": "111111"};

        let dbCount, dbInsert;

        beforeEach(() => {

            //hubo que sobreescribir el método count también porque trataba de ejecutar el método real en el test y fallaba
            dbCount = jest.spyOn(Profesor, "count");
            dbInsert = jest.spyOn(Profesor, "create");
        });

        it("Should add a new profesor if everything is fine", () => {
            
            dbCount.mockImplementation((filtro, callback) => {
                callback(null, 0);
            });
            
            dbInsert.mockImplementation((profesor, callback) => {
                callback(null);
            });

            return request(app).post("/api/v1/profesores").send(nuevoProfesor).then((response) => {
                expect(response.statusCode).toBe(201);
                expect(dbInsert).toBeCalledWith(nuevoProfesor, expect.any(Function));
            });
            
        });

        it("Should return 500 code if there is a problem with the database", () => {
            
            dbCount.mockImplementation((filtro, callback) => {
                callback(null, 0);
            });
            
            dbInsert.mockImplementation((profesor, callback) => {
                callback(true);
            });

            return request(app).post("/api/v1/profesores").send(nuevoProfesor).then((response) => {
                expect(response.statusCode).toBe(500);
            });

        });

        it("Should return 409 code if the identificion is already registered", () => {
            
            dbCount.mockImplementation((filtro, callback) => {
                callback(null, 1);
            });
            
            dbInsert.mockImplementation((profesor, callback) => {
                callback(null);
            });

            return request(app).post("/api/v1/profesores").send(nuevoProfesor).then((response) => {
                expect(response.statusCode).toBe(409);
            });

        });

    });

});
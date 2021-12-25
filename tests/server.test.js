const app = require("../server.js");
const request = require("supertest");
const Profesor = require('../profesores.js');

//import { toBeArrayOfSize } from 'jest-extended';
//expect.extend({ toBeArrayOfSize });

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

            var profesor1 = {
                "identificacion": "000000",
                "nombre": "Cero",
                "password": "000000",
                "editable": false
            };
            profesor1["limpiar"] = function(){return profesor1;}; //hubo que agregarle el método porque daba problemas

            var profesor2 = {
                "identificacion": "111111",
                "nombre": "Uno",
                "password": "111111",
                "editable": true
            };
            profesor2["limpiar"] = function(){return profesor2;}; //hubo que agregarle el método porque daba problemas

            var profesores = [
                profesor1
                ,
                profesor2
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

});
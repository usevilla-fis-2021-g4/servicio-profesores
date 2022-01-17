const urlJoin = require("url-join");
const request = require("request-promise-native").defaults({json: true});

class EstudiantesResource
{
    static estudiantesUrl(host, recourceUrl)
    {
        //const estudiantesServer = (process.env.ESTUDIANTES_API_URL || "http://localhost:3000/apiestudiantes/v1");
        const estudiantesServer = host+"/apiestudiantes/v1";
        var urlResultante = urlJoin(estudiantesServer, recourceUrl);
        console.log("urlResultante");
        console.log(urlResultante);
        return urlResultante;
    }

    static requestHeaders()
    {
        const estudiantesKey = (process.env.ESTUDIANTES_APIKEY || "6382535d-52dc-4cd5-ab8b-425c9da7727e");
        return {
            apikey: estudiantesKey
        };
    }

    static getAllEstudiantes(host)
    {
        const url = EstudiantesResource.estudiantesUrl(host, "/estudiantes");
        const options = {
            headers: EstudiantesResource.requestHeaders()
        };

        return request.get(url, options);
    }
}

module.exports = EstudiantesResource;
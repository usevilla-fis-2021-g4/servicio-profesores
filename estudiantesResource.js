const urlJoin = require("url-join");
const request = require("request-promise-native").defaults({json: true});

class EstudiantesResource
{
    static estudiantesUrl(recourceUrl)
    {
        const estudiantesServer = (process.env.ESTUDIANTES_API_URL || "/apiestudiantes/v1");
        return urlJoin(estudiantesServer, recourceUrl);
    }

    static requestHeaders()
    {
        const estudiantesKey = (process.env.ESTUDIANTES_APIKEY || "6382535d-52dc-4cd5-ab8b-425c9da7727e");
        return {
            apikey: estudiantesKey
        };
    }

    static getAllEstudiantes()
    {
        const url = EstudiantesResource.estudiantesUrl("/estudiantes");
        const options = {
            headers: EstudiantesResource.requestHeaders()
        };

        return request.get(url, options);
    }
}

module.exports = EstudiantesResource;
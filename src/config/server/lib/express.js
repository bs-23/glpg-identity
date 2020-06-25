const path = require("path");
const hbs = require("express-hbs");
const express = require("express");
const config = require("../config")
const nodecache = require("./nodecache");
const cookieParser = require("cookie-parser");
const secretsManager = require('./secrets-manager');

const swagger = require('./swagger/swagger');
const swaggerUi = require("swagger-ui-express");

module.exports = async function () {
    let app = express();

    app.use(cookieParser());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static(path.join(process.cwd(), "wwwroot")));

    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swagger.specs));

    app.engine("html", hbs.express4({ extname: ".html" }));
    app.set("view engine", "html");
    app.set("views", path.join(process.cwd(), "src/modules/core/server"));

    app.set("port", process.env.PORT);

    const secrets = await secretsManager.getSecrets();

    for (const key in secrets) {
        if(secrets.hasOwnProperty(key)) {
            nodecache.setValue(key, secrets[key]);
        }
    }

    app.locals.jsFiles = config.client.js;
    app.locals.cssFiles = config.client.css;

    config.server.routes.forEach(function (routePath) {
        require(path.resolve(routePath))(app);
    });

    config.server.strategies.forEach(function (strategy) {
        require(path.resolve(strategy))();
    });

    return app;
};

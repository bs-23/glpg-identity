const path = require("path");
const hbs = require("express-hbs");
const express = require("express");
const config = require("../config");
const cookieParser = require("cookie-parser");

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

    const globalConfig = config.getGlobalConfig();

    app.locals.jsFiles = globalConfig.client.js;
    app.locals.cssFiles = globalConfig.client.css;

    globalConfig.server.routes.forEach(function (routePath) {
        require(path.resolve(routePath))(app);
    });

    globalConfig.server.strategies.forEach(function (strategy) {
        require(path.resolve(strategy))();
    });

    return app;
};

const path = require("path");
const hbs = require("express-hbs");
const express = require("express");
const config = require("../config");
const cookieParser = require("cookie-parser");

module.exports = function() {
    let app = express();

    app.use(cookieParser());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static(path.join(process.cwd(), "wwwroot")));

    app.engine("html", hbs.express4({ extname: ".html" }));
    app.set("view engine", "html");
    app.set("views", path.join(process.cwd(), "modules/core/server"));

    app.set("port", process.env.PORT);

    app.locals.jsFiles = config.client.js;
    app.locals.cssFiles = config.client.css;

    config.server.routes.forEach(function (routePath) {
        require(path.resolve(routePath))(app);
    });

    return app;
};

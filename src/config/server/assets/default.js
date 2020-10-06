module.exports = {
    client: {
        css: "wwwroot/bundles/app.css",
        js: "wwwroot/bundles/app.js"
    },
    server: {
        routes: [
            "src/modules/!(core)/server/**/*.routes.js",
            "src/modules/core/server/country/country.routes.js",
            "src/modules/core/server/**/*.routes.js",
            "src/modules/swagger/server/swagger.controller.js"
        ],
        strategies: [
            "src/modules/**/*.strategy.js",
            "src/config/server/lib/swagger/swagger.strategy.js"
        ]
    }
};

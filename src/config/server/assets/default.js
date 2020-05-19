module.exports = {
    client: {
        css: "wwwroot/bundles/app.css",
        js: "wwwroot/bundles/app.js"
    },
    server: {
        routes: ["src/modules/!(core)/server/**/*.routes.js", "src/modules/core/server/country.routes.js", "src/modules/core/server/**/*.routes.js"],
        strategies: ["src/modules/**/*.strategy.js"]
    }
}; 

module.exports = {
    client: {
        css: "wwwroot/bundles/app.css",
        js: "wwwroot/bundles/app.js"
    },
    server: {
        routes: ["modules/!(core)/server/**/*.routes.js", "modules/core/server/**/*.routes.js"],
        strategies: ["modules/**/*.strategy.js"]
    }
};

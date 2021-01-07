module.exports = {
    client: {
        css: "wwwroot/bundles/app.css",
        js: "wwwroot/bundles/app.js"
    },
    server: {
        routes: [
            "src/modules/partner/manage-partners/server/business-partner.routes.js",
            "src/modules/!(core)/server/**/*.routes.js",
            "src/modules/core/server/country/country.routes.js",
            "src/modules/core/server/filter/filter.routes.js",
            "src/modules/information/hcp/server/**/*.routes.js",
            "src/modules/platform/faq/server/**/*.routes.js",
            "src/modules/platform/application/server/**/*.routes.js",
            "src/modules/platform/user/server/**/*.routes.js",
            "src/modules/platform/role/server/**/*.routes.js",
            "src/modules/platform/profile/server/**/*.routes.js",
            "src/modules/platform/permission-set/server/**/*.routes.js",
            "src/modules/core/server/**/*.routes.js",
            "src/config/server/lib/swagger/swagger.controller.js"
        ],
        strategies: [
            "src/modules/**/*.strategy.js",
            "src/config/server/lib/swagger/swagger.strategy.js"
        ]
    }
};

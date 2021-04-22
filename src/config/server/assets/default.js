module.exports = {
    client: {
        css: "wwwroot/bundles/app.css",
        js: "wwwroot/bundles/app.js"
    },
    server: {
        routes: [
            "src/modules/partner/manage-partners/server/manage-partners.routes.js",
            "src/modules/partner/manage-requests/server/manage-requests.routes.js",
            "src/modules/!(core)/server/**/*.routes.js",
            "src/modules/core/server/country/country.routes.js",
            "src/modules/core/server/statistics/statistics.route.js",
            "src/modules/core/server/filter/filter.routes.js",
            "src/modules/core/server/localization/localization.routes.js",
            "src/modules/core/server/crdlp/crdlp.routes.js",
            "src/modules/information/hcp/server/**/*.routes.js",
            "src/modules/platform/faq/server/**/*.routes.js",
            "src/modules/platform/application/server/**/*.routes.js",
            "src/modules/platform/user/server/**/*.routes.js",
            "src/modules/platform/role/server/**/*.routes.js",
            "src/modules/platform/profile/server/**/*.routes.js",
            "src/modules/platform/permission-set/server/**/*.routes.js",
            "src/modules/privacy/manage-consent/server/**/*.routes.js",
            "src/modules/privacy/consent-country/server/**/*.routes.js",
            "src/modules/privacy/consent-category/server/**/*.routes.js",
            "src/modules/privacy/consent-performance/server/**/*.routes.js",
            "src/modules/privacy/consent-import/server/**/*.routes.js",
            "src/modules/core/server/**/*.routes.js",
            "src/config/server/lib/swagger/swagger.controller.js"
        ],
        strategies: [
            "src/modules/**/*.strategy.js",
            "src/config/server/lib/swagger/swagger.strategy.js"
        ]
    }
};

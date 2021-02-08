const path = require("path");
const controller = require('./consent-category.controller');
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/platform/user/server/user-authentication.middleware.js'));
const { Modules, Services } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.constants'));
const { ModuleGuard } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.middleware'));

module.exports = app => {
    app.route('/api/privacy/consent-categories')
        .get(CDPAuthStrategy,
            ModuleGuard([{
                serviceCategory: Modules.PRIVACY.value,
                services: { exclude: Services.CONSENT_PERFORMANCE.value }
            }]),
            controller.getConsentCategories)
        .post(CDPAuthStrategy, ModuleGuard([Services.CONSENT_CATEGORY.value]), controller.createConsentCategory);

    app.route('/api/privacy/consent-categories/:id')
        .get(CDPAuthStrategy, ModuleGuard([Services.CONSENT_CATEGORY.value]), controller.getConsentCategory)
        .put(CDPAuthStrategy, ModuleGuard([Services.CONSENT_CATEGORY.value]), controller.updateConsentCategory);
};

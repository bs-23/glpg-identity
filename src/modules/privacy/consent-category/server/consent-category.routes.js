const path = require("path");
const controller = require('./consent-category.controller');
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/platform/user/server/user-authentication.middleware.js'));
const { Services } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.constants'));
const { ServiceGuard } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.middleware'));

module.exports = app => {
    app.route('/api/privacy/consent-categories')
        .get(CDPAuthStrategy, ServiceGuard([Services.CONSENT_CATEGORY, Services.MANAGE_CONSENT, Services.CONSENT_COUNTRY]), controller.getConsentCategories)
        .post(CDPAuthStrategy, ServiceGuard([Services.CONSENT_CATEGORY]), controller.createConsentCategory);

    app.route('/api/privacy/consent-categories/:id')
        .get(CDPAuthStrategy, ServiceGuard([Services.CONSENT_CATEGORY]), controller.getConsentCategory)
        .put(CDPAuthStrategy, ServiceGuard([Services.CONSENT_CATEGORY]), controller.updateConsentCategory);
};

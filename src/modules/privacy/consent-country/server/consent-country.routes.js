const path = require("path");
const controller = require('./consent-country.controller');
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/platform/user/server/user-authentication.middleware.js'));
const { Services } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.constants'));
const { ServiceGuard } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.middleware'));

module.exports = app => {
    app.route('/api/consent/country')
        .get(CDPAuthStrategy, ServiceGuard([Services.CONSENT_COUNTRY]), controller.getCountryConsents)
        .post(CDPAuthStrategy, ServiceGuard([Services.CONSENT_COUNTRY]), controller.assignConsentToCountry);

    app.route('/api/consent/country/:id')
        .put(CDPAuthStrategy, ServiceGuard([Services.CONSENT_COUNTRY]), controller.updateCountryConsent)
        .delete(CDPAuthStrategy, ServiceGuard([Services.CONSENT_COUNTRY]), controller.deleteCountryConsent);
};

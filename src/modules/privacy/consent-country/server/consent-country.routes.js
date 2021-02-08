const path = require("path");
const controller = require('./consent-country.controller');
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/platform/user/server/user-authentication.middleware.js'));
const { Modules, Services } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.constants'));
const { ModuleGuard } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.middleware'));

module.exports = app => {
    app.route('/api/consent/country')
        .get(CDPAuthStrategy, ModuleGuard([Services.CONSENT_COUNTRY.value]), controller.getCountryConsents)
        .post(CDPAuthStrategy, ModuleGuard([Services.CONSENT_COUNTRY.value]), controller.assignConsentToCountry);

    app.route('/api/consent/country/:id')
        .put(CDPAuthStrategy, ModuleGuard([Services.CONSENT_COUNTRY.value]), controller.updateCountryConsent)
        .delete(CDPAuthStrategy, ModuleGuard([Services.CONSENT_COUNTRY.value]), controller.deleteCountryConsent);
};

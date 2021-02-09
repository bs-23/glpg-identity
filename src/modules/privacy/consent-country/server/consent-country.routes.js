const path = require("path");
const controller = require('./consent-country.controller');
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/platform/user/server/user-authentication.middleware.js'));
const { Modules } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.constants'));
const { ModuleGuard } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.middleware'));

module.exports = app => {
    app.route('/api/consent/country')
        .get(CDPAuthStrategy, ModuleGuard(Modules.PRIVACY.value), controller.getCountryConsents)
        .post(CDPAuthStrategy, ModuleGuard(Modules.PRIVACY.value), controller.assignConsentToCountry);

    app.route('/api/consent/country/:id')
        .put(CDPAuthStrategy, ModuleGuard(Modules.PRIVACY.value), controller.updateCountryConsent)
        .delete(CDPAuthStrategy, ModuleGuard(Modules.PRIVACY.value), controller.deleteCountryConsent);
};

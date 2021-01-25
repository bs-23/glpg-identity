const path = require("path");
const controller = require('./consent-country.controller');
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/platform/user/server/user-authentication.middleware.js'));

module.exports = app => {
    app.route('/api/consent/country')
        .get(CDPAuthStrategy, controller.getCountryConsents)
        .post(CDPAuthStrategy, controller.assignConsentToCountry);

    app.route('/api/consent/country/:id')
        .put(CDPAuthStrategy, controller.updateCountryConsent)
        .delete(CDPAuthStrategy, controller.deleteCountryConsent);
};

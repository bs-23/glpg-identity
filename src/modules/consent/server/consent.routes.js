const passport = require('passport');
const path = require("path");
const controller = require('./consent.controller');
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/user/server/user-authentication.middleware.js'));

module.exports = app => {
    app.route('/api/consents')
        .get(passport.authenticate('application-jwt', { session: false }), controller.getConsents);

    app.route('/api/consent-performance-report')
        .get(CDPAuthStrategy, controller.getConsentsReport);

    app.route('/api/datasync-consent-performance-report')
        .get(CDPAuthStrategy, controller.getDatasyncConsentsReport);

    app.route('/api/get-all-process-activities')
        .get(CDPAuthStrategy, controller.getAllProcessActivities);

    app.route('/api/get-all-opt-types')
        .get(CDPAuthStrategy, controller.getAllOptTypes);

    app.route('/api/consents/:id')
        .get(CDPAuthStrategy, controller.getUserConsents);

    app.route('/api/cdp-consents/:id')
        .get(CDPAuthStrategy, controller.getCdpConsent)
        .put(CDPAuthStrategy, controller.updateCdpConsent)
        .delete(CDPAuthStrategy, controller.deleteCdpConsent);

    app.route('/api/cdp-consents')
        .get(CDPAuthStrategy, controller.getCdpConsents)
        .post(CDPAuthStrategy, controller.createConsent);

    app.route('/api/consent/country')
        .get(CDPAuthStrategy, controller.getCountryConsents)
        .post(CDPAuthStrategy, controller.assignConsentToCountry);

    app.route('/api/consent/country/:id')
        .put(CDPAuthStrategy, controller.updateCountryConsent)
        .delete(CDPAuthStrategy, controller.deleteCountryConsent);

    app.route('/api/consent/category')
        .get(CDPAuthStrategy, controller.getConsentCatogories);

    app.route('/api/privacy/consent-preferences')
        .get(CDPAuthStrategy, controller.getConsentPreferences)
        .post(CDPAuthStrategy, controller.createConsentPreference);

    app.route('/api/privacy/consent-preferences/:id')
        .get(CDPAuthStrategy, controller.getConsentPreference)
        .put(CDPAuthStrategy, controller.updateConsentPreference);
};

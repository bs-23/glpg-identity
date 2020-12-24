const passport = require('passport');
const path = require("path");
const controller = require('./consent.controller');
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/platform/user/server/user-authentication.middleware.js'));

module.exports = app => {
    app.route('/api/consents')
        .get(passport.authenticate('application-jwt', { session: false }), controller.getConsents);

    app.route('/api/cdp-consent-performance-report')
        .get(CDPAuthStrategy, controller.getCdpConsentsReport);

    app.route('/api/veeva-consent-performance-report')
        .get(CDPAuthStrategy, controller.getVeevaConsentsReport);

    app.route('/api/get-all-process-activities')
        .get(CDPAuthStrategy, controller.getAllProcessActivities);

    app.route('/api/consents/:id')
        .get(CDPAuthStrategy, controller.getUserConsents);

    app.route('/api/cdp-consents/:id')
        .get(CDPAuthStrategy, controller.getCdpConsent)
        .put(CDPAuthStrategy, controller.updateCdpConsent);

    app.route('/api/cdp-consents')
        .get(CDPAuthStrategy, controller.getCdpConsents)
        .post(CDPAuthStrategy, controller.createConsent);

    app.route('/api/consent/country')
        .get(CDPAuthStrategy, controller.getCountryConsents)
        .post(CDPAuthStrategy, controller.assignConsentToCountry);

    app.route('/api/consent/country/:id')
        .put(CDPAuthStrategy, controller.updateCountryConsent)
        .delete(CDPAuthStrategy, controller.deleteCountryConsent);

    app.route('/api/privacy/consent-categories')
        .get(CDPAuthStrategy, controller.getConsentCategories)
        .post(CDPAuthStrategy, controller.createConsentCategory);

    app.route('/api/privacy/consent-categories/:id')
        .get(CDPAuthStrategy, controller.getConsentCategory)
        .put(CDPAuthStrategy, controller.updateConsentCategory);
};

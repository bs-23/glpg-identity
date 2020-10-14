const passport = require('passport');
const path = require("path");
const controller = require('./consent.controller');
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.middleware'));

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

    app.route('/api/cdp-consents')
        .get(CDPAuthStrategy, controller.getCdpConsents);

    app.route('/api/consent/country')
        .post(CDPAuthStrategy, controller.assignConsentToCountry);

    app.route('/api/consent/category')
        .get(CDPAuthStrategy, controller.getConsentCatogories);
};

const passport = require('passport');
const controller = require('./consent.controller');

module.exports = app => {
    app.route('/api/consents')
        .get(passport.authenticate('application-jwt', { session: false }), controller.getConsents);

    app.route('/api/consent-performance-report')
        .get(passport.authenticate('user-jwt', { session: false }), controller.getConsentsReport);

    app.route('/api/datasync-consent-performance-report')
        .get(passport.authenticate('user-jwt', { session: false }), controller.getDatasyncConsentsReport);

    app.route('/api/get-all-process-activities')
        .get(passport.authenticate('user-jwt', { session: false }), controller.getAllProcessActivities);

    app.route('/api/get-all-opt-types')
        .get(passport.authenticate('user-jwt', { session: false }), controller.getAllOptTypes);

    app.route('/api/consents/:id')
        .get(passport.authenticate('user-jwt', { session: false }), controller.getUserConsents);

    app.route('/api/cdp-consents')
        .get(passport.authenticate('user-jwt', { session: false }), controller.getCdpConsents);

    app.route('/api/consent/country')
        .post(passport.authenticate('user-jwt', { session: false }), controller.assignConsentToCountry);
};

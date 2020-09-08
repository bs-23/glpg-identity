const passport = require('passport');
const controller = require('./consent.controller');

module.exports = app => {
    app.route('/api/consents')
        .get(passport.authenticate('application-jwt', { session: false }), controller.getConsents);
    
    app.route('/api/consent-performance-report')
        .get(passport.authenticate('user-jwt', { session: false }), controller.generateReport);
};

const controller = require('./application.controller');
const passport = require('passport');

module.exports = app => {
    app.post('/api/applications/generate-token', controller.getAccessToken);
    app.route('/api/applications')
        .get(passport.authenticate('user-jwt', { session: false }), controller.getApplications);
};

const passport = require('passport');
const controller = require('./application.controller');

module.exports = app => {
    app.post('/api/applications/generate-token', controller.getAccessToken);

    app.route('/api/applications')
        .get(passport.authenticate('user-jwt', { session: false }), controller.getApplications);
};

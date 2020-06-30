const passport = require('passport');
const controller = require('./hcp.controller');

module.exports = app => {
    app.route('/api/hcps')
        .get(passport.authenticate('user-jwt', { session: false }), controller.getHcps)

    app.route('/api/hcps/:id')
        .put(passport.authenticate('user-jwt', { session: false }), controller.editHcp);

    app.route('/api/hcp-profiles/verify')
        .post(passport.authenticate('application-jwt', { session: false }), controller.verifyHcpProfile);

    app.route('/api/hcp-profiles/reset-password')
        .put(passport.authenticate('application-jwt', { session: false }), controller.resetHcpPassword);
};

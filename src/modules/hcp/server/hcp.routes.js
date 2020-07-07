const passport = require('passport');
const controller = require('./hcp.controller');

module.exports = app => {
    app.route('/api/hcps')
        .get(passport.authenticate('user-jwt', { session: false }), controller.getHcps)

    app.route('/api/hcps/:id')
        .put(passport.authenticate('user-jwt', { session: false }), controller.editHcp);

    app.route('/api/hcp-profiles/lookup')
        .post(passport.authenticate('application-jwt', { session: false }), controller.lookupHcpProfile);

    app.route('/api/hcp-profiles')
        .post(passport.authenticate('application-jwt', { session: false }), controller.createHcpProfile);

    app.route('/api/hcp-profiles/forget-password')
        .get(passport.authenticate('application-jwt', { session: false }), controller.forgetPassword);

    app.route('/api/hcp-profiles/reset-password')
        .put(passport.authenticate('application-jwt', { session: false }), controller.resetPassword);

    app.route('/api/hcp-profiles/change-password')
        .put(passport.authenticate('application-jwt', { session: false }), controller.changePassword);

    app.route('/api/hcp-profiles/specialities')
        .get(passport.authenticate('application-jwt', { session: false }), controller.getSpecialities);

    app.route('/api/hcp-profiles/:id')
        .get(passport.authenticate('application-jwt', { session: false }), controller.getHcpProfile);
};

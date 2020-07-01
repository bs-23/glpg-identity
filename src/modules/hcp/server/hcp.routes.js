const passport = require('passport');
const controller = require('./hcp.controller');

module.exports = app => {
    app.route('/api/hcps')
        .get(passport.authenticate('user-jwt', { session: false }), controller.getHcps)

    app.route('/api/hcps/:id')
        .put(passport.authenticate('user-jwt', { session: false }), controller.editHcp);

    app.route('/api/hcp-profiles/create')
        .post(passport.authenticate('application-jwt', { session: false }), controller.createHcpUser);

    app.route('/api/hcp-profiles/master-details')
        .post(passport.authenticate('application-jwt', { session: false }), controller.checkHcpFromMaster);

    app.route('/api/hcp-profiles/reset-password')
        .put(passport.authenticate('application-jwt', { session: false }), controller.resetHcpPassword);
};

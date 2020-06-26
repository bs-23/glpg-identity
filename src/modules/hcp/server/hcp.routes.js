const passport = require('passport');
const controller = require('./hcp.controller');

module.exports = app => {
    app.route('/api/hcps')
        .post(passport.authenticate('user-jwt', { session: false }), controller.getHcps)

    app.route('/api/hcps/:id')
        .put(passport.authenticate('user-jwt', { session: false }), controller.editHcp);

    app.route('/api/hcpsProfile')
        .get(passport.authenticate('user-jwt', { session: false }), controller.getHcpsById);

    app.route('/api/resetHcpsPassword')
        .post(passport.authenticate('user-jwt', { session: false }), controller.resetHcpPassword);
};

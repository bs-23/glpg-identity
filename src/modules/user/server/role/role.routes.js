const passport = require('passport');
const controller = require('./role.controller');

module.exports = app => {
    app.route('/api/roles')
        .get(passport.authenticate('user-jwt', { session: false }), controller.getRoles)
        .post(passport.authenticate('user-jwt', { session: false }), controller.createRole);
};

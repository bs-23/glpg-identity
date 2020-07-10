const passport = require('passport');
const controller = require('./permission.controller');

module.exports = app => {
    app.route('/api/permissions')
        .get(passport.authenticate('user-jwt', { session: false }), controller.getPermissions);
};

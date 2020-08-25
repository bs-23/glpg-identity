const passport = require('passport');
const controller = require('./permission-set.controller');

module.exports = app => {
    app.route('/api/permissionSets')
        .get(passport.authenticate('user-jwt', { session: false }), controller.getPermissionSets)
        .post(passport.authenticate('user-jwt', { session: false }), controller.createPermissionSet);

    app.route('/api/permissionSets/:id')
        .put(passport.authenticate('user-jwt', { session: false }), controller.editPermissionSet);
};

const passport = require('passport');
const path = require('path');
const controller = require('./permission-set.controller');
const { Services } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.constants'));
const { ServiceGuard } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.middleware'));

module.exports = app => {
    app.route('/api/permissionSets')
        .get(passport.authenticate('user-jwt', { session: false }), ServiceGuard([Services.MANAGE_PERMISSION_SETS]), controller.getPermissionSets)
        .post(passport.authenticate('user-jwt', { session: false }), ServiceGuard([Services.MANAGE_PERMISSION_SETS]), controller.createPermissionSet);

    app.route('/api/permissionSets/:id')
        .get(passport.authenticate('user-jwt', { session: false }), ServiceGuard([Services.MANAGE_PERMISSION_SETS]), controller.getPermissionSet)
        .put(passport.authenticate('user-jwt', { session: false }), ServiceGuard([Services.MANAGE_PERMISSION_SETS]), controller.editPermissionSet);
};

const passport = require('passport');
const path = require('path');
const controller = require('./permission-set.controller');
const { Modules } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.constants'));
const { ModuleGuard } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.middleware'));

module.exports = app => {
    app.route('/api/permissionSets')
        .get(passport.authenticate('user-jwt', { session: false }), ModuleGuard(Modules.PLATFORM.value), controller.getPermissionSets)
        .post(passport.authenticate('user-jwt', { session: false }), ModuleGuard(Modules.PLATFORM.value), controller.createPermissionSet);

    app.route('/api/permissionSets/:id')
        .get(passport.authenticate('user-jwt', { session: false }), ModuleGuard(Modules.PLATFORM.value), controller.getPermissionSet)
        .put(passport.authenticate('user-jwt', { session: false }), ModuleGuard(Modules.PLATFORM.value), controller.editPermissionSet);
};

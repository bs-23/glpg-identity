const passport = require('passport');
const path = require('path');
const { Modules } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.constants'));
const { ModuleGuard } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.middleware'));
const controller = require('./role.controller');

module.exports = app => {
    app.route('/api/roles')
        .get(passport.authenticate('user-jwt', { session: false }), ModuleGuard(Modules.USER.value),controller.getRoles)
        .post(passport.authenticate('user-jwt', { session: false }), ModuleGuard(Modules.USER.value),controller.createRole);
    app.route('/api/roles/:id')
        .put(passport.authenticate('user-jwt', { session: false }), ModuleGuard(Modules.USER.value),controller.editRole);
};

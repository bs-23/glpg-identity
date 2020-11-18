const path = require('path');
const { Modules } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.constants'));
const { ModuleGuard } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.middleware'));
const controller = require('./role.controller');
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/user/server/user-authentication.middleware.js'));

module.exports = app => {
    app.route('/api/roles')
        .get(CDPAuthStrategy, ModuleGuard(Modules.PLATFORM.value),controller.getRoles)
        .post(CDPAuthStrategy, ModuleGuard(Modules.PLATFORM.value),controller.createRole);
    app.route('/api/roles/:id')
        .put(CDPAuthStrategy, ModuleGuard(Modules.PLATFORM.value),controller.editRole);
};

const path = require('path');
const { Modules, Services } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.constants'));
const { ModuleGuard } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.middleware'));
const controller = require('./role.controller');
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/platform/user/server/user-authentication.middleware.js'));

module.exports = app => {
    app.route('/api/roles')
        .get(CDPAuthStrategy, ModuleGuard([Services.MANAGE_ROLE.value]),controller.getRoles)
        .post(CDPAuthStrategy, ModuleGuard([Services.MANAGE_ROLE.value]),controller.createRole);
    app.route('/api/roles/:id')
        .put(CDPAuthStrategy, ModuleGuard([Services.MANAGE_ROLE.value]),controller.editRole);
};

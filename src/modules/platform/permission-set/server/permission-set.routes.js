const passport = require('passport');
const path = require('path');
const controller = require('./permission-set.controller');
const { Services } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.constants'));
const { ServiceGuard } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.middleware'));
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/platform/user/server/user-authentication.middleware.js'));

module.exports = app => {
    app.route('/api/permissionSets')
        .get(CDPAuthStrategy, ServiceGuard([Services.MANAGE_PERMISSION_SETS, Services.MANAGE_PROFILE, Services.MANAGE_ROLE]), controller.getPermissionSets)
        .post(CDPAuthStrategy, ServiceGuard([Services.MANAGE_PERMISSION_SETS]), controller.createPermissionSet);

    app.route('/api/permissionSets/:id')
        .get(CDPAuthStrategy, ServiceGuard([Services.MANAGE_PERMISSION_SETS, Services.MANAGE_PROFILE, Services.MANAGE_ROLE, Services.MANAGE_USER]), controller.getPermissionSet)
        .put(CDPAuthStrategy, ServiceGuard([Services.MANAGE_PERMISSION_SETS]), controller.editPermissionSet);
};

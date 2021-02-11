const path = require('path');
const { Services } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.constants'));
const { ServiceGuard } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.middleware'));
const controller = require('./role.controller');
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/platform/user/server/user-authentication.middleware.js'));

module.exports = app => {
    app.route('/api/roles')
        .get(CDPAuthStrategy, ServiceGuard([Services.MANAGE_ROLE]),controller.getRoles)
        .post(CDPAuthStrategy, ServiceGuard([Services.MANAGE_ROLE]),controller.createRole);
    app.route('/api/roles/:id')
        .put(CDPAuthStrategy, ServiceGuard([Services.MANAGE_ROLE]),controller.editRole);
};

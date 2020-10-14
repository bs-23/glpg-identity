const path = require("path");
const controller = require('./permission.controller');
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.middleware'));

module.exports = app => {
    app.route('/api/permissions')
        .get(CDPAuthStrategy, controller.getPermissions);
};

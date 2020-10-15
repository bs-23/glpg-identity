const path = require("path");
const controller = require('./permission.controller');
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/user/server/user-authentication.middleware.js'));

module.exports = app => {
    app.route('/api/permissions')
        .get(CDPAuthStrategy, controller.getPermissions);
};

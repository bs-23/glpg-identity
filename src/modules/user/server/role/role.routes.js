const path = require("path");
const controller = require('./role.controller');
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.middleware'));

module.exports = app => {
    app.route('/api/roles')
        .get(CDPAuthStrategy, controller.getRoles)
        .post(CDPAuthStrategy, controller.createRole);

    app.route('/api/roles/:id')
        .put(CDPAuthStrategy, controller.editRole);
};

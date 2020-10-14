const path = require("path");
const controller = require('./application.controller');
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.middleware'));

module.exports = app => {
    app.post('/api/applications/token', controller.getToken);

    app.route('/api/applications')
        .get(CDPAuthStrategy, controller.getApplications);
};

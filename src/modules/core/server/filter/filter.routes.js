const path = require('path');
const controller = require('./filter.controller');
const { Modules } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.constants'));
const { ModuleGuard } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.middleware'));
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/platform/user/server/user-authentication.middleware.js'));

module.exports = app => {

    app.route('/api/filter')
        .get(CDPAuthStrategy, controller.getFilterOptions)
        .post(CDPAuthStrategy, controller.updateFilterOptions);

};

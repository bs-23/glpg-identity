const path = require('path');
const controller = require('./okla.controller');
const { Modules } = require('../../../core/server/authorization/authorization.constants');
const { ModuleGuard } = require('../../../core/server/authorization/authorization.middleware');
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/platform/user/server/user-authentication.middleware.js'));

module.exports = app => {
    app.route('/api/okla/hcps/search')
        .post(CDPAuthStrategy, ModuleGuard(Modules.INFORMATION.value), controller.searchOklaHcps);

    app.route('/api/okla/hcps/:codbase/:id')
        .get(CDPAuthStrategy, ModuleGuard(Modules.INFORMATION.value), controller.getOklaHcpDetails);

    app.route('/api/okla/hcos/search')
        .post(CDPAuthStrategy, ModuleGuard(Modules.INFORMATION.value), controller.searchOklaHcos);

    app.route('/api/okla/hcos/:codbase/:id')
        .get(CDPAuthStrategy, ModuleGuard(Modules.INFORMATION.value), controller.getOklaHcoDetails);
};

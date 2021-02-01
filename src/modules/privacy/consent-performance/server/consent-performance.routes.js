const path = require("path");
const controller = require('./consent-performance.controller');
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/platform/user/server/user-authentication.middleware.js'));
const { Modules } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.constants'));
const { ModuleGuard } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.middleware'));

module.exports = app => {
    app.route('/api/cdp-consent-performance-report')
        .get(CDPAuthStrategy, ModuleGuard(Modules.PRIVACY.value), controller.getCdpConsentsReport);

    app.route('/api/veeva-consent-performance-report')
        .get(CDPAuthStrategy, ModuleGuard(Modules.PRIVACY.value), controller.getVeevaConsentsReport);
};

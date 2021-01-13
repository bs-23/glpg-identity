const passport = require('passport');
const path = require("path");
const controller = require('./manage-partners.controller');
const { Modules } = require('../../../core/server/authorization/authorization.constants');
const { ModuleGuard } = require('../../../core/server/authorization/authorization.middleware');
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/platform/user/server/user-authentication.middleware.js'));

module.exports = app => {
    app.route('/api/partner/hcp')
        .get(CDPAuthStrategy, ModuleGuard(Modules.INFORMATION.value), controller.getHcpPartners)
        .post(passport.authenticate('application-jwt', { session: false }), controller.createHcpPartner);

    app.route('/api/partner/hcp/:id')
        .put(CDPAuthStrategy, ModuleGuard(Modules.INFORMATION.value), controller.updateHcpPartner);

    app.route('/api/partner/hco')
        .get(CDPAuthStrategy, ModuleGuard(Modules.INFORMATION.value), controller.getHcoPartners)
        .post(passport.authenticate('application-jwt', { session: false }), controller.createHcoPartner);

    app.route('/api/partner/hco/:id')
        .put(CDPAuthStrategy, ModuleGuard(Modules.INFORMATION.value), controller.updateHcoPartner);
};

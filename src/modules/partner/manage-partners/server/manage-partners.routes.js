const passport = require('passport');
const path = require("path");
const controller = require('./manage-partners.controller');
const { Modules } = require('../../../core/server/authorization/authorization.constants');
const { ModuleGuard } = require('../../../core/server/authorization/authorization.middleware');
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/platform/user/server/user-authentication.middleware.js'));
const multer = require(path.join(process.cwd(), 'src/config/server/lib/multer'));

module.exports = app => {
    app.route('/api/partner/hcp')
        .get(CDPAuthStrategy, ModuleGuard(Modules.INFORMATION.value), controller.getPartnerHcps)
        .post(passport.authenticate('application-jwt', { session: false }), multer.array('documents', 5), controller.createPartnerHcp);

    app.route('/api/partner/hcp/:id')
        .get(CDPAuthStrategy, ModuleGuard(Modules.INFORMATION.value), controller.getPartnerHcp)
        .put(CDPAuthStrategy, ModuleGuard(Modules.INFORMATION.value), controller.updatePartnerHcp);

    app.route('/api/partner/hco')
        .get(CDPAuthStrategy, ModuleGuard(Modules.INFORMATION.value), controller.getPartnerHcos)
        .post(passport.authenticate('application-jwt', { session: false }), multer.array('documents', 5), controller.createPartnerHco);

    app.route('/api/partner/hco/:id')
        .get(CDPAuthStrategy, ModuleGuard(Modules.INFORMATION.value), controller.getPartnerHco)
        .put(CDPAuthStrategy, ModuleGuard(Modules.INFORMATION.value), controller.updatePartnerHco);

    app.route('/api/partner/vendor')
        .get(CDPAuthStrategy, ModuleGuard(Modules.INFORMATION.value), controller.getPartnerVendors)
        .post(passport.authenticate('application-jwt', { session: false }), multer.array('documents', 5), controller.createPartnerVendor);

    app.route('/api/partner/vendor/:id')
        .get(CDPAuthStrategy, ModuleGuard(Modules.INFORMATION.value), controller.getPartnerVendor);
};

const passport = require('passport');
const path = require('path');
const controller = require('./manage-partners.controller');
const { partnerHcpSchema, partnerHcoSchema, partnerVendorSchema, validateFile } = require('./partner.schema');
const { validate } = require(path.join(process.cwd(), 'src/modules/core/server/middlewares/validator.middleware'));
const { Modules } = require('../../../core/server/authorization/authorization.constants');
const { ModuleGuard } = require('../../../core/server/authorization/authorization.middleware');
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/platform/user/server/user-authentication.middleware.js'));
const multer = require(path.join(process.cwd(), 'src/config/server/lib/multer'));

module.exports = app => {
    app.route('/api/partner/hcp')
        .get(CDPAuthStrategy, ModuleGuard(Modules.INFORMATION.value), controller.getPartnerHcps)
        .post(passport.authenticate('application-jwt', { session: false }), validateFile(multer.array('documents', 5)), validate(partnerHcpSchema), controller.createPartnerHcp);

    app.route('/api/partner/hcp/:id')
        .get(CDPAuthStrategy, ModuleGuard(Modules.INFORMATION.value), controller.getPartnerHcp);

    app.route('/api/partner/hco')
        .get(CDPAuthStrategy, ModuleGuard(Modules.INFORMATION.value), controller.getPartnerHcos)
        .post(passport.authenticate('application-jwt', { session: false }), validateFile(multer.array('documents', 5)), validate(partnerHcoSchema), controller.createPartnerHco);

    app.route('/api/partner/hco/:id')
        .get(CDPAuthStrategy, ModuleGuard(Modules.INFORMATION.value), controller.getPartnerHco);

    app.route('/api/partner/vendor')
        .get(CDPAuthStrategy, ModuleGuard(Modules.INFORMATION.value), controller.getPartnerVendors)
        .post(passport.authenticate('application-jwt', { session: false }), validateFile(multer.array('documents', 5)), validate(partnerVendorSchema), controller.createPartnerVendor);

    app.route('/api/partner/vendor/:id')
        .get(CDPAuthStrategy, ModuleGuard(Modules.INFORMATION.value), controller.getPartnerVendor);

    app.route('/api/partner/document/:id')
        .get(CDPAuthStrategy, ModuleGuard(Modules.INFORMATION.value), controller.getDownloadUrl);

    app.route('/api/partner/registration-lookup')
        .get(passport.authenticate('application-jwt', { session: false }), controller.registrationLookup);
    app.route('/api/partner/approve/:entityType/:id')
        .get(CDPAuthStrategy, ModuleGuard(Modules.INFORMATION.value), controller.approvePartner);

    app.route('/api/partner/export/:entityType')
        .get(CDPAuthStrategy, ModuleGuard(Modules.INFORMATION.value), controller.exportApprovedPartners);
};


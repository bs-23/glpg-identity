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
    app.route('/api/partners/hcps')
        .get(CDPAuthStrategy, ModuleGuard(Modules.INFORMATION.value), controller.getPartnerHcps)
        .post(passport.authenticate('application-jwt', { session: false }), validateFile(multer.array('documents', 5)), validate(partnerHcpSchema), controller.createPartnerHcp);

    app.route('/api/partners/hcps/:id')
        .get(passport.authenticate('application-jwt', { session: false }), controller.getHcpPartnerById)
        .put(passport.authenticate('application-jwt', { session: false }), validateFile(multer.array('documents', 5)), controller.updatePartnerHcp);

    app.route('/api/partners/hcos')
        .get(CDPAuthStrategy, ModuleGuard(Modules.INFORMATION.value), controller.getPartnerHcos)
        .post(passport.authenticate('application-jwt', { session: false }), validateFile(multer.array('documents', 5)), validate(partnerHcoSchema), controller.createPartnerHco);

    app.route('/api/partners/hcos/:id')
        .get(passport.authenticate('application-jwt', { session: false }), controller.getHcoPartnerById)
        .put(passport.authenticate('application-jwt', { session: false }), validateFile(multer.array('documents', 5)), controller.updatePartnerHco);

    app.route('/api/partners/vendors')
        .get(CDPAuthStrategy, ModuleGuard(Modules.INFORMATION.value), controller.getPartnerVendors)
        .post(passport.authenticate('application-jwt', { session: false }), validateFile(multer.array('documents', 5)), validate(partnerVendorSchema), controller.createPartnerVendor);

    app.route('/api/partners/vendors/:id')
        .get(passport.authenticate('application-jwt', { session: false }), controller.getVendorPartnerById)
        .put(passport.authenticate('application-jwt', { session: false }), validateFile(multer.array('documents', 5)), controller.updatePartnerVendor);

    app.route('/api/partners/wholesalers')
        .get(CDPAuthStrategy, ModuleGuard(Modules.INFORMATION.value), controller.getPartnerWholesalers);

    app.route('/api/partners/documents/:id')
        .get(CDPAuthStrategy, ModuleGuard(Modules.INFORMATION.value), controller.getDownloadUrl);

    app.route('/api/partners/registration-lookup')
        .get(passport.authenticate('application-jwt', { session: false }), controller.registrationLookup);

    app.route('/api/partners/lookup/:type')
        .get(passport.authenticate('application-jwt', { session: false }), controller.registrationLookup);

    app.route('/api/partners/information/:entityType/:id')
        .get(CDPAuthStrategy, ModuleGuard(Modules.INFORMATION.value), controller.getPartnerInformation);

    app.route('/api/partners/approve/:entityType/:id')
        .get(CDPAuthStrategy, ModuleGuard(Modules.INFORMATION.value), controller.approvePartner);

    app.route('/api/partners/export/:entityType')
        .get(CDPAuthStrategy, ModuleGuard(Modules.INFORMATION.value), controller.exportApprovedPartners);
};

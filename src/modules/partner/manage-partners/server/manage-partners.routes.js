const passport = require('passport');
const path = require('path');
const controller = require('./manage-partners.controller');
const { createPartnerSchema, updatePartnerSchema, createPartnerVendorSchema, updatePartnerVendorSchema, validateFile } = require('./partner.schema');
const { validate } = require(path.join(process.cwd(), 'src/modules/core/server/middlewares/validator.middleware'));
const { Services } = require('../../../core/server/authorization/authorization.constants');
const { ServiceGuard } = require('../../../core/server/authorization/authorization.middleware');
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/platform/user/server/user-authentication.middleware.js'));
const multer = require(path.join(process.cwd(), 'src/config/server/lib/multer'));

module.exports = app => {
    app.route('/api/partners')
        .get(CDPAuthStrategy, ServiceGuard([Services.MANAGE_BUSINESS_PARTNER]), controller.getPartners)
        .post(passport.authenticate('application-jwt', { session: false }), validateFile(multer.array('documents', 5)), validate(createPartnerSchema), controller.createPartner);
    app.route('/api/partners/partnerApproval')
        .get(CDPAuthStrategy, ServiceGuard([Services.MANAGE_BUSINESS_PARTNER]), controller.getPartnerApproval);

    app.route('/api/partners/wholesalers')
        .get(CDPAuthStrategy, ServiceGuard([Services.MANAGE_BUSINESS_PARTNER]), controller.getPartnerWholesalers);

    app.route('/api/partners/vendors')
        .get(CDPAuthStrategy, ServiceGuard([Services.MANAGE_BUSINESS_PARTNER]), controller.getPartnerVendors)
        .post(passport.authenticate('application-jwt', { session: false }), validateFile(multer.array('documents', 5)), validate(createPartnerVendorSchema), controller.createPartnerVendor);

    app.route('/api/partners/vendors/:id')
        .get(passport.authenticate('application-jwt', { session: false }), controller.getPartnerVendorById)
        .put(passport.authenticate('application-jwt', { session: false }), validateFile(multer.array('documents', 5)), validate(updatePartnerVendorSchema), controller.updatePartnerVendor);

    app.route('/api/partners/documents/:id')
        .get(CDPAuthStrategy, ServiceGuard([Services.MANAGE_BUSINESS_PARTNER]), controller.getDownloadUrl);

    app.route('/api/partners/registration-lookup')
        .get(passport.authenticate('application-jwt', { session: false }), controller.registrationLookup);

    app.route('/api/partners/information/:entityType/:id')
        .get(CDPAuthStrategy, ServiceGuard([Services.MANAGE_BUSINESS_PARTNER]), controller.getPartnerInformation);

    app.route('/api/partners/approve/:entityType/:id')
        .get(CDPAuthStrategy, ServiceGuard([Services.MANAGE_BUSINESS_PARTNER]), controller.approvePartner);

    app.route('/api/partners/export/:entityType')
        .get(CDPAuthStrategy, ServiceGuard([Services.MANAGE_BUSINESS_PARTNER]), controller.exportApprovedPartners);

    app.route('/api/partners/:id')
        .get(passport.authenticate('application-jwt', { session: false }), controller.getPartnerById)
        .put(passport.authenticate('application-jwt', { session: false }), validateFile(multer.array('documents', 5)), validate(updatePartnerSchema), controller.updatePartner);

    app.route('/api/partners/:entityType/:id/resend-form')
        .put(CDPAuthStrategy, ServiceGuard([Services.MANAGE_BUSINESS_PARTNER, Services.MANAGE_ENTITY_REQUEST]), controller.resendForm);
};

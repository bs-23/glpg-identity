const passport = require('passport');
const path = require('path');
const controller = require('./manage-partners.controller');
const { partnerHcpSchema, partnerHcoSchema, partnerVendorSchema, validateFile } = require('./partner.schema');
const { validate } = require(path.join(process.cwd(), 'src/modules/core/server/middlewares/validator.middleware'));
const { Services } = require('../../../core/server/authorization/authorization.constants');
const { ServiceGuard } = require('../../../core/server/authorization/authorization.middleware');
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/platform/user/server/user-authentication.middleware.js'));
const multer = require(path.join(process.cwd(), 'src/config/server/lib/multer'));

module.exports = app => {
    app.route('/api/partners/hcps')
        .get(CDPAuthStrategy, ServiceGuard([Services.MANAGE_BUSINESS_PARTNER]), controller.getPartnerHcps)
        .post(passport.authenticate('application-jwt', { session: false }), validateFile(multer.array('documents', 5)), validate(partnerHcpSchema), controller.createPartnerHcp);

    app.route('/api/partners/hcps/:id')
        .get(passport.authenticate('application-jwt', { session: false }), controller.getHcpPartnerById)
        .put(passport.authenticate('application-jwt', { session: false }), validateFile(multer.array('documents', 5)), controller.updatePartnerHcp);

    app.route('/api/partners/hcos')
        .get(CDPAuthStrategy, ServiceGuard([Services.MANAGE_BUSINESS_PARTNER]), controller.getPartnerHcos)
        .post(passport.authenticate('application-jwt', { session: false }), validateFile(multer.array('documents', 5)), validate(partnerHcoSchema), controller.createPartnerHco);

    app.route('/api/partners/hcos/:id')
        .get(passport.authenticate('application-jwt', { session: false }), controller.getHcoPartnerById)
        .put(passport.authenticate('application-jwt', { session: false }), validateFile(multer.array('documents', 5)), controller.updatePartnerHco);

    app.route('/api/partners/vendors')
        .get(CDPAuthStrategy, ServiceGuard([Services.MANAGE_BUSINESS_PARTNER]), controller.getPartnerVendors)
        .post(passport.authenticate('application-jwt', { session: false }), validateFile(multer.array('documents', 5)), validate(partnerVendorSchema), controller.createPartnerVendor);

    app.route('/api/partners/vendors/:id')
        .get(passport.authenticate('application-jwt', { session: false }), controller.getVendorPartnerById)
        .put(passport.authenticate('application-jwt', { session: false }), validateFile(multer.array('documents', 5)), controller.updatePartnerVendor);

    app.route('/api/partners/wholesalers')
        .get(CDPAuthStrategy, ServiceGuard([Services.MANAGE_BUSINESS_PARTNER]), controller.getPartnerWholesalers);

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
};

const path = require("path");
const passport = require('passport');
const controller = require('./manage-requests.controller');
const { Services } = require('../../../core/server/authorization/authorization.constants');
const { ServiceGuard } = require('../../../core/server/authorization/authorization.middleware');
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/platform/user/server/user-authentication.middleware.js'));

module.exports = app => {
    app.route('/api/partner-requests')
        .get(CDPAuthStrategy, ServiceGuard([Services.MANAGE_VENDOR_REQUEST, Services.MANAGE_ENTITY_REQUEST]), controller.getPartnerRequests)
        .post(CDPAuthStrategy, ServiceGuard([Services.MANAGE_VENDOR_REQUEST, Services.MANAGE_ENTITY_REQUEST]), controller.createPartnerRequest);

    app.route('/api/partner-requests/:id')
        .get(CDPAuthStrategy, ServiceGuard([Services.MANAGE_VENDOR_REQUEST, Services.MANAGE_ENTITY_REQUEST]), controller.getPartnerRequest)
        .put(CDPAuthStrategy, ServiceGuard([Services.MANAGE_VENDOR_REQUEST, Services.MANAGE_ENTITY_REQUEST]), controller.updatePartnerRequest)
        .delete(CDPAuthStrategy, ServiceGuard([Services.MANAGE_VENDOR_REQUEST, Services.MANAGE_ENTITY_REQUEST]), controller.deletePartnerRequest);

    app.route('/api/partner-requests/:id/send-form')
        .get(CDPAuthStrategy, ServiceGuard([Services.MANAGE_VENDOR_REQUEST, Services.MANAGE_ENTITY_REQUEST]), controller.sendForm);

    app.route('/api/partner-requests/:id/resend-form')
        .get(CDPAuthStrategy, ServiceGuard([Services.MANAGE_VENDOR_REQUEST, Services.MANAGE_ENTITY_REQUEST]), controller.resendForm);
};

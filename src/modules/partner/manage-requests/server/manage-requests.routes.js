const path = require("path");
const passport = require('passport');
const controller = require('./manage-requests.controller');
const { Modules } = require('../../../core/server/authorization/authorization.constants');
const { ModuleGuard } = require('../../../core/server/authorization/authorization.middleware');
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/platform/user/server/user-authentication.middleware.js'));

module.exports = app => {
    app.route('/api/partner-requests')
        .get(CDPAuthStrategy, controller.getPartnerRequests)
        .post(CDPAuthStrategy, controller.createPartnerRequest);

    app.route('/api/partner-requests/:id')
        .get(CDPAuthStrategy, controller.getPartnerRequest)
        .put(CDPAuthStrategy, controller.updatePartnerRequest)
        .delete(CDPAuthStrategy, controller.deletePartnerRequest);

    app.route('/api/partner-requests/:id/send-form')
        .post(CDPAuthStrategy, controller.sendForm);
};

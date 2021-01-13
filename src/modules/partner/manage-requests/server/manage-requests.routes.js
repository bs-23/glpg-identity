const passport = require('passport');
const path = require("path");
const controller = require('./manage-requests.controller');
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/platform/user/server/user-authentication.middleware.js'));

module.exports = app => {
    app.route('/api/partner-requests')
        .get(controller.getPartnerRequests)
        .post(controller.createPartnerRequest);

    app.route('/api/partner-requests/:id')
        .get(controller.getPartnerRequest)
        .put(controller.updatePartnerRequest)
        .delete(controller.deletePartnerRequest)
        .post(controller.sendForm);
};

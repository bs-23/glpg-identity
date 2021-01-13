const passport = require('passport');
const path = require("path");
const controller = require('./business-partner.controller');
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/platform/user/server/user-authentication.middleware.js'));

module.exports = app => {
    app.route('/api/partner-requests')
        .get(controller.getPartnerRequests)
        .post(controller.createPartnerRequest);

    app.route('/api/partner-requests/:id')
        .get(controller.getPartnerRequest)
        .put(controller.updatePartnerRequest)
        .delete(controller.deletePartnerRequest);

    app.route('/api/hcp-partner')
        .get(passport.authenticate('application-jwt', { session: false }), controller.getHcpPartners)
        .post(passport.authenticate('application-jwt', { session: false }), controller.createHcpPartner)

    app.route('/api/hcp-partner/:id')
        .put(passport.authenticate('application-jwt', { session: false }), controller.updateHcpPartner)

    app.route('/api/hco-partner')
        .get(passport.authenticate('application-jwt', { session: false }), controller.getHcoPartners)
        .post(passport.authenticate('application-jwt', { session: false }), controller.createHcoPartner)

    app.route('/api/hco-partner/:id')
        .put(passport.authenticate('application-jwt', { session: false }), controller.updateHcoPartner)


};

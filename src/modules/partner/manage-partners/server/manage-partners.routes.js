const passport = require('passport');
const path = require("path");
const controller = require('./manage-partners.controller');

module.exports = app => {
    app.route('/api/partner/hcp')
        .get(passport.authenticate('application-jwt', { session: false }), controller.getHcpPartners)
        .post(passport.authenticate('application-jwt', { session: false }), controller.createHcpPartner)

    app.route('/api/partner/hcp/:id')
        .put(passport.authenticate('application-jwt', { session: false }), controller.updateHcpPartner)

    app.route('/api/partner/hco')
        .get(passport.authenticate('application-jwt', { session: false }), controller.getHcoPartners)
        .post(passport.authenticate('application-jwt', { session: false }), controller.createHcoPartner)

    app.route('/api/partner/hco/:id')
        .put(passport.authenticate('application-jwt', { session: false }), controller.updateHcoPartner)
};

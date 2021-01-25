const passport = require('passport');
const path = require("path");
const controller = require('./manage-consent.controller');
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/platform/user/server/user-authentication.middleware.js'));

module.exports = app => {
    app.route('/api/consents')
        .get(passport.authenticate('application-jwt', { session: false }), controller.getConsents);

    app.route('/api/consents/:id')
        .get(CDPAuthStrategy, controller.getUserConsents);

    app.route('/api/cdp-consents/:id')
        .get(CDPAuthStrategy, controller.getCdpConsent)
        .put(CDPAuthStrategy, controller.updateCdpConsent);

    app.route('/api/cdp-consents')
        .get(CDPAuthStrategy, controller.getCdpConsents)
        .post(CDPAuthStrategy, controller.createConsent);
};

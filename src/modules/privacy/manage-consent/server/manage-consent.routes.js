const passport = require('passport');
const path = require("path");
const controller = require('./manage-consent.controller');
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/platform/user/server/user-authentication.middleware'));
const { Services } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.constants'));
const { ServiceGuard } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.middleware'));

module.exports = app => {
    app.route('/api/consents')
        .get(passport.authenticate('application-jwt', { session: false }), controller.getConsents);

    app.route('/api/cdp-consents/:id')
        .get(CDPAuthStrategy, ServiceGuard([Services.MANAGE_CONSENT, Services.CONSENT_COUNTRY]), controller.getCdpConsent)
        .put(CDPAuthStrategy, ServiceGuard([Services.MANAGE_CONSENT]), controller.updateCdpConsent);

    app.route('/api/cdp-consents')
        .get(CDPAuthStrategy, ServiceGuard([Services.MANAGE_CONSENT, Services.CONSENT_COUNTRY]), controller.getCdpConsents)
        .post(CDPAuthStrategy, ServiceGuard([Services.MANAGE_CONSENT]), controller.createConsent);
};

const passport = require('passport');
const path = require("path");
const controller = require('./manage-consent.controller');
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/platform/user/server/user-authentication.middleware.js'));
const { Modules, Services } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.constants'));
const { ModuleGuard } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.middleware'));

module.exports = app => {
    app.route('/api/consents')
        .get(passport.authenticate('application-jwt', { session: false }), controller.getConsents);

    app.route('/api/consents/:id')
        .get(CDPAuthStrategy, ModuleGuard([Modules.PRIVACY.value]), controller.getUserConsents);

    app.route('/api/cdp-consents/:id')
        .get(CDPAuthStrategy, ModuleGuard([Services.MANAGE_CONSENT.value, Services.CONSENT_COUNTRY.value]), controller.getCdpConsent)
        .put(CDPAuthStrategy, ModuleGuard([Services.MANAGE_CONSENT.value]), controller.updateCdpConsent);

    app.route('/api/cdp-consents')
        .get(CDPAuthStrategy, ModuleGuard([Services.MANAGE_CONSENT.value, Services.CONSENT_COUNTRY.value]), controller.getCdpConsents)
        .post(CDPAuthStrategy, ModuleGuard([Services.MANAGE_CONSENT.value]), controller.createConsent);
};

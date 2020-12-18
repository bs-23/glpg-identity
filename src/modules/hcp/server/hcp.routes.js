const passport = require('passport');
const path = require('path');
const controller = require('./hcp.controller');
const { Modules } = require('../../core/server/authorization/authorization.constants');
const { ModuleGuard } = require('../../core/server/authorization/authorization.middleware');
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/platform/user/server/user-authentication.middleware.js'));

module.exports = app => {
    app.route('/api/hcps')
        .get(CDPAuthStrategy, ModuleGuard(Modules.INFORMATION.value), controller.getHcps);

    app.route('/api/hcps/specialties')
        .get(CDPAuthStrategy, ModuleGuard(Modules.INFORMATION.value), controller.getSpecialtiesForCdp);

    app.route('/api/hcps/:id')
        .get(CDPAuthStrategy, ModuleGuard(Modules.INFORMATION.value), controller.getHcpProfile)
        .put(CDPAuthStrategy, controller.editHcp);

    app.route('/api/hcp-profiles/registration-lookup')
        .post(passport.authenticate('application-jwt', { session: false }), controller.registrationLookup);

    app.route('/api/hcp-profiles/generate-token')
        .post(passport.authenticate('application-jwt', { session: false }), controller.getAccessToken);

    app.route('/api/hcp-profiles')
        .post(passport.authenticate('application-jwt', { session: false }), controller.createHcpProfile);

    app.route('/api/hcp-profiles/confirm-consents')
        .post(passport.authenticate('application-jwt', { session: false }), controller.confirmConsents);

    app.route('/api/hcp-profiles/forget-password')
        .post(passport.authenticate('application-jwt', { session: false }), controller.forgetPassword);

    app.route('/api/hcp-profiles/reset-password')
        .put(passport.authenticate('application-jwt', { session: false }), controller.resetPassword);

    app.route('/api/hcp-profiles/change-password')
        .put(passport.authenticate('application-jwt', { session: false }), controller.changePassword);

    app.route('/api/hcp-profiles/specialties')
        .get(passport.authenticate('application-jwt', { session: false }), controller.getSpecialties);

    app.route('/api/hcp-profiles/specialties-eng')
        .get(CDPAuthStrategy, controller.getSpecialtiesWithEnglishTranslation);

    app.route('/api/hcp-profiles/update-hcps')
        .put(CDPAuthStrategy, ModuleGuard(Modules.INFORMATION.value), controller.updateHcps);

    app.route('/api/hcp-profiles/:id/approve')
        .put(CDPAuthStrategy, ModuleGuard(Modules.INFORMATION.value), controller.approveHCPUser);

    app.route('/api/hcp-profiles/:id/reject')
        .put(CDPAuthStrategy, ModuleGuard(Modules.INFORMATION.value), controller.rejectHCPUser);

    app.route('/api/hcp-profiles/:id/consents')
        .get(CDPAuthStrategy, ModuleGuard(Modules.INFORMATION.value), controller.getHCPUserConsents)
        .put(passport.authenticate('application-jwt', { session: false }), controller.updateHCPUserConsents);

    app.route('/api/hcp-profiles/:id')
        .get(passport.authenticate('application-jwt', { session: false }), controller.getHcpProfile)
        .put(passport.authenticate('application-jwt', { session: false }), controller.editHcp);
};

const path = require('path');
const passport = require('passport');
const controller = require('./hcp.controller');
const { validate } = require(path.join(process.cwd(), 'src/modules/core/server/middlewares/validator.middleware'));
const { Modules } = require('../../../core/server/authorization/authorization.constants');
const { ModuleGuard } = require('../../../core/server/authorization/authorization.middleware');
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/platform/user/server/user-authentication.middleware.js'));
const { hcpProfile, registrationLookup, getAccessToken, updateHCPUserConsents, changePassword, forgetPassword, resetPassword, confirmConsents } = require('./hcp.schema');

module.exports = app => {
    app.route('/api/hcps')
        .post(CDPAuthStrategy, ModuleGuard(Modules.INFORMATION.value), controller.getHcps);

    app.route('/api/hcps/specialties')
        .get(CDPAuthStrategy, ModuleGuard(Modules.INFORMATION.value), controller.getSpecialtiesForCdp);

    app.route('/api/hcps/:id')
        .get(CDPAuthStrategy, ModuleGuard(Modules.INFORMATION.value), controller.getHcpProfile);

    app.route('/api/hcp-profiles/registration-lookup')
        .post(passport.authenticate('application-jwt', { session: false }), validate(registrationLookup), controller.registrationLookup);

    app.route('/api/hcp-profiles/generate-token')
        .post(passport.authenticate('application-jwt', { session: false }), validate(getAccessToken), controller.getAccessToken);

    app.route('/api/hcp-profiles')
        .post(passport.authenticate('application-jwt', { session: false }), validate(hcpProfile), controller.createHcpProfile);

    app.route('/api/hcp-profiles/confirm-consents')
        .post(passport.authenticate('application-jwt', { session: false }), validate(confirmConsents), controller.confirmConsents);

    app.route('/api/hcp-profiles/forget-password')
        .post(passport.authenticate('application-jwt', { session: false }), validate(forgetPassword), controller.forgetPassword);

    app.route('/api/hcp-profiles/reset-password')
        .put(passport.authenticate('application-jwt', { session: false }), validate(resetPassword), controller.resetPassword);

    app.route('/api/hcp-profiles/change-password')
        .put(passport.authenticate('application-jwt', { session: false }), validate(changePassword), controller.changePassword);

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
        .put(passport.authenticate('application-jwt', { session: false }), validate(updateHCPUserConsents), controller.updateHCPUserConsents);

    app.route('/api/hcp-profiles/:id')
        .get(passport.authenticate('application-jwt', { session: false }), controller.getHcpProfile);

    app.route('/api/datasync/hcps')
        .post(CDPAuthStrategy, ModuleGuard(Modules.INFORMATION.value), controller.getHcpsFromDatasync);
};

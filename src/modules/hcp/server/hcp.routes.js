const passport = require('passport');
const controller = require('./hcp.controller');
const { Modules } = require('../../core/server/authorization/authorization.constants');
const { ModuleGuard } = require('../../core/server/authorization/authorization.middleware');

module.exports = app => {
    app.route('/api/hcps')
        .get(passport.authenticate('user-jwt', { session: false }), ModuleGuard(Modules.HCP.value), controller.getHcps);

    app.route('/api/hcps/:id')
        .put(passport.authenticate('user-jwt', { session: false }), controller.editHcp);

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

    app.route('/api/hcp-profiles/:id/approve')
        .put(passport.authenticate('user-jwt', { session: false }), ModuleGuard(Modules.HCP.value), controller.approveHCPUser);

    app.route('/api/hcp-profiles/:id/reject')
        .put(passport.authenticate('user-jwt', { session: false }), ModuleGuard(Modules.HCP.value), controller.rejectHCPUser);

    app.route('/api/hcp-profiles/:id/consents')
        .get(passport.authenticate('user-jwt', { session: false }), ModuleGuard(Modules.HCP.value), controller.getHCPUserConsents);

    app.route('/api/hcp-profiles/:id')
        .get(passport.authenticate('application-jwt', { session: false }), controller.getHcpProfile)
        .put(passport.authenticate('application-jwt', { session: false }), controller.editHcp);
};

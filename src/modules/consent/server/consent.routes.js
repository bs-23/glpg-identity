const passport = require('passport');
const controller = require('./consent.controller');
const { Modules } = require('../../core/server/authorization/authorization.constants');
const { ModuleGuard } = require('../../core/server/authorization/authorization.middleware');

module.exports = app => {
    app.route('/api/consents')
        .get(passport.authenticate('application-jwt', { session: false }),  ModuleGuard(Modules.Consent.value), controller.getConsents);
};

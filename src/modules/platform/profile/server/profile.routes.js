const passport = require('passport');
const path = require('path');
const { Modules } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.constants'));
const { ModuleGuard } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.middleware'));
const controller = require('./userProfile.controller');

module.exports = app => {
    app.route('/api/profiles')
        .get(passport.authenticate('user-jwt', { session: false }), ModuleGuard(Modules.PLATFORM.value),  controller.getProfiles)
        .post(passport.authenticate('user-jwt', { session: false }), ModuleGuard(Modules.PLATFORM.value), controller.createProfile);
    app.route('/api/profiles/:id')
        .put(passport.authenticate('user-jwt', { session: false }), ModuleGuard(Modules.PLATFORM.value), controller.editProfile);
};

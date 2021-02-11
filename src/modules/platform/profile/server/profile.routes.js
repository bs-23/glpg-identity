const passport = require('passport');
const path = require('path');
const { Services } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.constants'));
const { ServiceGuard } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.middleware'));
const controller = require('./userProfile.controller');

module.exports = app => {
    app.route('/api/profiles')
        .get(passport.authenticate('user-jwt', { session: false }), ServiceGuard([Services.MANAGE_PROFILE]),  controller.getProfiles)
        .post(passport.authenticate('user-jwt', { session: false }), ServiceGuard([Services.MANAGE_PROFILE]), controller.createProfile);
    app.route('/api/profiles/:id')
        .put(passport.authenticate('user-jwt', { session: false }), ServiceGuard([Services.MANAGE_PROFILE]), controller.editProfile);
};

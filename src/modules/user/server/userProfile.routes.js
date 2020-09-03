const passport = require('passport');
const controller = require('./userProfile.controller');

module.exports = app => {
    app.route('/api/profiles')
        .get(passport.authenticate('user-jwt', { session: false }), controller.getProfiles)
        .post(passport.authenticate('user-jwt', { session: false }), controller.createProfile);
    app.route('/api/profiles/:id')
        .put(passport.authenticate('user-jwt', { session: false }), controller.editProfile);
};

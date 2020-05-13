/* eslint-disable quotes */
const passport = require('passport');
const controller = require('./user.controller');

module.exports = app => {
    app.post('/login', controller.login);

    app.get(
        '/logout',
        passport.authenticate('user-jwt', { session: false }),
        controller.logout
    );

    app.route('/users').post(
        passport.authenticate('user-jwt', { session: false }),
        controller.createUser
    );

    app.route('/users/getSignedInUserProfile').get(
        passport.authenticate('user-jwt', { session: false }),
        controller.getSignedInUserProfile
    );

    app.route('/users/changePassword').post(
        passport.authenticate('user-jwt', { session: false }),
        controller.changePassword
    );
};

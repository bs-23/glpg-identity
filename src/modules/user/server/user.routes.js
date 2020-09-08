const passport = require('passport');
const controller = require('./user.controller');
const { Modules } = require('../../core/server/authorization/authorization.constants');
const { ModuleGuard } = require('../../core/server/authorization/authorization.middleware');

module.exports = app => {
    app.post('/api/login', controller.login);

    app.get('/api/logout', passport.authenticate('user-jwt', { session: false }), controller.logout);

    app.route('/api/users')
        .get(passport.authenticate('user-jwt', { session: false }), ModuleGuard(Modules.PLATFORM.value), controller.getUsers)
        .post(passport.authenticate('user-jwt', { session: false }), ModuleGuard(Modules.PLATFORM.value), controller.createUser);

    app.get('/api/users/profile', passport.authenticate('user-jwt', { session: false }), controller.getSignedInUserProfile);

    app.route('/api/users/:id')
        .get(passport.authenticate("user-jwt", { session: false }), controller.getUser)
        .delete(passport.authenticate("user-jwt", { session: false }), controller.deleteUser);

    app.post('/api/users/change-password', passport.authenticate('user-jwt', { session: false }), controller.changePassword);

    app.post('/api/users/forgot-password', controller.sendPasswordResetLink);

    app.put('/api/users/reset-password', controller.resetPassword);
};

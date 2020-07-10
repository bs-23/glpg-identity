 const path = require("path");
const passport = require('passport');
const controller = require('./user.controller');
const { Modules } = require('./authorization/modules.constant');
const { adminPipeline, AuthGuard, ModuleGuard } = require('./authorization/authorization.middleware');


module.exports = app => {

    app.post('/api/login', controller.login);

    app.get('/api/logout', passport.authenticate('user-jwt', { session: false }), controller.logout);

    app.route('/api/users')
        .get(passport.authenticate('user-jwt', { session: false }), ModuleGuard(Modules.USER), controller.getUsers)
        .post(passport.authenticate('user-jwt', { session: false }), controller.createUser);

    app.get('/api/users/profile', passport.authenticate('user-jwt', { session: false }), controller.getSignedInUserProfile);

    app.route('/api/users/:id')
        .get(passport.authenticate("user-jwt", { session: false }), controller.getUser)
        .delete(passport.authenticate("user-jwt", { session: false }), controller.deleteUser);

    app.post('/api/users/change-password', passport.authenticate('user-jwt', { session: false }), controller.changePassword);

    app.post('/api/users/forgot-password', controller.sendPasswordResetLink);

    app.put('/api/users/reset-password', controller.resetPassword);
};

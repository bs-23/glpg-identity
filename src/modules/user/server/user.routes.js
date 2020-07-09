 const path = require("path");
const passport = require('passport');
const controller = require('./user.controller');
const { Actions } = require(path.join(process.cwd(), 'src/config/server/lib/actions.constant'));
const { adminPipeline, AuthGuard, ModuleGuard } = require(path.join(
    process.cwd(),
    'src/modules/core/server/routeGuard/authorization.middleware'
));


module.exports = app => {

    app.post('/api/login', controller.login);

    app.get('/api/logout', passport.authenticate('user-jwt', { session: false }), controller.logout);

    app.route('/api/users')
        .get(passport.authenticate('user-jwt', { session: false }), ModuleGuard(Actions.USER_GET_LIST), controller.getUsers)
        .post(passport.authenticate('user-jwt', { session: false }), controller.createUser);

    app.route('/api/users/:id')
        .delete(passport.authenticate("user-jwt", { session: false }), controller.deleteUser);

    app.get('/api/users/getSignedInUserProfile', passport.authenticate('user-jwt', { session: false }), controller.getSignedInUserProfile);

    app.post('/api/users/change-password', passport.authenticate('user-jwt', { session: false }), controller.changePassword);

    app.post('/api/users/password/send-reset-link', controller.sendPasswordResetLink);

    app.put('/api/users/password/resetPassword', controller.resetPassword);
};

const passport = require('passport');
const controller = require('./user.controller');

module.exports = app => {

    app.post('/api/login', controller.login);

    app.get('/api/logout', passport.authenticate('user-jwt', { session: false }), controller.logout);

    app.route('/api/users')
        .get(passport.authenticate('user-jwt', { session: false }), controller.getUsers)
        .post(passport.authenticate('user-jwt', { session: false }), controller.createUser);

    app.get('/api/users/profile', passport.authenticate('user-jwt', { session: false }), controller.getSignedInUserProfile);

    app.route('/api/users/:id')
        .get(passport.authenticate("user-jwt", { session: false }), controller.getUser)
        .delete(passport.authenticate("user-jwt", { session: false }), controller.deleteUser);

    app.post('/api/users/change-password', passport.authenticate('user-jwt', { session: false }), controller.changePassword);

    app.post('/api/users/forgot-password', controller.sendPasswordResetLink);

    app.put('/api/users/reset-password', controller.resetPassword);
};

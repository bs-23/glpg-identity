const passport = require('passport');
const controller = require('./user.controller');

module.exports = app => {
    app.post('/api/login', controller.login);

    app.get('/api/logout', passport.authenticate('user-jwt', { session: false }), controller.logout);

    app.route('/api/users')
        .get(passport.authenticate('user-jwt', { session: false }), controller.getUsers)
        .post(passport.authenticate('user-jwt', { session: false }), controller.createUser);

    app.route('/api/users/:id')
        .delete(passport.authenticate("user-jwt", { session: false }), controller.deleteUser);

    app.get('/api/users/getSignedInUserProfile', passport.authenticate('user-jwt', { session: false }), controller.getSignedInUserProfile);

    app.post('/api/users/changePassword', passport.authenticate('user-jwt', { session: false }), controller.changePassword);

    app.get('/api/send-email', controller.sendEmail);
};

const path = require("path");
const controller = require('./user.controller');
const { Modules } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.constants'));
const { ModuleGuard } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.middleware'));
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/user/server/user-authentication.middleware.js'));

module.exports = app => {
    app.post('/api/login', controller.login);

    app.get('/api/logout', CDPAuthStrategy, controller.logout);

    app.route('/api/users')
        .get(CDPAuthStrategy, ModuleGuard(Modules.PLATFORM.value), controller.getUsers)
        .post(CDPAuthStrategy, ModuleGuard(Modules.PLATFORM.value), controller.createUser);

    app.route('/api/users/filter-options')
        .get(CDPAuthStrategy, controller.getFilterOptions)
        .post(CDPAuthStrategy, controller.updateFilterOptions);

    app.route('/api/users/profile')
        .get(CDPAuthStrategy, controller.getSignedInUserProfile)
        .put(CDPAuthStrategy, controller.updateSignedInUserProfile)

    app.route('/api/users/:id')
        .get(CDPAuthStrategy, controller.getUser)
        .patch(CDPAuthStrategy, controller.updateUserDetails);

    app.post('/api/users/change-password', CDPAuthStrategy, controller.changePassword);

    app.post('/api/users/forgot-password', controller.sendPasswordResetLink);

    app.put('/api/users/reset-password', controller.resetPassword);
};

const passport = require('passport');
const path = require('path');
const { Modules } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.constants'));
const { ModuleGuard } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.middleware'));
const controller = require('./service-category.controller');

module.exports = app => {
    app.route('/api/serviceCategories')
        .get(passport.authenticate('user-jwt', { session: false }), ModuleGuard(Modules.USER.value), controller.getServiceCategories);
};

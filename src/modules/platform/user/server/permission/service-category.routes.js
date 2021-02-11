const passport = require('passport');
const path = require('path');
const { Services } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.constants'));
const { ServiceGuard } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.middleware'));
const controller = require('./service-category.controller');

module.exports = app => {
    app.route('/api/serviceCategories')
        .get(passport.authenticate('user-jwt', { session: false }), ServiceGuard([Services.PLATFORM]), controller.getServiceCategories);
};

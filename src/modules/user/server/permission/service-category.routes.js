const passport = require('passport');
const controller = require('./service-category.controller');

module.exports = app => {
    app.route('/api/serviceCategories')
        .get(passport.authenticate('user-jwt', { session: false }), controller.getServiceCategories);
};

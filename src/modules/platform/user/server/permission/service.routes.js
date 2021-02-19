const passport = require('passport');
const path = require('path');
const { Services } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.constants'));
const { ServiceGuard } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.middleware'));
const controller = require('./service.controller');

module.exports = app => {
    app.route('/api/services')
        .get(passport.authenticate('user-jwt', { session: false }), ServiceGuard([Services.PLATFORM]), controller.getServices);
};

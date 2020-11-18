const passport = require('passport');
const path = require("path");
const controller = require('./application.controller');
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/user/server/user-authentication.middleware.js'));

module.exports = app => {
    app.post('/api/applications/token', controller.getToken);

    app.route('/api/applications')
        .get(CDPAuthStrategy, controller.getApplications);

    app.route('/api/applications/data')
        .post(passport.authenticate('application-jwt', { session: false }), controller.createData);

};

const passport = require('passport');
const path = require("path");
const controller = require('./clinical-trials.controller');
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/platform/user/server/user-authentication.middleware.js'));

module.exports = app => {
    app.route('/api/clinical-trials/sync')
        .post(passport.authenticate('application-jwt', { session: false }), controller.sync);
};

const passport = require('passport');
const path = require("path");
const controller = require('./application.controller');
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/platform/user/server/user-authentication.middleware.js'));
const { validate } = require(path.join(process.cwd(), 'src/modules/core/server/middlewares/validator.middleware'));
const { getToken, saveData } = require(path.join(process.cwd(), 'src/modules/platform/application/server/application.schema'));

module.exports = app => {
    app.post('/api/applications/token', validate(getToken), controller.getToken);

    app.route('/api/applications')
        .get(CDPAuthStrategy, controller.getApplications);

    app.route('/api/applications/data')
        .post(passport.authenticate('application-jwt', { session: false }), validate(saveData), controller.saveData);

    app.route('/api/applications/data/:id')
        .get(passport.authenticate('application-jwt', { session: false }), controller.getData);

};

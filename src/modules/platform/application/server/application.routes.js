const passport = require('passport');
const path = require("path");
const controller = require('./application.controller');
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/platform/user/server/user-authentication.middleware.js'));
const { validate } = require(path.join(process.cwd(), 'src/modules/core/server/middlewares/validator.middleware'));
const { getToken, saveData } = require(path.join(process.cwd(), 'src/modules/platform/application/server/application.schema'));
const multer = require(path.join(process.cwd(), 'src/config/server/lib/multer'));

module.exports = app => {
    app.post('/api/applications/token', validate(getToken), controller.getToken);

    app.route('/api/applications')
        .get(CDPAuthStrategy, controller.getApplications)
        .post(CDPAuthStrategy, multer.array('logo', 1), controller.createApplication);

    app.route('/api/applications/data')
        .post(passport.authenticate('application-jwt', { session: false }), validate(saveData), controller.saveData);

    app.route('/api/applications/data/:id')
        .get(passport.authenticate('application-jwt', { session: false }), controller.getData);

    app.route('/api/applications/:id')
        .get(CDPAuthStrategy, controller.getApplication)
        .put(CDPAuthStrategy, multer.array('logo', 1), controller.updateApplication);
};

const passport = require('passport');
const path = require("path");
const controller = require('./clinical-trials.controller');
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/platform/user/server/user-authentication.middleware.js'));
const auth = passport.authenticate('application-jwt', { session: false });
module.exports = app => {
    app.route('/api/clinical-trials/dump-raw-data')
        .post(auth, controller.dumpAllData);
    app.route('/api/clinical-trials/show-all-versions')
        .get(auth, controller.showAllVersions);
    app.route('/api/clinical-trials/merge-process-data-stage')
        .post(auth, controller.mergeProcessData);
};

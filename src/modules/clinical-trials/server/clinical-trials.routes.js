const passport = require('passport');
const path = require("path");
const controller = require('./clinical-trials.controller');
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/platform/user/server/user-authentication.middleware.js'));
const auth = passport.authenticate('application-jwt', { session: false });

module.exports = app => {
    app.route('/api/clinical-trials')
        .get(auth, controller.getTrials)
        .post(CDPAuthStrategy, ModuleGuard(Modules.CLINICAL_TRIALS.value), controller.dumpAllData);

    app.route('/api/clinical-trials/versions')
        .get(CDPAuthStrategy, ModuleGuard(Modules.CLINICAL_TRIALS.value), controller.showAllVersions);

    app.route('/api/clinical-trials/merge-versions')
        .post(CDPAuthStrategy, ModuleGuard(Modules.CLINICAL_TRIALS.value), controller.mergeProcessData);

    app.route('/api/clinical-trials/:id')
        .get(auth, controller.getTrialDetails);
};

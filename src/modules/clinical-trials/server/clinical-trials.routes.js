const passport = require('passport');
const path = require("path");
const controller = require('./clinical-trials.controller');
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/platform/user/server/user-authentication.middleware.js'));
const auth = passport.authenticate('application-jwt', { session: false });
const { Modules, Services } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.constants.js'));
const { ModuleGuard } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.middleware.js'));

module.exports = app => {
    app.route('/api/clinical-trials')
        .get(auth, controller.getTrials)
        .post(CDPAuthStrategy, ModuleGuard([Services.MANAGE_CLINICAL_TRIALS]), controller.dumpAllData);

    app.route('/api/clinical-trials/versions')
        .get(CDPAuthStrategy, ModuleGuard([Services.MANAGE_CLINICAL_TRIALS]), controller.showAllVersions);

    app.route('/api/clinical-trials/merge-versions')
        .post(CDPAuthStrategy, ModuleGuard([Services.MANAGE_CLINICAL_TRIALS]), controller.mergeProcessData);

    app.route('/api/clinical-trials/countries')
        .get(auth, controller.getCountryList);

    app.route('/api/clinical-trials/countries/zip')
        .post(auth, controller.getPostalCodes);

    app.route('/api/clinical-trials/countries/zip/validate')
        .post(auth, controller.validateAddress);

    app.route('/api/clinical-trials/conditions')
        .get(auth, controller.getConditions);

    app.route('/api/clinical-trials/:id')
        .get(auth, controller.getTrialDetails);

};

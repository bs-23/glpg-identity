const passport = require('passport');
const path = require("path");
const controller = require('./clinical-trials.controller');
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/platform/user/server/user-authentication.middleware.js'));
const auth = passport.authenticate('application-jwt', { session: false });
const { Services } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.constants.js'));
const { ServiceGuard } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.middleware.js'));

module.exports = app => {
    app.route('/api/clinical-trials-cdp')
        .get(CDPAuthStrategy, controller.getTrials);

    app.route('/api/clinical-trials')
        .get(auth, controller.getTrials)
        .post(CDPAuthStrategy, ServiceGuard([Services.MANAGE_CLINICAL_TRIALS]), controller.dumpAllData);
    
    app.route('/api/clinical-trials/update')
        .put(CDPAuthStrategy, ServiceGuard([Services.MANAGE_CLINICAL_TRIALS]), controller.updateClinicalTrials);

    app.route('/api/clinical-trials/versions')
        .get(CDPAuthStrategy, ServiceGuard([Services.MANAGE_CLINICAL_TRIALS]), controller.showAllVersions);

    app.route('/api/clinical-trials/merge-versions')
        .post(CDPAuthStrategy, ServiceGuard([Services.MANAGE_CLINICAL_TRIALS]), controller.mergeProcessData);

    app.route('/api/clinical-trials/sync-geocodes')
        .post(CDPAuthStrategy, ServiceGuard([Services.MANAGE_CLINICAL_TRIALS]), controller.syncGeoCodes);

    app.route('/api/clinical-trials/countries')
        .get(auth, controller.getCountryList);

    app.route('/api/clinical-trials/countries/zip/validate')
        .post(auth, controller.validateAddress);

    app.route('/api/clinical-trials/conditions-with-details')
        .get(auth, controller.getConditionsWithDetails);

    app.route('/api/clinical-trials/conditions')
        .get(auth, controller.getConditions);

    app.route('/api/clinical-trials/:id')
        .get(auth, controller.getTrialDetails);

    app.route('/api/clinical-trials-cdp/:id')
        .get(CDPAuthStrategy, controller.getTrialDetails);
};

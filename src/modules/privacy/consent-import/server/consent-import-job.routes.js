const path = require('path');
const controller = require('./consent-import-job.controller');
const { validateFile } = require('./consent-import-job.schema');
const multer = require(path.join(process.cwd(), 'src/modules/privacy/consent-import/server/multer'));
const { Services } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.constants'));
const { ServiceGuard } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.middleware'));
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/platform/user/server/user-authentication.middleware'));

module.exports = app => {
    app.route('/api/consent-import-jobs')
        .get(CDPAuthStrategy, ServiceGuard([Services.MANAGE_CONSENT_IMPORT_JOBS]), controller.getConsentImportJobs)
        .post(CDPAuthStrategy, ServiceGuard([Services.MANAGE_CONSENT_IMPORT_JOBS]), validateFile(multer.array('file', 1)), controller.createConsentImportJob);

    app.route('/api/consent-import-jobs/:id/start')
        .post(CDPAuthStrategy, ServiceGuard([Services.MANAGE_CONSENT_IMPORT_JOBS]), controller.startConsentImportJob);

    app.route('/api/consent-import-jobs/:id/download')
        .get(CDPAuthStrategy, ServiceGuard([Services.MANAGE_CONSENT_IMPORT_JOBS]), controller.getDownloadUrl);

    app.route('/api/consent-import-jobs/:id/export')
        .get(CDPAuthStrategy, ServiceGuard([Services.MANAGE_CONSENT_IMPORT_JOBS]), controller.exportJobReport);

    app.route('/api/consent-import-jobs/:id')
        .put(CDPAuthStrategy, ServiceGuard([Services.MANAGE_CONSENT_IMPORT_JOBS]), controller.cancelConsentImportJob);
};

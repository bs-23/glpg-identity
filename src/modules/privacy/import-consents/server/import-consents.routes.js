const path = require('path');
const controller = require('./import-consents.controller');
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/platform/user/server/user-authentication.middleware'));
const { Services } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.constants'));
const { ServiceGuard } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.middleware'));
const multer = require(path.join(process.cwd(), 'src/modules/privacy/import-consents/server/multer'));
const { validateFile } = require('./import-consents.schema');

module.exports = app => {
    app.route('/api/consent-import-jobs')
        .get(CDPAuthStrategy, ServiceGuard([Services.IMPORT_CONSENTS]), controller.getConsentImportJobs)
        .post(CDPAuthStrategy, ServiceGuard([Services.IMPORT_CONSENTS]), validateFile(multer.array('file', 1)), controller.createConsentImportJob);

    app.route('/api/consent-import-jobs/:id/start')
        .post(CDPAuthStrategy, ServiceGuard([Services.IMPORT_CONSENTS]), controller.startConsentImportJob);

    app.route('/api/consent-import-jobs/:id/download')
        .get(CDPAuthStrategy, ServiceGuard([Services.IMPORT_CONSENTS]), controller.getDownloadUrl);

    app.route('/api/consent-import-jobs/:id/export')
        .get(CDPAuthStrategy, ServiceGuard([Services.IMPORT_CONSENTS]), controller.exportJobReport);

    app.route('/api/consent-import-jobs/:id')
        .put(CDPAuthStrategy, ServiceGuard([Services.IMPORT_CONSENTS]), controller.cancelConsentImportJob);
};

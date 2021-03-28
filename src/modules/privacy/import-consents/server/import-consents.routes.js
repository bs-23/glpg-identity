const path = require('path');
const controller = require('./import-consents.controller');
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/platform/user/server/user-authentication.middleware'));
const { Services } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.constants'));
const { ServiceGuard } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.middleware'));
const multer = require(path.join(process.cwd(), 'src/modules/privacy/import-consents/server/multer'));
const { validateFile } = require('./import-consents.schema');

module.exports = app => {
    app.route('/api/consent-import')
        .post(CDPAuthStrategy, ServiceGuard([Services.IMPORT_CONSENTS]), validateFile(multer.array('file', 1)), controller.importConsents);

    app.route('/api/consent-import/records')
        .get(CDPAuthStrategy, ServiceGuard([Services.IMPORT_CONSENTS]), controller.getConsentImportRecord);

    app.route('/api/consent-import/records/:id/download')
        .get(CDPAuthStrategy, ServiceGuard([Services.IMPORT_CONSENTS]), controller.getDownloadUrl);
};

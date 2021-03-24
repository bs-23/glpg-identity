const path = require("path");
const controller = require('./import-consents.controller');
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/platform/user/server/user-authentication.middleware.js'));
const { Services } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.constants'));
const { ServiceGuard } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.middleware'));
const multer = require(path.join(process.cwd(), 'src/modules/privacy/import-consents/server/multer'));
const { validateFile } = require('./import-consents.schema');

module.exports = app => {
    app.route('/api/consent/bulk-import')
        .post(CDPAuthStrategy, ServiceGuard([Services.IMPORT_CONSENTS]), validateFile(multer.array('file', 1)), controller.bulkImportConsents);

    app.route('/api/consent/imported-hcp-consents')
        .get(CDPAuthStrategy, ServiceGuard([Services.IMPORT_CONSENTS]), controller.getImportedHcpConsents);
};

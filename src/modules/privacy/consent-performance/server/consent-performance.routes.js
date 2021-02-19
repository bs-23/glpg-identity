const path = require('path');
const controller = require('./consent-performance.controller');
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/platform/user/server/user-authentication.middleware'));
const { Services } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.constants'));
const { ServiceGuard } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.middleware'));

module.exports = app => {
    app.route('/api/cdp-consent-performance-report')
        .get(CDPAuthStrategy, ServiceGuard([Services.CONSENT_PERFORMANCE]), controller.getCdpConsentsReport);

    app.route('/api/veeva-consent-performance-report')
        .get(CDPAuthStrategy, ServiceGuard([Services.CONSENT_PERFORMANCE]), controller.getVeevaConsentsReport);

    app.route('/api/export-cdp-consent-performance-report')
        .get(CDPAuthStrategy, ServiceGuard([Services.CONSENT_PERFORMANCE]), controller.exportCdpConsentsReport);

    app.route('/api/export-veeva-consent-performance-report')
        .get(CDPAuthStrategy, ServiceGuard([Services.CONSENT_PERFORMANCE]), controller.exportVeevaConsentsReport);
};

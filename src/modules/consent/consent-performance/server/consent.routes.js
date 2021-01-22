const path = require("path");
const controller = require('./consent.controller');
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/platform/user/server/user-authentication.middleware.js'));

module.exports = app => {
    app.route('/api/cdp-consent-performance-report')
        .get(CDPAuthStrategy, controller.getCdpConsentsReport);

    app.route('/api/veeva-consent-performance-report')
        .get(CDPAuthStrategy, controller.getVeevaConsentsReport);
};

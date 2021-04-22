const path = require("path");
const controller = require('./crdlp.controller');
const { Services } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.constants'));
const { ServiceGuard } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.middleware'));
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/platform/user/server/user-authentication.middleware'));

module.exports = app => {
    app.route('/api/crdlp/:id/multichannel-consents')
        .get(CDPAuthStrategy, ServiceGuard([Services.PRIVACY]), controller.getMultichannelConsentsByOnekeyId);
};

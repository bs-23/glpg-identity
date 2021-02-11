const path = require('path');
const controller = require('./okla.controller');
const { Services } = require('../../../core/server/authorization/authorization.constants');
const { ServiceGuard } = require('../../../core/server/authorization/authorization.middleware');
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/platform/user/server/user-authentication.middleware.js'));

module.exports = app => {
    app.route('/api/okla/hcps/search')
        .post(CDPAuthStrategy, ServiceGuard([Services.DISCOVER_HCP_HCO]), controller.searchOklaHcps);

    app.route('/api/okla/hcps/:codbase/:id')
        .get(CDPAuthStrategy, ServiceGuard([Services.DISCOVER_HCP_HCO]), controller.getOklaHcpDetails);

    app.route('/api/okla/hcos/search')
        .post(CDPAuthStrategy, ServiceGuard([Services.DISCOVER_HCP_HCO]), controller.searchOklaHcos);

    app.route('/api/okla/hcos/:codbase/:id')
        .get(CDPAuthStrategy, ServiceGuard([Services.DISCOVER_HCP_HCO]), controller.getOklaHcoDetails);
};

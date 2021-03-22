const path = require('path');
const controller = require('./campaign.controller');
const { Services } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.constants'));
const { ServiceGuard } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.middleware'));
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/platform/user/server/user-authentication.middleware.js'));

module.exports = app => {
    app.route('/api/campaigns')
        .get(CDPAuthStrategy, ServiceGuard([Services.MANAGE_MASS_MAILING]), controller.getCampaigns);
};

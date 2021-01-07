const passport = require('passport');
const path = require("path");
const controller = require('./business-partner.controller');
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/platform/user/server/user-authentication.middleware.js'));

module.exports = app => {
    app.route('/api/partner-requests')
        .get(controller.getPartnerRequests);
};

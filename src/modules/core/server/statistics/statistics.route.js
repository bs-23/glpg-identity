const path = require("path");
const controller = require('./statistics.controller');
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/platform/user/server/user-authentication.middleware.js'));

module.exports = app => {
    app.route('/api/statistics')
        .get(CDPAuthStrategy, controller.getStatistics);
};

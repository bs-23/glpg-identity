const path = require('path');
const controller = require('./statistics.controller');
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/platform/user/server/user-authentication.middleware'));

module.exports = app => {
    app.route('/api/statistics').get(CDPAuthStrategy, controller.getStatistics);

    app.route('/api/export-hot-statistics').get(CDPAuthStrategy, controller.exportHotStatistics);
};

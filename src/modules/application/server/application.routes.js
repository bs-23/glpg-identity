const controller = require('./application.controller');

module.exports = app => {
    app.post('/api/applications/getAccessToken', controller.getAccessToken);
};

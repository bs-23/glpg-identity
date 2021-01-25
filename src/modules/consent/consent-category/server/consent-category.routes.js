const path = require("path");
const controller = require('./consent-category.controller');
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/platform/user/server/user-authentication.middleware.js'));

module.exports = app => {
    app.route('/api/privacy/consent-categories')
        .get(CDPAuthStrategy, controller.getConsentCategories)
        .post(CDPAuthStrategy, controller.createConsentCategory);

    app.route('/api/privacy/consent-categories/:id')
        .get(CDPAuthStrategy, controller.getConsentCategory)
        .put(CDPAuthStrategy, controller.updateConsentCategory);
};

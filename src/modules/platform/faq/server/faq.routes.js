const path = require("path");
const controller = require('./faq.controller');
const { Modules } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.constants'));
const { ModuleGuard } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.middleware'));
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/platform/user/server/user-authentication.middleware.js'));

module.exports = app => {
    app.route('/api/faq')
        .get(CDPAuthStrategy, controller.getFaqItems)
        .post(CDPAuthStrategy, ModuleGuard(Modules.PLATFORM.value), controller.createFaqItem);


    app.route('/api/faq/category')
        .get(CDPAuthStrategy, controller.getFaqCategories);

    app.route('/api/faq/:id')
        .get(CDPAuthStrategy, controller.getFaqItem)
        .patch(CDPAuthStrategy, controller.updateFaqItem)
        .delete(CDPAuthStrategy, controller.deleteFaqItem);
};

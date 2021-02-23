const path = require('path');
const controller = require(path.join(process.cwd(), 'src/modules/core/server/localization/localization.controller'));
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/platform/user/server/user-authentication.middleware'));

module.exports = app => {
    app.route('/api/localizations')
        .get(CDPAuthStrategy, controller.getLocalizations);
};

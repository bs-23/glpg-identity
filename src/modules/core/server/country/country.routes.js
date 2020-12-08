const path = require("path");
const controller = require('./country.controller');
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/platform/user/server/user-authentication.middleware.js'));

module.exports = app => {
    app.route('/api/countries')
        .get(CDPAuthStrategy, controller.getCountries);

    app.route('/api/all_countries')
        .get(CDPAuthStrategy, controller.getAllCountries);
};

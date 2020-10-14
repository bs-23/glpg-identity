const path = require("path");
const controller = require('./country.controller');
const { CDPAuthStrategy } = require(path.join(process.cwd(), 'src/modules/core/server/authorization/authorization.middleware'));

module.exports = app => {
    app.route('/api/countries')
        .get(CDPAuthStrategy, controller.getCountries);

    app.route('/api/all_countries')
        .get(CDPAuthStrategy, controller.getAllCountries);
};

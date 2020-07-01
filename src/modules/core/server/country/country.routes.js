const passport = require('passport');
const controller = require('./country.controller');

module.exports = app => {
    app.route('/api/cdp/countries')
        .get(passport.authenticate('user-jwt', { session: false }), controller.getCountries);

    app.route('/api/countries')
        .get(passport.authenticate('application-jwt', { session: false }), controller.getCountries);
};

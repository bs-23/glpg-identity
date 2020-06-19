const passport = require('passport');
const controller = require('./country.controller');

module.exports = app => {
    app.route('/api/countries')
        .get(passport.authenticate('user-jwt', { session: false }), controller.getCountries);
};
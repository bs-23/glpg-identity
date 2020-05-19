/* eslint-disable quotes */
const passport = require('passport');
const controller = require('./country.controller');

module.exports = app => {


    app.route('/countries').get(
        passport.authenticate('user-jwt', { session: false }),
        controller.getCountryList
    );

};

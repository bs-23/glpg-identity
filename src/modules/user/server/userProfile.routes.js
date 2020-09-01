const passport = require('passport');
const controller = require('./userProfile.controller');

module.exports = app => {
    app.route('/api/profiles')
        .get(passport.authenticate('user-jwt', { session: false }), controller.getProfiles);

};

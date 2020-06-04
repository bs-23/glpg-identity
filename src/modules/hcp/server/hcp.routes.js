/* eslint-disable quotes */
const passport = require('passport');
const controller = require('./hcp.controller');

module.exports = app => {

    app.route('/hcp-users').get(
        passport.authenticate('user-jwt', { session: false }),
        controller.getHcpUserList
    );

};

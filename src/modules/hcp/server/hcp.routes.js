/* eslint-disable quotes */
const passport = require('passport');
const controller = require('./hcp.controller');

module.exports = app => {

    app.route('/hcp-users').get(
        passport.authenticate('user-jwt', { session: false }),
        controller.getHcpUserList
    );

    app.route('/hcpUsersStatusChange').post(
        passport.authenticate('user-jwt', { session: false }),
        controller.changeHcpUserStatus
    );

    app.route('/editHcpUserProfile').post(
        passport.authenticate('user-jwt', { session: false }),
        controller.editHcpProfile
    );

};

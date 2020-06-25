const passport = require('passport');
const controller = require('./user.controller');

module.exports = app => {
    /**
     * @swagger
     * /api/login:
     *    post:
     *      tags:
     *          - Users
     *      summary: Login as CDP user.
     *      consumes:
     *        - application/json
     *      parameters:
     *        - name: body
     *          in: body
     *          schema:
     *            type: object
     *            properties:
     *              email:
     *                type: string
     *              password:
     *                type: string
     *      responses:
     *        200:
     *          description: Sets cookie with auth token and returns user.
     *          schema:
     *            type: object
     *            properties:
     *              email:
     *                  description: Email of the user
     *                  type: string
     *              id:
     *                  description: User's ID
     *                  type: string
     *              name:
     *                  description: Name of the user
     *                  type: string
     *              type:
     *                  description: Type of teh authentication
     *                  type: string
     */
    app.post('/api/login', controller.login);

    app.get('/api/logout', passport.authenticate('user-jwt', { session: false }), controller.logout);

    app.route('/api/users')
        .get(passport.authenticate('user-jwt', { session: false }), controller.getUsers)
        .post(passport.authenticate('user-jwt', { session: false }), controller.createUser);

    app.route('/api/users/:id')
        .delete(passport.authenticate("user-jwt", { session: false }), controller.deleteUser);

    app.get('/api/users/getSignedInUserProfile', passport.authenticate('user-jwt', { session: false }), controller.getSignedInUserProfile);

    app.post('/api/users/changePassword', passport.authenticate('user-jwt', { session: false }), controller.changePassword);
};

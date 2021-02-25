const path = require("path");
const jwt = require('jsonwebtoken');
const passport = require('passport');
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));
const { generateAccessToken } = require(path.join(process.cwd(), "src/modules/platform/user/server/user.controller.js"));
const { getUserWithPermissionRelations } = require(path.join(process.cwd(), "src/modules/platform/user/server/permission/permissions.js"));
const logger = require(path.join(process.cwd(), 'src/config/server/lib/winston'));

const CDPAuthStrategy = (req, res, next) => (
    passport.authenticate('user-jwt', async function(err, user) {
        if (err) {
            logger.error(err);
            return res.status(500).send('Internal server error');
        }

        if (!user) {
            try {
                const refreshTokenFromCookie = req.signedCookies['refresh_token'];

                if(!refreshTokenFromCookie) throw new Error();

                const payload = jwt.verify(refreshTokenFromCookie, nodecache.getValue('CDP_REFRESH_SECRET'));

                const userInstanceFromDB = await getUserWithPermissionRelations({
                    id: payload.id
                });

                if(!userInstanceFromDB) throw new Error();

                if(userInstanceFromDB.refresh_token !== refreshTokenFromCookie) throw new Error();

                const updatedAccessToken = generateAccessToken(userInstanceFromDB);

                req.logIn(userInstanceFromDB, { session: false }, function(error) {
                    if (error) { return next(error); }
                    res.cookie('access_token', updatedAccessToken, { httpOnly: true, sameSite: true, signed: true });
                    res.cookie('refresh_token', userInstanceFromDB.refresh_token, { httpOnly: true, sameSite: true, signed: true });
                    next();
                });
            } catch(error) {
                res.clearCookie('access_token');
                res.clearCookie('refresh_token');
                res.clearCookie('logged_in');
                return res.status(401).send('The refresh token is invalid or expired.');
            }
            return;
        }

        req.logIn(user, { session: false }, function (error) {
            if (error) { return next(error); }
            next();
        });
    })
)(req, res, next)

exports.CDPAuthStrategy = CDPAuthStrategy;

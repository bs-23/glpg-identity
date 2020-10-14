const path = require("path");
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require(path.join(process.cwd(), "src/modules/user/server/user.model"));
const Permission = require(path.join(process.cwd(), "src/modules/user/server/permission/permission.model"));
const UserRole = require(path.join(process.cwd(), "src/modules/user/server/user-role.model"));
const Role = require(path.join(process.cwd(), "src/modules/user/server/role/role.model"));
const RolePermission = require(path.join(process.cwd(), "src/modules/user/server/role/role-permission.model"));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));
const { generateAccessToken } = require(path.join(process.cwd(), "src/modules/user/server/user.controller.js"));

const AdminGuard = (req, res, next) => {
    if (!req.user) return res.status(401).send('unauthorized');
    if (req.user.type.toLowerCase() !== 'admin') return res.status(403).send('forbidden');

    next();
};

const AuthGuard = passport.authenticate('user-jwt', { session: false });

const isPermitted = (module, permissions) => {
    if (permissions.some(p => p === module)) {
        return true;
    }
    return false;
};

async function getUserWithPermissions(id) {
    const userWithPermissions = await User.findOne({
        where: { id },
        include: [{
            model: UserRole,
            as: 'userrole',
            include: [{
                model: Role,
                as: 'role',
                include: [{
                    model: RolePermission,
                    as: 'rolePermission',
                    include: [{
                        model: Permission,
                        as: 'permission',
                    }]

                }]
            }]
        }]
    });

    return userWithPermissions;
}

function getPermissions(userrole) {
    const permissions = [];
    if (userrole) {
        userrole.forEach(ur => {
            permissions.push(ur.role.rolePermission.map(rp => rp.permission.module));
        })
        return permissions.flat(1);
    }
}

const ModuleGuard = (moduleName) => {
    return async function (req, res, next) {
        const user = await getUserWithPermissions(req.user.id);
        const userPermissions = getPermissions(user.userrole);

        if (!isPermitted(moduleName, userPermissions)) {
            return res
                .status(403)
                .send('Forbidden! You are not authorized to view this page');
        }
        next();
    }
};

const adminPipeline = [AuthGuard, AdminGuard];

const CDPAuthStrategy = (req, res, next) => (
    passport.authenticate('user-jwt', async function(err, user) {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal server error');
        }

        if (!user) {
            try {
                const refreshTokenFromCookie = req.signedCookies['refresh_token'];

                if(!refreshTokenFromCookie) throw new Error();

                const payload = jwt.verify(refreshTokenFromCookie, nodecache.getValue('CDP_REFRESH_SECRET'));

                const userInstanceFromDB = await User.findOne({ where: { id: payload.id },
                    include: [{
                        model: UserRole,
                        as: 'userrole',
                        include: [{
                            model: Role,
                            as: 'role',
                            include: [{
                                model: RolePermission,
                                as: 'rolePermission',
                                include: [{
                                    model: Permission,
                                    as: 'permission'
                                }]
                            }]
                        }]
                    }]
                })

                if(!userInstanceFromDB) throw new Error();

                if(userInstanceFromDB.refresh_token !== refreshTokenFromCookie) throw new Error();

                const updatedAccessToken = generateAccessToken(userInstanceFromDB);

                req.logIn(userInstanceFromDB, { session: false }, function(err) {
                    if (err) { return next(err); }
                    res.cookie('access_token', updatedAccessToken, { httpOnly: true, sameSite: true, signed: true });
                    res.cookie('refresh_token', userInstanceFromDB.refresh_token, { httpOnly: true, sameSite: true, signed: true });
                    next();
                });
            } catch(err) {
                res.clearCookie('access_token');
                res.clearCookie('refresh_token');
                res.clearCookie('logged_in');
                return res.status(401).send('The refresh token is invalid or expired.');
            }
            return;
        }

        req.logIn(user, { session: false }, function(err) {
          if (err) { return next(err); }
          next();
        });
    })
)(req, res, next)

exports.AdminGuard = AdminGuard;
exports.AuthGuard = AuthGuard;
exports.ModuleGuard = ModuleGuard;
exports.adminPipeline = adminPipeline;
exports.CDPAuthStrategy = CDPAuthStrategy;

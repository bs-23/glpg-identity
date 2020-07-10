const path = require("path");
const passport = require('passport');
const User = require(path.join(process.cwd(), "src/modules/user/server/user.model"));
const Userpermission = require(path.join(process.cwd(), "src/modules/user/server/user-permission.model"));
const Permission = require(path.join(process.cwd(), "src/modules/permission/permission.model"));

const AdminGuard = (req, res, next) => {
    if (!req.user) return res.status(401).send('unauthorized');
    if (req.user.type.toLowerCase() !== 'admin')
        return res.status(403).send('forbidden');
    next();
};

const AuthGuard = passport.authenticate('user-jwt', { session: false });

const isPermitted = (action, userPermission) => {

    if(userPermission.some(element =>
       element.permission.action === action
    )) {
        return true;
    } else {
        return false;
    }
};

async function getUserWithPermissions(id) {
    const userWithPermissions =   await User.findOne({ where: { id: id },
        include: [
            {
              model: Userpermission,
              as: 'userpermission',
              include: [
                {
                  model: Permission,
                  as: 'permission',
                }
            ]
            }
        ]
    });
    return userWithPermissions;

}

const ModuleGuard = (actionName) => {
    return function (req, res, next) {
        passport.authenticate('user-jwt', { session: false }, async (err, user, info) => {

            if (err) return res.status(500).send(err);
            if (!user) return res.status(401).send('Authenticaton Failed');

            req.user = await  getUserWithPermissions(user.id);


            if (user.type.toLowerCase() === 'admin') return next();

            if (!isPermitted(actionName, req.user.userpermission)) {
                return res
                    .status(403)
                    .send('Forbidden! Request Module Permissions.');
            }

            next();
        })(req, res, next);
    }
  }

const adminPipeline = [AuthGuard, AdminGuard];

exports.AdminGuard = AdminGuard;
exports.AuthGuard = AuthGuard;
exports.ModuleGuard = ModuleGuard;
exports.adminPipeline = adminPipeline;

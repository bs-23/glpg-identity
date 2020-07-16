const path = require("path");
const passport = require('passport');
const User = require(path.join(process.cwd(), "src/modules/user/server/user.model"));
const Userpermission = require(path.join(process.cwd(), "src/modules/user/server/user-permission.model"));
const Permission = require(path.join(process.cwd(), "src/modules/user/server/permission/permission.model"));

const AdminGuard = (req, res, next) => {
    if (!req.user) return res.status(401).send('unauthorized');
    if (req.user.type.toLowerCase() !== 'admin')
        return res.status(403).send('forbidden');
    next();
};

const AuthGuard = passport.authenticate('user-jwt', { session: false });

const isPermitted = (module, userPermission) => {


    if(userPermission.some(element =>element.permission.module === module )) {
        return true;
    }

    return false;
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

const ModuleGuard = (moduleName) => {
    return async function (req, res, next) {
            const user = await  getUserWithPermissions(req.user.id);

            if (!isPermitted(moduleName, user.userpermission)) {
                return res
                    .status(403)
                    .send('Forbidden! You are not authorized to view this page');
            }
            next();
    }
  }

const adminPipeline = [AuthGuard, AdminGuard];

exports.AdminGuard = AdminGuard;
exports.AuthGuard = AuthGuard;
exports.ModuleGuard = ModuleGuard;
exports.adminPipeline = adminPipeline;

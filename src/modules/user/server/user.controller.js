const path = require('path');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('./user.model');
const UserPermission = require('./user-permission.model');
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));
const emailService = require(path.join(process.cwd(), 'src/config/server/lib/email-service/email.service'));
const logService = require(path.join(process.cwd(), 'src/modules/core/server/audit/audit.service'));
const ResetPassword = require('./reset-password.model');
const { Op } = require('sequelize');
const Userpermission = require(path.join(process.cwd(), "src/modules/user/server/user-permission.model"));
const Permission = require(path.join(process.cwd(), "src/modules/user/server/permission/permission.model"));

function validatePassword(password) {
    const minimumPasswordLength = 8
    if (password.length < minimumPasswordLength) return false

    const hasUppercase = new RegExp("^(?=.*[A-Z])").test(password);
    if (!hasUppercase) return false

    const hasDigit = new RegExp("^(?=.*[0-9])").test(password);
    if (!hasDigit) return false

    const specialCharacters = "!@#$%^&*"
    let hasSpecialCharacter = false
    for (const c of password) {
        if (specialCharacters.includes(c)) {
            hasSpecialCharacter = true
            break
        }
    }
    return hasSpecialCharacter
}

function generateAccessToken(user) {
    return jwt.sign({
        id: user.id,
        name: user.name,
        email: user.email,
    }, nodecache.getValue('CDP_TOKEN_SECRET'), {
        expiresIn: '2d',
        issuer: user.id.toString()
    });
}

function getPermissions(userPermission) {
    if(userPermission) {
        const permissions = userPermission.map(up => up.permission.module);
        return permissions;
    }

}

function formatProfile(user) {
    const profile = {
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.type,
        permissions: getPermissions(user.userpermission)
    };

    return profile;
}

async function getSignedInUserProfile(req, res) {
    res.json(formatProfile(req.user));
}

async function login(req, res) {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } ,
        include: [
            {
              model: Userpermission,
              as: 'userpermission',
              include: [
                {
                  model: Permission,
                  as: 'permission'
                }
            ]
            }
        ]
    });

        if (!user || !user.password || !user.validPassword(password)) {
            return res.status(401).send('Invalid email or password.');
        }

        if (user.type === 'basic' && user.expiary_date <= new Date()) {
            await user.update({ status: 'inactive' })
            return res.status(401).send('Expired')
        }

        res.cookie('access_token', generateAccessToken(user), {
            expires: new Date(Date.now() + 8.64e7),
            httpOnly: true
        });

        await user.update({ last_login: Date() })

        res.json(formatProfile(user));
    } catch (err) {
        res.status(500).send(err);
    }
}


async function logout(req, res) {
    res.clearCookie('access_token').redirect('/');
}

async function createUser(req, res) {
    const {
        name,
        email,
        phone,
        countries,
        permissions,
        application_id,
        expiary_date
    } = req.body;

    try {
        const [doc, created] = await User.findOrCreate({
            where: { email },
            defaults: {
                name,
                phone,
                countries,
                application_id,
                created_by: req.user.id,
                updated_by: req.user.id,
                expiary_date
            }
        });

        if (!created) {
            return res.sendStatus(400);
        }

        permissions.forEach(async function(permissionId){

            await UserPermission.create({
                permissionId: permissionId,
                userId: doc.id,
                created_by: req.user.id,
                updated_by: req.user.id,
            });

        });
        const logData = {
            event_type: 'CREATE',
            object_id: doc.id,
            table_name: 'users',
            created_by: req.user.id,
            description: 'Created new CDP user',
        }
        await logService.log(logData)

        const token = crypto.randomBytes(36).toString('hex');
        const expireAt = Date.now() + 3600000;

        const [resetRequest, reqCreated] = await ResetPassword.findOrCreate({
            where: { user_id: doc.id },
            defaults: {
                token,
                expires_at: expireAt,
                type: 'set'
            }
        });

        if (!reqCreated && resetRequest) {
            await resetRequest.update({
                token,
                expires_at: expireAt,
                type: 'set'
            });
        }

        const link = `${req.protocol}://${req.headers.host}/reset-password?token=${token}`;

        const templateUrl = path.join(process.cwd(), `src/config/server/lib/email-service/templates/cdp-password-set.html`);
        const options = {
            toAddresses: [doc.email],
            templateUrl,
            subject: 'Set a password for your new account on GLPG CDP',
            data: {
                name: doc.name || '',
                link
            }
        };

        emailService.send(options);

        res.json(doc);
    } catch (err) {
        res.status(500).send(err);
    }
}

async function changePassword(req, res) {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    try {
        const user = await User.findOne({ where: { id: req.user.id } });

        if (!user || !user.validPassword(currentPassword)) {
            return res.status(400).send('Current Password not valid');
        }

        if (!validatePassword(newPassword)) return res.status(400).send('Invalid password')

        if (newPassword !== confirmPassword) {
            return res.status(400).send('Passwords should match');
        }

        user.password = newPassword;
        await user.save();

        res.json(formatProfile(user));
    } catch (err) {
        res.status(500).send(err);
    }
}

async function deleteUser(req, res) {
    try {
        await User.destroy({ where: { id: req.params.id } });

        res.json({ id: req.params.id });
    } catch (err) {
        res.status(500).send(err);
    }
}

async function getUsers(req, res) {

    const page = req.query.page ? req.query.page - 1 : 0;
    if (page < 0) return res.status(404).send("page must be greater or equal 1");

    const limit = 20;
    const country = req.query.country === 'null' ? null : req.query.country;
    const offset = page * limit;

    try {

        const users = await User.findAll(
            {
                where: {
                    type: 'basic',
                    countries: country ? { [Op.contains]: [country] } : { [Op.ne]: ["undefined"] }
                },
                offset,
                limit,
                order: [
                    ['created_at', 'ASC'],
                    ['id', 'ASC']
                ]
            });

        const totalUser = await User.count({
            where: {
                type: 'basic',
                countries: country ? { [Op.contains]: [country] } : { [Op.ne]: ["undefined"] }
            },
        });

        const data = {
            users: users,
            page: page + 1,
            limit: limit,
            total: totalUser,
            start: limit * page + 1,
            end: offset + limit > totalUser ? totalUser : offset + limit,
            country: country ? country : null
        };


        res.json(data);

    } catch (err) {
        res.status(500).send(err);
    }
}

async function getUser(req, res) {
    try {
        const user = await User.findOne({
            where: {
                id: req.params.id
            },
            attributes: ['id', 'name', 'email', 'phone', 'type', 'last_login']
        });

        if (!user) return res.status(404).send("User is not found or may be removed");

        res.json(user);
    }
    catch (err) {
        res.status(500).send(err);
    }
}


async function sendPasswordResetLink(req, res) {
    try {
        const { email } = req.body;

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(400).send('Email does not exist.');
        }

        const token = crypto.randomBytes(36).toString('hex');
        const expireAt = Date.now() + 3600000;

        const [doc, created] = await ResetPassword.findOrCreate({
            where: { user_id: user.id },
            defaults: {
                token,
                expires_at: expireAt
            }
        });

        if (!created && doc) {
            await doc.update({
                token,
                expires_at: expireAt
            });
        }

        const link = `${req.protocol}://${req.headers.host}/reset-password?token=${token}`;

        const templateUrl = path.join(process.cwd(), `src/config/server/lib/email-service/templates/cdp-password-reset-instruction.html`);
        const options = {
            toAddresses: [user.email],
            templateUrl,
            subject: 'Password Reset Instructions',
            data: {
                name: user.name || '',
                link
            }
        };

        emailService.send(options);

        res.json({ message: `Password reset link sent to ${email}.` });
    } catch (error) {
        res.status(500).send(error);
    }
}

async function resetPassword(req, res) {
    try {
        const { token } = req.query;

        if (!token) return res.status(400).send('Invalid password reset token');

        const resetRequest = await ResetPassword.findOne({ where: { token } });

        if (!resetRequest) return res.status(400).send("Invalid password reset token.");

        if (resetRequest.expires_at < Date.now()) {
            await resetRequest.destroy();
            return res.status(400).send("Password reset token has been expired. Please request again.");
        }

        if (req.body.newPassword !== req.body.confirmPassword) return res.status(400).send("Password and confirm password doesn't match.");

        const user = await User.findOne({ where: { id: resetRequest.user_id } });

        user.update({ password: req.body.newPassword });

        const options = {
            toAddresses: [user.email],
            data: {
                name: user.name || ''
            }
        };

        if(resetRequest.type === 'set'){
            options.templateUrl = path.join(process.cwd(), `src/config/server/lib/email-service/templates/cdp-registration-success.html`);
            options.subject = 'You have successfully set a password for your Galapagos CDP account'
            options.data.link = `${req.protocol}://${req.headers.host}/login`
        }
        else{
            options.templateUrl = path.join(process.cwd(), `src/config/server/lib/email-service/templates/cdp-password-reset.html`);
            options.subject = 'Your password has been reset'
        }

        emailService.send(options);

        await resetRequest.destroy();

        res.sendStatus(200);
    } catch (error) {
        res.status(500).send(error);
    }
}


exports.login = login;
exports.logout = logout;
exports.createUser = createUser;
exports.getSignedInUserProfile = getSignedInUserProfile;
exports.changePassword = changePassword;
exports.deleteUser = deleteUser;
exports.getUsers = getUsers;
exports.getUser = getUser;
exports.sendPasswordResetLink = sendPasswordResetLink;
exports.resetPassword = resetPassword;

const path = require('path');
const crypto = require('crypto');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const User = require('./user.model');
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));
const emailService = require(path.join(process.cwd(), 'src/config/server/lib/email-service/email.service'));
const logService = require(path.join(process.cwd(), 'src/modules/core/server/audit/audit.service'));
const ResetPassword = require('./reset-password.model');
const UserRole = require(path.join(process.cwd(), "src/modules/user/server/user-role.model"));
const Role = require(path.join(process.cwd(), "src/modules/user/server/role/role.model"));
const RolePermission = require(path.join(process.cwd(), "src/modules/user/server/role/role-permission.model"));
const Permission = require(path.join(process.cwd(), "src/modules/user/server/permission/permission.model"));
const axios = require("axios");
const Application = require(path.join(process.cwd(), "src/modules/application/server/application.model"));
const PasswordPolicies = require(path.join(process.cwd(), "src/modules/core/server/password/password-policies.js"));

function generateAccessToken(user) {
    return jwt.sign({
        id: user.id,
        first_name: user.last_name,
        last_name: user.last_name,
        email: user.email,
    }, nodecache.getValue('CDP_TOKEN_SECRET'), {
        expiresIn: '2d',
        issuer: user.id.toString()
    });
}

function getRolesPermissions(userrole) {
    const roles = [];

    if (userrole) {
        userrole.forEach(ur => {
            roles.push({
                title: ur.role.name,
                permissions: ur.role.rolePermission.map(rp => rp.permission.module)
            });
        });

        return roles;
    }
}

function getCommaSeparatedRoles(userrole) {
    if (userrole) {
        const roles = userrole.map(ur => ur.role.name);
        return roles.join();
    }
}

function formatProfile(user) {
    const profile = {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        type: user.type,
        roles: getRolesPermissions(user.userrole),
        application: user.application,
        countries: user.countries
    };
    return profile;
}

function formatProfileDetail(user) {
    const profile = {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        type: user.type,
        phone: user.phone,
        last_login: user.last_login,
        expiry_date: user.expiry_date,
        roles: getCommaSeparatedRoles(user.userrole),
        application: user.application_name,
        countries: user.countries
    };

    return profile;
}

async function attachApplicationInfoToUser(user) {
    const userApplication = await Application.findOne({ where: { id: user.application_id } });
    user.application = userApplication ? {
        name: userApplication.name,
        slug: userApplication.slug,
        logo_link: userApplication.logo_link
    } : null;
    return user;
}

async function getSignedInUserProfile(req, res) {
    try {
        const user = await attachApplicationInfoToUser(req.user);
        res.json(formatProfile(user));
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function login(req, res) {
    try {
        const { email, password, recaptchaToken } = req.body;

        if (!recaptchaToken) {
            return res.status(400).send('Captcha verification required.');
        }

        const user = await User.findOne({
            where: {
                email: {
                    [Op.iLike]: `%${email}%`
                }
            },
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

        if (user && user.dataValues.failed_auth_attempt >= 5) {
            return res.status(401).send('Your account has been locked for consecutive failed auth attempts. Please use the Forgot Password link to unlock.');
        }

        if (user && (!user.password || !user.validPassword(password))) {
            await user.update(
                { failed_auth_attempt: parseInt(user.dataValues.failed_auth_attempt ? user.dataValues.failed_auth_attempt : '0') + 1 },
                { where: { email: email } }
            );
        }

        if (!user || !user.password || !user.validPassword(password)) {
            return res.status(401).send('Invalid email or password.');
        }

        const isSiteVerified = await verifySite(recaptchaToken);

        if (!isSiteVerified) {
            return res.status(400).send('Failed captcha verification.');
        }

        res.cookie('access_token', generateAccessToken(user), {
            expires: new Date(Date.now() + 8.64e7),
            httpOnly: true
        });

        await user.update({ last_login: Date() })

        const userWithApplication = await attachApplicationInfoToUser(user)

        await user.update(
            { failed_auth_attempt: 0 },
            { where: { email: email } }
        );

        res.json(formatProfile(userWithApplication));
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function logout(req, res) {
    res.clearCookie('access_token').redirect('/');
}

async function createUser(req, res) {
    const {
        first_name,
        last_name,
        email,
        country_code,
        phone,
        countries,
        roles,
        application_id,
    } = req.body;
    const phone_number = phone ? country_code + phone : '';
    const validForMonths = 6
    const currentDate = new Date()

    try {
        const [doc, created] = await User.findOrCreate({
            where: { email: email.toLowerCase() },
            defaults: {
                first_name,
                last_name,
                phone: phone_number ? phone_number.replace(/\s+/g, '') : null,
                countries,
                application_id,
                created_by: req.user.id,
                updated_by: req.user.id,
                expiry_date: new Date(currentDate.setMonth(currentDate.getMonth() + validForMonths))
            }
        });

        if (!created) {
            return res.status(400).send('Email already exists.');
        }

        roles && roles.forEach(async function (roleId) {
            await UserRole.create({
                roleId: roleId,
                userId: doc.id,
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

        const templateUrl = path.join(process.cwd(), `src/config/server/lib/email-service/templates/cdp/password-set.html`);
        const options = {
            toAddresses: [doc.email],
            templateUrl,
            subject: 'Setup password for your CDP account',
            data: {
                name: `${doc.first_name} ${doc.last_name}` || '',
                link
            }
        };

        emailService.send(options);

        res.json(doc);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function deleteUser(req, res) {
    try {
        await User.destroy({ where: { id: req.params.id } });

        res.json({ id: req.params.id });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function getUsers(req, res) {

    const page = req.query.page ? req.query.page - 1 : 0;
    if (page < 0) return res.status(404).send("page must be greater or equal 1");

    const limit = 3;
    const country_iso2 = req.query.country_iso2 === 'null' ? null : req.query.country_iso2;
    const offset = page * limit;

    const signedInId = (formatProfile(req.user)).id;

    try {
        const users = await User.findAll({
            where: {
                id: { [Op.ne]: signedInId },
                type: 'basic',
                countries: country_iso2 ? { [Op.contains]: [country_iso2] } : { [Op.ne]: ["undefined"] }
            },
            offset,
            limit,
            order: [
                ['created_at', 'DESC'],
                ['id', 'DESC']
            ],
            include: [{
                model: User,
                as: 'createdByUser',
                attributes: ['id', 'first_name', 'last_name'],
            }],
            attributes: { exclude: ['password'] },
        });

        const totalUser = await User.count({
            where: {
                id: { [Op.ne]: signedInId },
                type: 'basic',
                countries: country_iso2 ? { [Op.contains]: [country_iso2] } : { [Op.ne]: ["undefined"] }
            },
        });

        const data = {
            users: users,
            page: page + 1,
            limit: limit,
            total: totalUser,
            start: limit * page + 1,
            end: offset + limit > totalUser ? totalUser : offset + limit,
            country_iso2: country_iso2 ? country_iso2 : null
        };

        res.json(data);

    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function getUser(req, res) {
    try {
        const user = await User.findOne({
            where: {
                id: req.params.id
            },
            include: [{
                model: UserRole,
                as: 'userrole',
                include: [{
                    model: Role,
                    as: 'role',
                }]
            }],
        });

        if (!user) return res.status(404).send("User is not found or may be removed");

        const userApplication = await Application.findOne({ where: { id: user.application_id } });
        user.application_name = userApplication ? userApplication.name : null;

        const formattedUser = formatProfileDetail(user);

        res.json(formattedUser);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function sendPasswordResetLink(req, res) {
    try {
        const { email } = req.body;

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.json({ message: 'An email has been sent to the provided email with further instructions.' });
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

        const templateUrl = path.join(process.cwd(), `src/config/server/lib/email-service/templates/cdp/password-reset-instruction.html`);
        const options = {
            toAddresses: [user.email],
            templateUrl,
            subject: 'Password Reset Instructions',
            data: {
                name: user.first_name + " " + user.last_name || '',
                link
            }
        };

        emailService.send(options);

        res.json({ message: 'An email has been sent to the provided email with further instructions.' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function changePassword(req, res) {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    try {
        const user = await User.findOne({ where: { id: req.user.id } });

        if (!user || !user.validPassword(currentPassword)) {
            return res.status(400).send('Current Password not valid');
        }

        if (await PasswordPolicies.isOldPassword(newPassword, user)) return res.status(400).send('New password can not be your previously used password.');

        if (!PasswordPolicies.validatePassword(newPassword)) return res.status(400).send('Password must contain atleast a digit, an uppercase, a lowercase and a special character and must be 8 to 50 characters long.')

        if (newPassword !== confirmPassword) return res.status(400).send('Passwords should match');

        if (PasswordPolicies.isCommonPassword(newPassword, user)) return res.status(400).send('Password can not be commonly used passwords or personal info. Try a different one.');

        if (user.password) await PasswordPolicies.saveOldPassword(user);

        user.password = newPassword;
        await user.save();

        res.json(formatProfile(user));
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
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

        const user = await User.findOne({ where: { id: resetRequest.user_id } });

        if (await PasswordPolicies.isOldPassword(req.body.newPassword, user)) return res.status(400).send('New password can not be your previously used password.');

        if (!PasswordPolicies.validatePassword(req.body.newPassword)) return res.status(400).send('Password must contain atleast a digit, an uppercase, a lowercase and a special character and must be 8 to 50 characters long.');

        if (PasswordPolicies.isCommonPassword(req.body.newPassword, user)) return res.status(400).send('Password can not be commonly used passwords or personal info. Try a different one.');

        if (req.body.newPassword !== req.body.confirmPassword) return res.status(400).send("Password and confirm password doesn't match.");

        if (user.password) await PasswordPolicies.saveOldPassword(user);

        user.update({ password: req.body.newPassword });
        const options = {
            toAddresses: [user.email],
            data: {
                name: user.first_name + " " + user.last_name,
                link: `${req.protocol}://${req.headers.host}/login`
            }
        };

        if (resetRequest.type === 'set') {
            options.templateUrl = path.join(process.cwd(), `src/config/server/lib/email-service/templates/cdp/registration-success.html`);
            options.subject = 'Registration Successful';
        }
        else {
            options.templateUrl = path.join(process.cwd(), `src/config/server/lib/email-service/templates/cdp/password-reset.html`);
            options.subject = 'Your password has been reset'
        }

        await user.update(
            { failed_auth_attempt: 0 },
            { where: { email: user.dataValues.email } }
        );

        emailService.send(options);

        await resetRequest.destroy();

        res.sendStatus(200);

    } catch (error) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function verifySite(captchaResponseToken) {
    try {
        const secretKey = nodecache.getValue('RECAPTCHA_SECRET_KEY');

        const siteverifyResponse = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaResponseToken}`,
            null,
            {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
                }
            }
        );

        return siteverifyResponse.data.success;
    } catch (error) {
        return false;
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

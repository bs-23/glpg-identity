const path = require('path');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('./user.model');
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));
const emailService = require(path.join(process.cwd(), 'src/config/server/lib/email-service/email.service'));
const ResetPassword = require('./reset-password.model');

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

function formatProfile(user) {
    const profile = {
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.type
    };

    return profile;
}

async function getSignedInUserProfile(req, res) {
    res.json(formatProfile(req.user));
}

async function login(req, res) {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email }});

        if (!user || !user.validPassword(password)) {
            return res.status(401).send('Invalid email or password.');
        }

        res.cookie('access_token', generateAccessToken(user), {
            expires: new Date(Date.now() + 8.64e7),
            httpOnly: true
        });

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
        password,
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
                password,
                phone,
                countries,
                permissions,
                application_id,
                created_by: req.user.id,
                updated_by: req.user.id,
                expiary_date
            }
        });

        if (!created) {
            return res.sendStatus(400);
        }

        res.json(doc);
    } catch (err) {
        res.status(500).send(err);
    }
}

async function changePassword(req, res) {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    try {
        const user = await User.findOne({ where: { id: req.user.id }});

        if (!user || !user.validPassword(currentPassword)) {
            return res.status(400).send('Current Password not valid');
        }

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
        await User.destroy({ where: { id: req.params.id }});

        res.json({id: req.params.id});
    } catch(err) {
        res.status(500).send(err);
    }
}

async function getUsers(req, res) {
    try {
        const users = await User.findAll({ where: { type: 'basic' }});

        res.json(users);
    } catch(err) {
        res.status(500).send(err);
    }
}

async function getUser(req, res){
    try{
        const user = await User.findOne({
            where: {
                id: req.params.id
            },
            attributes: ['id', 'name', 'email', 'phone', 'type']
        });

        if(!user) return res.status(404).send("User is not found or may be removed");

        const last_login = await Audit.findOne({
            where: {
                userId: req.params.id,
                action: 'login'
            },
            order: [ ['created_at', 'DESC'] ],
            attributes: ["created_at"]
        });

        if(last_login) user.dataValues.last_login = last_login.created_at;
        else user.dataValues.last_login = null;

        res.json(user);
    }
    catch(err){
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

        if(!resetRequest) return res.status(400).send("Invalid password reset token.");

        if(resetRequest.expires_at < Date.now()) {
            await resetRequest.destroy();
            return res.status(400).send("Password reset token has been expired. Please request again.");
        }

        if(req.body.newPassword !== req.body.confirmPassword) return res.status(400).send("Password and confirm password doesn't match.");

        const user = await User.findOne({ where: { id: resetRequest.user_id } });

        user.update({ password: req.body.newPassword });

        await resetRequest.destroy();

        const templateUrl = path.join(process.cwd(), `src/config/server/lib/email-service/templates/cdp-password-reset.html`);
        const options = {
            toAddresses: [user.email],
            templateUrl,
            subject: 'Your password has been reset',
            data: {
                name: user.name || ''
            }
        };

        emailService.send(options);

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

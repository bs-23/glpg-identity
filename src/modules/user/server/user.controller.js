const path = require('path');
const jwt = require('jsonwebtoken');
const User = require('./user.model');
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

const emailService = require(path.join(process.cwd(), 'src/config/server/lib/email-service/email.service.js'));

function generateAccessToken(user) {
    return jwt.sign({
        id: user.id,
        name: user.name,
        email: user.email,
    }, nodecache.getValue('TOKEN_SECRET'), {
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
        client_id
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
                created_by: req.user.id,
                updated_by: req.user.id,
                client_id
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

async function sendEmail(req, res) {
    try {
        const options = {
            templateName: 'test-template',
            from: "faisal.amin@bs-23.com",
            to: "faisal.amin.cste@gmail.com",
            subject: 'Hello, from nodemailer',
            replacer: {
                param1: '1111111',
                param2: '22222222',
                param3: '333333333'
            }
        };

        await emailService.send(options);
        res.json('Email sent.');
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
exports.sendEmail = sendEmail;

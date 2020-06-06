const path = require('path');
const jwt = require('jsonwebtoken');
const User = require('./user.model');

const Client = require(path.join(process.cwd(), 'src/modules/core/server/client.model'));

function generateAccessToken(user) {
    return jwt.sign({
        id: user.id,
        name: user.name,
        email: user.email,
    }, process.env.TOKEN_SECRET, {
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
        res.sendStatus(500);
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
        permissions
    } = req.body;

    try {
        const client = await Client.findOne({
            where: { email: 'service.hcp@glpg-hcp.com' },
            attributes: ['id']
        });

        if (!client) return res.sendStatus(500);

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
                client_id: client.id
            }
        });

        if (!created) {
            return res.sendStatus(400);
        }

        res.json(doc);
    } catch (err) {
        console.log(err);
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
        res.sendStatus(400);
    }
}

async function deleteUser(req, res) {
    try {
        await User.destroy({ where: { id: req.params.id }});

        res.json({id: req.params.id});
    } catch(err) {
        res.sendStatus(500);
    }
}

async function getUsers(req, res) {
    try {
        const users = await User.findAll({ where: { type: 'site_admin' }});

        res.json(users);
    } catch(err) {
        res.sendStatus(500);
    }
}

exports.login = login;
exports.logout = logout;
exports.createUser = createUser;
exports.getSignedInUserProfile = getSignedInUserProfile;
exports.changePassword = changePassword;
exports.deleteUser = deleteUser;
exports.getUsers = getUsers;

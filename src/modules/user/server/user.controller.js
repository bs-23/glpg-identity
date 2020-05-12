const path = require("path");
const jwt = require("jsonwebtoken");
const User = require("./user.model");
const Client = require(path.join(process.cwd(), "src/modules/core/server/client.model"));

function generateAccessToken(user) {
    return jwt.sign({
        id: user.id,
        name: user.name,
        email: user.email
    }, process.env.TOKEN_SECRET, {
        expiresIn: "2d",
        issuer: user.id.toString()
    });
}

function formatProfile(user) {
    let profile = {
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
        const user = await User.findOne({ where: { email: email }, attributes: ["id", "name", "email", "password"] });

        if (!user || !user.validPassword(password)) {
            return res.status(401).send("Invalid email or password.");
        }

        res.cookie("access_token", generateAccessToken(user), {
            expires: new Date(Date.now() + 8.64e+7),
            httpOnly: true
        });

        res.json(formatProfile(user));

    } catch (err) {
        console.log(err);
    }
}

async function logout(req, res) {
    res.clearCookie("access_token").redirect("/");
}

async function createUser(req, res) {
    const { name, email, password, phone, countries, permissions, is_active } = req.body;

    try {
        const client = await Client.findOne({ where: { email: "service.hcp@glpg-hcp.com" }, attributes: ["id"] });

        if (!client) return res.sendStatus(500);

        const [doc, created] = await User.findOrCreate({
            where: { email: email }, defaults: {
                name: name,
                password: password,
                phone: phone,
                countries: countries,
                permissions: permissions,
                is_active: is_active,
                created_by: req.user.id,
                updated_by: req.user.id,
                client_id: client.id
            }
        });

        if (!created) {
            return res.status(400).send("Email address already exists.");
        }

        res.json(doc);
    } catch (err) {
        console.log(err);
    }
}

exports.login = login;
exports.logout = logout;
exports.createUser = createUser;
exports.getSignedInUserProfile = getSignedInUserProfile;

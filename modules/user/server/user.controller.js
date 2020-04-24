const jwt = require("jsonwebtoken");
const User = require("./user.model");

function generateAccessToken(user) {
    return jwt.sign({
        id: user.id,
        name: user.name,
        email: user.email
    }, process.env.TOKEN_SECRET,{
        expiresIn: "2d",
        issuer: user.id.toString()
    });
};

function formatProfile(user) {
    let profile = {
        name: user.name,
        email: user.email,
        role: user.role
    };

    return profile;
};

async function login(req, res) {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({ where: {email: email}, attributes: ["id", "name", "email"] });

        // if(!user || !user.validPassword(password)) {
        //     return res.status(401).send("Invalid email or password.");
        // }
        if(!user) {
            return res.status(401).send("Invalid email or password.");
        }

        res.cookie("access_token", generateAccessToken(user), {
            expires: new Date(Date.now() + 8.64e+7),
            httpOnly: true
        });

        res.json(formatProfile(user));

    } catch(err) {
        console.log(err);
    }
}

async function createUser(req, res) {
    const {name, email, password, role} = req.body;

    try {
        const [doc, created] = await User.findOrCreate({ email: email}, {
            name:  name,
            password: password,
            role: role,
            created_by: req.user.id
        });

        if(!created) {
            return res.status(400).send("This email address already exists.");
        }

        res.json(doc);
    } catch(error) {
        console.log(err);
    }
}

exports.login = login;
exports.createUser = createUser;

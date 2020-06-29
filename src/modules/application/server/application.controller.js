const path = require('path');
const jwt = require('jsonwebtoken');
const Application = require('./application.model');
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

function generateAccessToken(doc) {
    return jwt.sign({
        id: doc._id,
        email: doc.email,
    }, nodecache.getValue('APPLICATION_TOKEN_SECRET'), {
        expiresIn: '30d',
        issuer: doc._id.toString()
    });
}

async function getAccessToken(req, res) {
    try {
        const { email, password } = req.body;
        const doc = await Application.findOne({ where: { email }});

        if (!doc || !doc.validPassword(password)) {
            return res.status(401).send('Invalid email or password.');
        }

        res.send(generateAccessToken(doc));
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.getAccessToken = getAccessToken;

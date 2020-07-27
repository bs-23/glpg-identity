const path = require('path');
const jwt = require('jsonwebtoken');
const Application = require('./application.model');
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

function generateAccessToken(doc) {
    return jwt.sign({
        id: doc.id,
        email: doc.email,
    }, nodecache.getValue('APPLICATION_TOKEN_SECRET'), {
        expiresIn: '30d',
        issuer: doc.id.toString()
    });
}

async function getAccessToken(req, res) {
    try {
        const { email, password } = req.body;
        const application = await Application.findOne({ where: { email } });

        if (!application || !application.validPassword(password)) {
            return res.status(401).send('Invalid email or password.');
        }

        const response = {
            id: application.id,
            name: application.name,
            email: application.email,
            access_token: generateAccessToken(application),
            consent_confirmation_link: application.consent_confirmation_link,
            reset_password_link: application.reset_password_link,
            login_link: application.login_link,
            retention_period: '30 days'
        };

        res.send(response);
    } catch (err) {
        res.status(500).send(err);
    }
}

async function getApplications(req, res) {
    try {
        const applications = await Application.findAll({
            attributes: ['id', 'name', 'email', 'is_active', 'slug']
        });
        res.json(applications);

    } catch (error) {
        res.status(500).send(err);
    }
}

exports.getAccessToken = getAccessToken;
exports.getApplications = getApplications;

const path = require('path');
const jwt = require('jsonwebtoken');
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

async function login(req, res) {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).send('Password required.');
        }

        const swaggerPassword = nodecache.getValue('SWAGGER_PASSWORD');

        if(password !== swaggerPassword) {
            return res.status(401).send('Wrong password.');
        }

        const swaggerUsername = nodecache.getValue('SWAGGER_USERNAME');
        const accessToken = jwt.sign({
            username: swaggerUsername
        }, nodecache.getValue('SWAGGER_TOKEN_SECRET'), {
            expiresIn: '1d',
            issuer: swaggerUsername
        });

        res.cookie('swagger_access_token', accessToken, {
            expires: new Date(Date.now() + 8.64e7),
            httpOnly: true
        });

        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

module.exports = app => {
    app.post('/swagger/login', login);
};

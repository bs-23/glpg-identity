const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

async function login(req, res) {
    try {
        const { password } = req.body;

        //if (!password) {
        //    return res.status(400).send('Password is required.');
        //}

        //if(!bcrypt.compareSync(password, nodecache.getValue('SWAGGER_PASSWORD'))) {
        //    return res.status(401).send('Invalid password.');
        //}

        const accessToken = jwt.sign({
            id: nodecache.getValue('SWAGGER_ID')
        }, nodecache.getValue('SWAGGER_TOKEN_SECRET'), {
            expiresIn: '1d',
            issuer: nodecache.getValue('SWAGGER_ID')
        });

        res.cookie('swagger_access_token', accessToken, {
            httpOnly: true
        });

        res.cookie('logged_in_swagger', 'true', {
            maxAge: 86400000, // 1 Day
            httpOnly: false
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

const path = require('path');
const jwt = require('jsonwebtoken');
const Application = require('./application.model');
const Data = require('./data.model');
const { Op } = require('sequelize');
const { assign } = require('lodash');
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));
const { Response, CustomError } = require(path.join(process.cwd(), 'src/modules/core/server/response'));

function generateAccessToken(doc) {
    return jwt.sign({
        id: doc.id,
    }, nodecache.getValue('APPLICATION_TOKEN_SECRET'), {
        expiresIn: '2h',
        issuer: doc.id.toString()
    });
}

function generateRefreshToken(doc) {
    return jwt.sign({
        id: doc.id,
    }, nodecache.getValue('APPLICATION_REFRESH_SECRET'), {
        expiresIn: '1d',
        issuer: doc.id.toString()
    });
}

async function getToken(req, res) {
    const response = new Response({}, []);

    try {
        let application;
        const { grant_type, username, password, refresh_token } = req.body;

        if(!grant_type) {
            response.errors.push(new CustomError('grant_type is missing.', 400, 'grant_type'));
        }

        if(grant_type && grant_type !== 'password' && grant_type !== 'refresh_token') {
            response.errors.push(new CustomError('The requested grant_type is not supported.', 400, 'grant_type'));
        }

        if(grant_type === 'password') {
            if(!username || !password) {
                response.errors.push(new CustomError('The request is missing required parameters.', 400));
            } else {
                application = await Application.findOne({ where: { email: username } });

                if (!application || !application.validPassword(password)) {
                    response.errors.push(new CustomError('Invalid username or password.', 401));
                } else {
                    const new_refresh_token = generateRefreshToken(application);
                    await application.update({ refresh_token: new_refresh_token });

                    response.data.refresh_token = new_refresh_token;
                }
            }
        }

        if(grant_type === 'refresh_token') {
            if(!refresh_token) {
                response.errors.push(new CustomError('refresh_token is missing.', 400, 'refresh_token'));
            } else {
                try {
                    const decoded = jwt.verify(refresh_token, nodecache.getValue('APPLICATION_REFRESH_SECRET'));
                    application = await Application.findOne({ where: { id: decoded.id } });

                    if(application.refresh_token !== refresh_token) {
                        response.errors.push(new CustomError('The refresh_token is invalid.', 4401));
                    }
                } catch(err) {
                    console.error(err);
                    response.errors.push(new CustomError('The refresh_token is expired.', 4401));
                }
            }
        }

        if (response.errors.length) return res.status(400).send(response);

        response.data = {
            ...response.data,
            token_type: 'bearer',
            access_token: generateAccessToken(application),
            expires_in: '7200000'
        };

        res.send(response);
    } catch (err) {
        console.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

async function getApplications(req, res) {
    try {
        const applications = await Application.findAll({
            attributes: ['id', 'name', 'email', 'is_active', 'slug']
        });

        res.json(applications);

    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function saveData(req, res) {
    const response = new Response({}, []);

    try{
        const {type, data} = req.body;

        if(!type) {
            response.errors.push(new CustomError('Type is missing.', 400, 'type'));
        }

        if(!data) {
            response.errors.push(new CustomError('Data is missing.', 400, 'data'));
        }

        const isJSON = (str) => {
            try {
                return (JSON.parse(str) && !!str);
            } catch (e) {
                return false;
            }
        }

        if(!isJSON(data)){
            response.errors.push(new CustomError('Data is not valid.', 400, 'data'));
        }

        if (response.errors.length) {
            return res.status(400).send(response);
        }



        const info = await Data.create({
            application_id: req.user.id,
            type,
            data,
            created_by: req.user.id,
            updated_by: req.user.id
        });

        response.data = {
            id: info.id,
            type: info.type,
            data: info.data,
            created_at: info.created_at,
            updated_at: info.updated_at
        };

        res.json(response);
    }
    catch(err){
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function getData(req, res) {
    const response = new Response({}, []);
    try{
        const doc = await Data.findOne({
            where: { id: req.params.id },
            include: {
                model: Application,
                as: 'application',
                attributes: ['id', 'name'],
            }
        });

        if (!doc) {
            response.errors.push(new CustomError('Profile not found.', 404));
            return res.status(404).send(response);
        }
        response.data = doc;

        res.json(response);
    }
    catch(err){
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

exports.getToken = getToken;
exports.getApplications = getApplications;
exports.saveData = saveData;
exports.getData = getData;

const path = require('path');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const async = require('async');
const axios = require('axios');

const Application = require('./application.model');
const Data = require('./data.model');
const logger = require(path.join(process.cwd(), 'src/config/server/lib/winston'));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));
const { Response, CustomError } = require(path.join(process.cwd(), 'src/modules/core/server/response'));

const convertToSlug = string => string.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');

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
    const maximumFailedAttempts = 5;

    try {
        let application;
        const { grant_type, username, password, refresh_token } = req.body;

        if(grant_type === 'password') {
            application = await Application.findOne({ where: { email: username } });

            if (application && !application.is_active) {
                response.errors.push(new CustomError('Request denied.', 400));
                return res.status(400).send(response);
            }

            if (!application || !application.validPassword(password)) {
                console.log(application)
                if (application) {
                    await application.update({
                        failed_auth_attempt: application.failed_auth_attempt + 1,
                        is_active: application.failed_auth_attempt + 1 >= maximumFailedAttempts
                            ? false
                            : application.is_active
                    });
                }

                response.errors.push(new CustomError('Invalid username or password.', 401));
            } else {
                const new_refresh_token = generateRefreshToken(application);
                await application.update({ refresh_token: new_refresh_token });

                response.data.refresh_token = new_refresh_token;
            }
        }

        if(grant_type === 'refresh_token') {
            try {
                const decoded = jwt.verify(refresh_token, nodecache.getValue('APPLICATION_REFRESH_SECRET'));
                application = await Application.findOne({ where: { id: decoded.id } });

                if (application && !application.is_active) {
                    response.errors.push(new CustomError('Request denied.', 400));
                    return res.status(400).send(response);
                }

                if(application.refresh_token !== refresh_token) {
                    await application.update({
                        failed_auth_attempt: application.failed_auth_attempt + 1,
                        is_active: application.failed_auth_attempt + 1 >= maximumFailedAttempts
                            ? false
                            : application.is_active
                    });

                    response.errors.push(new CustomError('The refresh_token is invalid.', 4401));
                }
            } catch(err) {
                logger.error(err);
                response.errors.push(new CustomError('The refresh_token is expired.', 4401));
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
        logger.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

async function getApplications(req, res) {
    try {
        const applications = await Application.findAll({
            attributes: ['id', 'name', 'type', 'email', 'is_active', 'slug', 'description', 'created_at']
        });

        res.json(applications);

    } catch (err) {
        logger.error(err);
        res.status(500).send('Internal server error');
    }
}

async function getApplication(req, res) {
    try {
        const application = await Application.findOne({
            where: { id: req.params.id },
            attributes: ['id', 'name', 'type', 'email', 'is_active', 'slug', 'description', 'metadata']
        });

        res.json(application);
    } catch (err) {
        logger.error(err);
        res.status(500).send('Internal server error');
    }
}

async function createApplication(req, res) {
    try {
        const {
            name,
            type,
            email,
            is_active,
            description,
            password,
            confirm_password,
            metadata
        } = req.body;

        if (!email) return res.status(400).send('Must provide email.');

        if (!password || !confirm_password) return res.status(400).send('Must provide password and confirm password.');

        if (password !== confirm_password) return res.status(400).send('Password and confirm password do not match.');

        const hasApplicationWithSameName = await Application.findOne({
            where: { name: { [Op.iLike]: name } }
        });

        if (hasApplicationWithSameName) return res.status(400).send('Application with the same name already exists.');

        const hasApplicationWithSameEmail = application = await Application.findOne({
            where: { email: { [Op.iLike]: email } }
        });

        if (hasApplicationWithSameEmail) return res.status(400).send('Application with the same email already exists.');

        await Application.create({
            name,
            slug: convertToSlug(name),
            type: type || null,
            email: email.toLowerCase(),
            is_active,
            description: (description || '').trim(),
            password,
            metadata
        });

        res.json(application);
    } catch (err) {
        logger.error(err);
        res.status(500).send('Internal server error');
    }
}

async function updateApplication(req, res) {
    try {
        const {
            name,
            type,
            email,
            is_active,
            description,
            metadata
        } = req.body;
        const application_id = req.params.id;

        const application = await Application.findOne({
            where: { id: application_id }
        });

        if (!application) return res.status(400).send('Application not found.');

        const hasSameName = await Application.findOne({
            where: {
                id: { [Op.ne]: application_id },
                name: { [Op.iLike]: name }
            }
        })

        if (hasSameName) return res.status(400).send('Application with the same name already exists.');

        const hasSameEmail = await Application.findOne({
            where: {
                id: { [Op.ne]: application_id },
                email: { [Op.iLike]: email }
            }
        });

        if (hasSameEmail) return res.status(400).send('Application with the same email already exists.');

        await application.update({
            name,
            slug: convertToSlug(name),
            type: type || null,
            email: email && email.toLowerCase(),
            is_active,
            description: description && description.trim(),
            metadata
        });

        res.json(application);
    } catch (err) {
        logger.error(err);
        res.status(500).send('Internal server error');
    }
}

async function saveData(req, res) {
    const response = new Response({}, []);

    try {
        const {type, data} = req.body;

        const info = await Data.create({
            application_id: req.user.id,
            type,
            data: JSON.parse(data),
            created_by: req.user.id,
            updated_by: req.user.id
        });

        response.data = {
            id: info.id,
            type: info.type,
            data: JSON.stringify(info.data),
            created_at: info.created_at,
            updated_at: info.updated_at
        };

        res.json(response);
    } catch(err) {
        logger.error(err);
        res.status(500).send('Internal server error');
    }
}

async function getData(req, res) {
    const response = new Response({}, []);

    try {
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
        response.data.data = JSON.stringify(doc.data);

        res.json(response);
    } catch(err) {
        logger.error(err);
        res.status(500).send('Internal server error');
    }
}

async function clearApplicationCache() {
    try {
        const applications = await Application.findAll();
        const maximumConcurrentCalls = 15;
        const tasks = [];

        const generatePostCaller = (url, requestBody) => async.reflect(async () => axios.post(url, requestBody));

        applications.forEach(app => {
            const url = (app.metadata || {}).cache_clearing_url;

            if(!url) return;

            const token = jwt.sign({
                id: app.id
            }, app.auth_secret, {
                expiresIn: '1h'
            });

            const requestBody = { jwt_token: token };

            tasks.push(generatePostCaller(url, requestBody));
        });

        async.parallelLimit(tasks, maximumConcurrentCalls, (error, result) => {
            if (error) logger.error(error);
            result.forEach(r => r.error && logger.error(r.error));
        });
    } catch(err) {
        logger.error(err);
    }
}

exports.getToken = getToken;
exports.getApplications = getApplications;
exports.saveData = saveData;
exports.getData = getData;
exports.clearApplicationCache = clearApplicationCache;
exports.createApplication = createApplication;
exports.getApplication = getApplication;
exports.updateApplication = updateApplication;

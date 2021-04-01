const path = require('path');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const async = require('async');
const axios = require('axios');

const Application = require('./application.model');
const User = require(path.join(process.cwd(), 'src/modules/platform/user/server/user.model'));
const Data = require('./data.model');
const logger = require(path.join(process.cwd(), 'src/config/server/lib/winston'));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));
const { Response, CustomError } = require(path.join(process.cwd(), 'src/modules/core/server/response'));
const File = require(path.join(process.cwd(), 'src/modules/core/server/storage/file.model'));
const Audit = require(path.join(process.cwd(), 'src/modules/core/server/audit/audit.model'));
const storageService = require(path.join(process.cwd(), 'src/modules/core/server/storage/storage.service'));
const ExportService = require(path.join(process.cwd(), 'src/modules/core/server/export/export.service'));

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

        await application.update({failed_auth_attempt: 0});

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
        const orderBy = req.query.orderBy
            ? req.query.orderBy
            : null;

        const orderType = req.query.orderType === 'ASC' || req.query.orderType === 'DESC'
            ? req.query.orderType
            : 'ASC';

        const order = [
            ['created_at', 'DESC'],
            ['id', 'DESC']
        ];

        const sortableColumns = Object.keys(Application.rawAttributes);

        if (orderBy && sortableColumns.includes(orderBy)) {
            order.splice(0, 0, [orderBy, orderType]);
        }

        if (orderBy === 'created_by') {
            order.splice(0, 0, [{ model: User, as: 'createdByUser' }, 'first_name', orderType]);
            order.splice(1, 0, [{ model: User, as: 'createdByUser' }, 'last_name', orderType]);
        }

        const applications = await Application.findAll({
            include: [
                { model: User, as: 'createdByUser', attributes: ['id', 'first_name', 'last_name'] }
            ],
            attributes: ['id', 'name', 'type', 'email', 'is_active', 'slug', 'description', 'created_at'],
            order
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
            include: [
                { model: User, as: 'createdByUser', attributes: ['id', 'first_name', 'last_name'] },
                { model: User, as: 'updatedByUser', attributes: ['id', 'first_name', 'last_name'] }
            ],
            attributes: ['id', 'name', 'type', 'email', 'is_active', 'slug', 'description', 'metadata', 'logo_url']
        });

        const logo_url = `${nodecache.getValue('S3_BUCKET_URL')}/application/${application.id}/${application.logo_url}`;

        res.json({ ...application.dataValues, logo_url });
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

        const logo = req.files[0];

        if (!email) return res.status(400).send('Must provide email.');

        if (!password || !confirm_password) return res.status(400).send('Must provide password and confirm password.');

        if (password !== confirm_password) return res.status(400).send('Password and confirm password do not match.');

        const hasApplicationWithSameName = await Application.findOne({
            where: { name: { [Op.iLike]: name } }
        });

        if (hasApplicationWithSameName) return res.status(400).send('Application with the same name already exists.');

        const hasApplicationWithSameEmail = await Application.findOne({
            where: { email: { [Op.iLike]: email } }
        });

        if (hasApplicationWithSameEmail) return res.status(400).send('Application with the same email already exists.');

        const application = await Application.create({
            name,
            slug: convertToSlug(name),
            type: type || null,
            email: email.toLowerCase(),
            is_active,
            description: (description || '').trim(),
            password,
            metadata: JSON.parse(metadata),
            created_by: req.user.id,
            updated_by: req.user.id
        });

        const bucketURL = nodecache.getValue('S3_BUCKET_URL');
        const bucketName = bucketURL.split('.')[0].split('//')[1];

        const uploadOptions = {
            bucket: bucketName,
            folder: `application/${application.id}/`,
            fileName: `logo${path.extname(logo.originalname)}`,
            fileContent: logo.buffer
        };

        const storageServiceResponse = await storageService.upload(uploadOptions);

        await File.create({
            name: `logo${path.extname(logo.originalname)}`,
            bucket_name: bucketName,
            key: storageServiceResponse.key,
            owner_id: application.id,
            table_name: 'applications'
        });

        await application.update({ logo_url: `logo${path.extname(logo.originalname)}` });

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

        const logo = req.files[0];

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
            metadata: JSON.parse(metadata),
            updated_by: req.user.id
        });

        if (logo) {
            const bucketURL = nodecache.getValue('S3_BUCKET_URL');
            const bucketName = bucketURL.split('.')[0].split('//')[1];
            const previousKey = `application/${application.id}/${application.logo_url}`;

            const deleteParam = {
                Bucket: bucketName,
                Delete: {
                    Objects: [{ Key: previousKey }]
                }
            };

            await storageService.deleteFiles(deleteParam);

            const uploadOptions = {
                bucket: bucketName,
                folder: `application/${application.id}/`,
                fileName: `logo${path.extname(logo.originalname)}`,
                fileContent: logo.buffer
            };

            const storageServiceResponse = await storageService.upload(uploadOptions);

            // Update file name extension and key
            const key = `application/${application.id}/${logo.logo_url}`;
            const logoFile = await File.findOne({ where: { key }});

            if (logoFile) {
                await logoFile.update({
                    name: `logo${path.extname(logo.originalname)}`,
                    key: storageServiceResponse.key
                });
            }

            await application.update({ logo_url: `logo${path.extname(logo.originalname)}` });
        }

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

async function getApplicationLog(req, res) {
    try {
        const applicationID = req.params.id;
        const event_type = req.query.event_type || null;
        const page = req.query.page ? +req.query.page : 1;
        const limit = 1;
        const offset = page ? (+page - 1) * limit : 0;

        const application = await Application.findOne({ where: { id: applicationID } });

        if (!application) return res.status(400).send('Application not found.');

        const { count , rows: applicationLog } = await Audit.findAndCountAll({
            where: {
                actor: applicationID,
                ...(event_type ? { event_type } : null)
            },
            limit,
            offset,
            logging: console.log
        });

        res.json({ data: applicationLog, metadata: { count }});
    } catch(err) {
        logger.error(err);
        res.status(500).send('Internal server error');
    }
}

async function exportApplicationLog(req, res) {
    try {
        const applicationID = req.params.id;
        const event_type = req.query.event_type || null;

        const application = await Application.findOne({ where: { id: applicationID } });

        if (!application) return res.status(400).send('Application not found.');

        const applicationLog = await Audit.findAll({
            where: {
                actor: applicationID,
                ...(event_type ? { event_type } : null)
            }
        });

        const sheetName = 'application-log';
        const fileBuffer = ExportService.exportToExcel(applicationLog.map(app_log => app_log.dataValues), sheetName);

        res.writeHead(200, {
            'Content-Disposition': `attachment;filename=${sheetName.replace(' ', '_')}.xlsx`,
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });

        res.end(fileBuffer);
    } catch(err) {
        logger.error(err);
        res.status(500).send('Internal server error');
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
exports.getApplicationLog = getApplicationLog;
exports.exportApplicationLog = exportApplicationLog;

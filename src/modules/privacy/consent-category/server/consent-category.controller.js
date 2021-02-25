const path = require('path');
const _ = require('lodash');
const { Op } = require('sequelize');

const ConsentCategory = require('./consent-category.model');
const User = require(path.join(process.cwd(), 'src/modules/platform/user/server/user.model.js'));
const logService = require(path.join(process.cwd(), 'src/modules/core/server/audit/audit.service'));
const { clearApplicationCache } = require(path.join(process.cwd(), 'src/modules/platform/application/server/application.controller'));
const logger = require(path.join(process.cwd(), 'src/config/server/lib/winston'));

const convertToSlug = string => string.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');

async function getConsentCategory(req, res) {
    try {
        const data = await ConsentCategory.findOne({ where: { id: req.params.id } });
        res.json(data);
    } catch (err) {
        logger.error(err);
        res.status(500).send('Internal server error');
    }
}

async function getConsentCategories(req, res) {
    try {
        const categories = await ConsentCategory.findAll({
            include: [{
                model: User,
                as: 'createdByUser',
                attributes: ['first_name', 'last_name'],
            }],
            order: [['title', 'ASC']]
        });

        const data = categories.map(c => {
            const createdBy = `${c.createdByUser ? c.createdByUser.first_name : ''} ${c.createdByUser ? c.createdByUser.last_name : ''}`
            delete c.dataValues.createdByUser;
            delete c.dataValues.created_by;
            delete c.dataValues.updated_by;
            return {
                ...c.dataValues,
                createdBy
            };
        });

        res.json(data);
    } catch (err) {
        logger.error(err);
        res.status(500).send('Internal server error');
    }
}

async function createConsentCategory(req, res) {
    try {
        const [data, created] = await ConsentCategory.findOrCreate({
            where: {
                title: {
                    [Op.iLike]: req.body.title.trim()
                }
            },
            defaults: {
                title: req.body.title.trim(),
                slug: convertToSlug(req.body.title.trim()),
                created_by: req.user.id,
                updated_by: req.user.id
            }
        });

        if (!created && data) return res.status(400).send('The consent category already exists.');

        data.dataValues.createdBy = `${req.user.first_name} ${req.user.last_name}`;

        await logService.log({
            event_type: 'CREATE',
            object_id: data.id,
            table_name: 'consent_categories',
            actor: req.user.id,
            changes: data.dataValues
        });

        clearApplicationCache();
        res.json(data);
    } catch (err) {
        logger.error(err);
        res.status(500).send('Internal server error');
    }
}

async function updateConsentCategory(req, res) {
    try {
        const { title } = req.body;

        const consentCategory = await ConsentCategory.findOne({ where: { id: req.params.id } });
        if (!consentCategory) return res.status(404).send('The consent category does not exist');

        const isTitleExists = await ConsentCategory.findOne({
            where: {
                id: { [Op.not]: req.params.id },
                title: {
                    [Op.iLike]: title.trim()
                }
            }
        });

        if (isTitleExists) return res.status(400).send('The consent category already exists.');

        const consentCategoryBeforeUpdate = {...consentCategory.dataValues};

        const data = await consentCategory.update({ title: title.trim(), updated_by: req.user.id });

        const updatesInCategory = logService.difference(data.dataValues, consentCategoryBeforeUpdate);

        if (updatesInCategory) {
            await logService.log({
                event_type: 'UPDATE',
                object_id: consentCategory.id,
                table_name: 'consent_categories',
                actor: req.user.id,
                changes: updatesInCategory
            });
        }

        clearApplicationCache();

        res.json(data);
    } catch (err) {
        logger.error(err);
        res.status(500).send('Internal server error');
    }
}

exports.getConsentCategory = getConsentCategory;
exports.getConsentCategories = getConsentCategories;
exports.createConsentCategory = createConsentCategory;
exports.updateConsentCategory = updateConsentCategory;

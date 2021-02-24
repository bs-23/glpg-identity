const path = require('path');
const { Op } = require('sequelize');
const Sequelize = require('sequelize');
const Faq = require('./faq.model');
const logger = require(path.join(process.cwd(), 'src/config/server/lib/winston'));
const auditService = require(path.join(process.cwd(), 'src/modules/core/server/audit/audit.service'));
const User = require(path.join(process.cwd(), 'src/modules/platform/user/server/user.model'));
const faqCategories = require('./faq.json');

async function getFaqItem(req, res) {
    try {
        const response = await Faq.findOne({
            where: { id: req.params.id }
        });

        res.json(response);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

function sort_category(items, orderType, limit, offset) {

    let rows = items.rows.map(c => {
        const categoryTitleList = [];
        c.topics.forEach(element => {
            categoryTitleList.push(faqCategories.topics.find(x => x.slug === element).title);
        });

        const topic = categoryTitleList[0];
        const createdBy = `${c.createdByUser.first_name} ${c.createdByUser.last_name}`;
        const updatedBy = `${c.updatedByUser.first_name} ${c.updatedByUser.last_name}`;
        delete c.dataValues.createdByUser;
        delete c.dataValues.updatedByUser;
        return { ...c.dataValues, topic, createdBy, updatedBy }
    });

    rows.sort((a, b) => (a.topic > b.topic) ?
        (orderType === 'asc' ? -1 : 1) : ((b.topic > a.topic) ? (orderType === 'asc' ? 1 : -1) : 0));

    rows = rows.slice(offset, offset + limit);

    const data = { ...items, rows: rows };
    return data;
}

async function getFaqItems(req, res) {
    try {
        const page = req.query.page ? req.query.page - 1 : 0;
        if (page < 0) return res.status(404).send("page must be greater or equal 1");

        const limit = req.query.limit ? req.query.limit : 2;
        const offset = page * limit;

        const orderBy = req.query.orderBy === 'null'
            ? null
            : req.query.orderBy;

        const orderType = req.query.orderType === 'asc' || req.query.orderType === 'desc'
            ? req.query.orderType
            : 'asc';

        let order = [
            ['updated_at', 'DESC'],
            ['id', 'DESC']
        ];

        const sortableColumns = ['question', 'answer', 'topics', 'updated_at'];

        if (orderBy && sortableColumns.includes(orderBy)) {
            order.splice(0, 0, [orderBy, orderType]);
        }

        if (orderBy === 'created_by') {
            order = [[Sequelize.literal('"createdByUser.first_name"'), orderType]];
        }

        let where = {};

        if (req.query.topic) {
            where = {
                topics: {
                    [Op.overlap]: [req.query.topic]
                }
            }
        }

        const inclusions = [
            {
                model: User,
                as: 'createdByUser',
                attributes: ['first_name', 'last_name']
            },
            {
                model: User,
                as: 'updatedByUser',
                attributes: ['first_name', 'last_name']
            }
        ];

        const response = await Faq.findAndCountAll({
            include: inclusions,
            where: where,
            offset: orderBy === 'topics' || req.query.page === 'null' ? null : offset,
            limit: orderBy === 'topics' || req.query.page === 'null' ? null : limit,
            order: orderBy === 'topics' ? [] : order
        });

        let data = [];
        if (orderBy === 'topics') {
            data = sort_category(response, orderType, limit, offset).rows;
        } else {
            data = response.rows.map(c => {
                const createdBy = `${c.createdByUser.first_name} ${c.createdByUser.last_name}`;
                const updatedBy = `${c.updatedByUser.first_name} ${c.updatedByUser.last_name}`;
                delete c.dataValues.createdByUser;
                delete c.dataValues.updatedByUser;
                return {
                    ...c.dataValues,
                    createdBy,
                    updatedBy
                }
            });
        }

        const responseData = {
            faq: data,
            metadata: {
                page: page + 1,
                limit,
                total_items: response.count,
                start: limit * page + 1,
                end: offset + limit > response.count ? parseInt(response.count) : parseInt(offset + limit),
                total_pages: Math.ceil(response.count / limit)
            }
        };

        res.json(responseData);
    } catch (err) {
        logger.error(err);
        res.status(500).send('Internal server error');
    }
}

async function getFaqCategories(req, res) {
    try {
        res.json(faqCategories.topics);
    } catch (err) {
        logger.error(err);
        res.status(500).send('Internal server error');
    }
}

async function createFaqItem(req, res) {
    try {
        const { question, answer, topics } = req.body;

        const faq = await Faq.findOne({ where: { question: { [Op.iLike]: question.trim() } } });

        if (faq) return res.status(404).send("This question already exists");

        const response = await Faq.create({
            question: question.trim(),
            answer,
            topics,
            created_by: req.user.id,
            updated_by: req.user.id
        });

        const user = await User.findOne({ where: { id: req.user.id } });

        response.dataValues.createdBy = `${user.dataValues.first_name} ${user.dataValues.last_name}`;
        response.dataValues.updatedBy = `${user.dataValues.first_name} ${user.dataValues.last_name}`;

        await auditService.log({
            event_type: 'CREATE',
            object_id: response.id,
            table_name: 'faq',
            actor: req.user.id,
            remarks: `"${response.question}" FAQ created`
        });

        res.json(response);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function updateFaqItem(req, res) {
    try {

        const { question, answer, topics } = req.body;

        const inclusions = [
            {
                model: User,
                as: 'createdByUser',
                attributes: ['first_name', 'last_name'],

            },
            {
                model: User,
                as: 'updatedByUser',
                attributes: ['first_name', 'last_name']
            }
        ];

        const faq = await Faq.findOne({ include: inclusions, where: { id: req.params.id } });

        if (!faq) return res.status(404).send("FAQ is not found or may be removed");

        const faqSameQuestion = await Faq.findOne({
            where: {
                question: { [Op.iLike]: question }
            }
        });

        if (faqSameQuestion && faqSameQuestion.dataValues.id !== faq.dataValues.id) return res.status(404).send("This question already exists in other FAQ");


        faq.dataValues.createdBy = `${faq.dataValues.createdByUser.dataValues.first_name} ${faq.dataValues.createdByUser.dataValues.last_name}`;
        faq.dataValues.updatedBy = `${faq.dataValues.updatedByUser.dataValues.first_name} ${faq.dataValues.updatedByUser.dataValues.last_name}`;

        delete faq.dataValues.createdByUser;
        delete faq.dataValues.updatedByUser;

        await faq.update({ question, answer, topics });

        await auditService.log({
            event_type: 'UPDATE',
            object_id: faq.id,
            table_name: 'faq',
            actor: req.user.id,
            remarks: `"${faq.question}" FAQ updated`
        });

        res.json(faq);

    } catch (err) {
        logger.error(err);
        res.status(500).send('Internal server error');
    }
}

async function deleteFaqItem(req, res) {
    try {
        const id = req.params.id;

        if (!id) {
            return res.status(400).send('Invalid request.');
        }

        let faq = await Faq.findOne({ where: { id: req.params.id } });

        if (!faq) return res.status(404).send("FAQ is not found or may be removed");

        await Faq.destroy({ where: { id } });

        await auditService.log({
            event_type: 'DELETE',
            object_id: faq.id,
            table_name: 'faq',
            actor: req.user.id,
            remarks: `"${faq.question}" FAQ deleted`
        });


        res.sendStatus(200);

    } catch (err) {
        logger.error(err);
        res.status(500).send('Internal server error');
    }
}

exports.getFaqItem = getFaqItem;
exports.getFaqItems = getFaqItems;
exports.getFaqCategories = getFaqCategories;
exports.createFaqItem = createFaqItem;
exports.updateFaqItem = updateFaqItem;
exports.deleteFaqItem = deleteFaqItem;

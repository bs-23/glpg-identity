const Faq = require('./faq.model');
const path = require('path');
const { Op } = require('sequelize');
const logService = require(path.join(process.cwd(), 'src/modules/core/server/audit/audit.service'));

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

async function getFaqItems(req, res) {
    try {
        const page = req.query.page ? req.query.page - 1 : 0;
        if (page < 0) return res.status(404).send("page must be greater or equal 1");

        const limit = req.query.limit ? req.query.limit : 30;
        const offset = page * limit;

        const category = req.query.category === 'null' || req.query.category === undefined ? null : req.query.category;

        const orderBy = req.query.orderBy === 'null'
            ? null
            : req.query.orderBy;
        const orderType = req.query.orderType === 'asc' || req.query.orderType === 'desc'
            ? req.query.orderType
            : 'asc';

        const order = [
            ['created_at', 'DESC'],
            ['id', 'DESC']
        ];

        const sortableColumns = ['question', 'answer', 'categories'];

        if (orderBy && sortableColumns.includes(orderBy)) {
            order.splice(0, 0, [orderBy, orderType]);
        }

        const filter = {
            categories: {
                [Op.overlap]: [category]
            }
        };

        const response = await Faq.findAndCountAll({
            where: category ? filter : {},
            offset,
            limit,
            order: order
        });

        const responseData = {
            faq: response.rows,
            metadata: {
                page: page + 1,
                limit,
                total: response.count,
                start: limit * page + 1,
                end: offset + limit > response.count ? parseInt(response.count) : parseInt(offset + limit),
                category: category,
            }
        }

        res.json(responseData);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function createFaqItem(req, res) {
    try {
        const { question, answer, categories } = req.body;

        const response = await Faq.create({
            question,
            answer,
            categories,
            created_by: req.user.id,
            updated_by: req.user.id
        });

        await logService.log({
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
        const { question, answer, categories } = req.body;

        let faq = await Faq.findOne({ where: { id: req.params.id } });

        if (!faq) return res.status(404).send("FAQ is not found or may be removed");

        await faq.update({ question, answer, categories });

        await logService.log({
            event_type: 'UPDATE',
            object_id: faq.id,
            table_name: 'faq',
            actor: req.user.id,
            remarks: `"${faq.question}" FAQ updated`
        });

        res.json(faq);

    } catch (err) {
        console.error(err);
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

        await logService.log({
            event_type: 'DELETE',
            object_id: faq.id,
            table_name: 'faq',
            actor: req.user.id,
            remarks: `"${faq.question}" FAQ deleted`
        });


        res.sendStatus(200);

    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}


exports.getFaqItem = getFaqItem;
exports.getFaqItems = getFaqItems;
exports.createFaqItem = createFaqItem;
exports.updateFaqItem = updateFaqItem;
exports.deleteFaqItem = deleteFaqItem;

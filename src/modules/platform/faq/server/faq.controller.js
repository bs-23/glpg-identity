const Faq = require('./faq.model');
const path = require('path');
const { Op } = require('sequelize');
const logService = require(path.join(process.cwd(), 'src/modules/core/server/audit/audit.service'));
const User = require(path.join(process.cwd(), 'src/modules/platform/user/server/user.model.js'));
const Sequelize = require('sequelize');
const { IgnorePlugin } = require('webpack');

const faqCategories = [
    { id: "0", title: "General", slug: "general" },
    { id: "1", title: "Information Management", slug: "information" },
    { id: "2", title: "Management of Customer Data Platform", slug: "cdp" },
    { id: "3", title: "Data Privacy & Consent Management", slug: "privacy" }
];

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
        c.categories.forEach(element => {
            categoryTitleList.push(faqCategories.find(x => x.slug === element).title);
        });

        const category = categoryTitleList[0];
        const createdBy = `${c.createdByUser.first_name} ${c.createdByUser.last_name}`;
        const updatedBy = `${c.updatedByUser.first_name} ${c.updatedByUser.last_name}`;
        delete c.dataValues.createdByUser;
        delete c.dataValues.updatedByUser;
        return { ...c.dataValues, category, createdBy, updatedBy }
    });

    rows.sort((a, b) => (a.category > b.category) ?
        (orderType === 'asc' ? -1 : 1) : ((b.category > a.category) ? (orderType === 'asc' ? 1 : -1) : 0));

    rows = rows.slice(offset, offset + limit);

    const data = { ...items, rows: rows };
    return data;
};


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
        let orderType = req.query.orderType === 'asc' || req.query.orderType === 'desc'
            ? req.query.orderType
            : 'asc';

        let order = [
            ['created_at', 'DESC'],
            ['id', 'DESC']
        ];

        const sortableColumns = ['question', 'answer', 'categories', 'updated_at'];

        if (orderBy === 'categories') orderType === 'asc' ? orderType = 'desc' : orderType = 'asc';

        if (orderBy && sortableColumns.includes(orderBy)) {
            order.splice(0, 0, [orderBy, orderType]);
        }

        if (orderBy === 'created_by') {
            order = [[Sequelize.literal('"createdByUser.first_name"'), orderType]];
        }

        const filter = {
            categories: {
                [Op.overlap]: [category]
            }
        };

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


        const response = await Faq.findAndCountAll({
            include: inclusions,
            where: category ? filter : {},
            offset: orderBy === 'categories' ? null : offset,
            limit: orderBy === 'categories' ? null : limit,
            order: orderBy === 'categories' ? [] : order,

        });


        let data = [];
        if (orderBy === 'categories') {
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

        const faq = await Faq.findOne({ where: { question: { [Op.iLike]: question } } });

        if (faq) return res.status(404).send("This question already exists");
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



        const response = await Faq.create({
            question,
            answer,
            categories,
            created_by: req.user.id,
            updated_by: req.user.id
        });

        const user = await User.findOne({ where: { id: req.user.id } });

        response.dataValues.createdBy = `${user.dataValues.first_name} ${user.dataValues.last_name}`;
        response.dataValues.updatedBy = `${user.dataValues.first_name} ${user.dataValues.last_name}`;

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

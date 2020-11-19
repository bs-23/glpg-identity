const Faq = require('./faq.model');

async function getFaqItem(req, res) {
    try {
        const response = await Faq.findOne({
            where: { id: req.params.id }
        });

        res.json(response);
    } catch(err){
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function getFaqItems(req, res) {
    try {
        const response = await Faq.findAll({});

        res.json(response);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function createFaqItem(req, res) {
    try {
        const { question, answer, service_categories } = req.body;

        const response = await Faq.create({
            question,
            answer,
            service_categories,
            created_by: req.user.id,
            updated_by: req.user.id
        });

        res.json(response);
    } catch(err){
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function updateFaqItem(req, res) {}

async function deleteFaqItem(req, res) {}

exports.getFaqItem = getFaqItem;
exports.getFaqItems = getFaqItems;
exports.createFaqItem = createFaqItem;
exports.updateFaqItem = updateFaqItem;
exports.deleteFaqItem = deleteFaqItem;

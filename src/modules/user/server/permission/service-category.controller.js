const ServiceCategory = require('./service-category.model');

async function getServiceCategories(req, res) {
    try {
        const serviceCategories = await ServiceCategory.findAll();

        res.json(serviceCategories);
    } catch(err) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
}

exports.getServiceCategories = getServiceCategories;

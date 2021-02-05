const Service = require('./service.model');

async function getServiceCategories(req, res) {
    try {
        const serviceCategories = await Service.findAll({
            include: {
                model: Service,
                as: 'childServices',
                required: true
            }
        });

        res.json(serviceCategories);
    } catch(err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

exports.getServiceCategories = getServiceCategories;

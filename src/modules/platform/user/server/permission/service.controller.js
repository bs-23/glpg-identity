const Service = require('./service.model');

async function getServices(req, res) {
    try {
        const services = await Service.findAll({
            include: {
                model: Service,
                as: 'childServices',
                required: true
            }
        });

        res.json(services);
    } catch(err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

exports.getServices = getServices;

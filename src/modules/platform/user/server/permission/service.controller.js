const Service = require('./service.model');
const path = require('path');
const logger = require(path.join(process.cwd(), 'src/config/server/lib/winston'));

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
        logger.error(err);
        res.status(500).send('Internal server error');
    }
}

exports.getServices = getServices;

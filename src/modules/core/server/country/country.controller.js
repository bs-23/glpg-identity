const path = require('path');
const { QueryTypes, Op, col } = require('sequelize');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const Country = require(path.join(process.cwd(), 'src/modules/core/server/country/country.model'));
const logger = require(path.join(process.cwd(), 'src/config/server/lib/winston'));


async function getCountries(req, res) {
    try {
        const countries = await Country.findAll({
            where: {
                codbase_desc: {
                    [Op.eq]: col('countryname')
                }
            },
            order: [
                ['codbase_desc', 'ASC'],
                ['countryname', 'ASC']
            ]
        });

        res.json(countries);
    } catch (err) {
        logger.error(err);
        res.status(500).send('Internal server error');
    }
}

async function getAllCountries(req, res) {
    try {
        const countries = await Country.findAll({
            order: [
                ['codbase_desc', 'ASC'],
                ['countryname', 'ASC']
            ]
        });

        res.json(countries);
    } catch (err) {
        logger.error(err);
        res.status(500).send('Internal server error');
    }
}

exports.getCountries = getCountries;
exports.getAllCountries = getAllCountries;

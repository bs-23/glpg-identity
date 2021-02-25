const path = require('path');
const { QueryTypes } = require('sequelize');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const logger = require(path.join(process.cwd(), 'src/config/server/lib/winston'));

async function getCountries(req, res) {
    try {
        // const countries = await sequelize.datasyncConnector.query("SELECT DISTINCT ON(codbase_desc) * FROM ciam.vwcountry ORDER BY codbase_desc, countryname;", { type: QueryTypes.SELECT });

        const countries = await sequelize.datasyncConnector.query("SELECT * FROM ciam.vwcountry WHERE codbase_desc=countryname ORDER BY codbase_desc, countryname;", { type: QueryTypes.SELECT });

        res.json(countries);
    } catch (err) {
        logger.error(err);
        res.status(500).send('Internal server error');
    }
}

async function getAllCountries(req, res) {
    try {
        const countries = await sequelize.datasyncConnector.query("SELECT * FROM ciam.vwcountry ORDER BY codbase_desc;", { type: QueryTypes.SELECT });
        res.json(countries);
    } catch (err) {
        logger.error(err);
        res.status(500).send('Internal server error');
    }
}

exports.getCountries = getCountries;
exports.getAllCountries = getAllCountries;

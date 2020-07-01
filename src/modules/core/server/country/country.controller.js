const path = require('path');
const { QueryTypes } = require('sequelize');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));

async function getCountries(req, res) {
    try {
        const countries = await sequelize.datasyncConnector.query("SELECT * FROM ciam.vwcountry", { type: QueryTypes.SELECT });
        res.json(countries);
    } catch (err) {
        res.status(500).send(err);
    }
}

exports.getCountries = getCountries;

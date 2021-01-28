const path = require('path');
const { QueryTypes } = require('sequelize');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));

async function getCountries(req, res) {
    try {
        // const countries = await sequelize.datasyncConnector.query("SELECT DISTINCT ON(codbase_desc) * FROM ciam.vwcountry ORDER BY codbase_desc, countryname;", { type: QueryTypes.SELECT });

        const countries = await sequelize.datasyncConnector.query("SELECT * FROM ciam.vwcountry WHERE codbase_desc=countryname ORDER BY codbase_desc, countryname;", { type: QueryTypes.SELECT });

        res.json(countries);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function getAllCountries(req, res) {
    try {
        // const countries = await sequelize.datasyncConnector.query("SELECT * FROM ciam.vwcountry ORDER BY codbase_desc;", { type: QueryTypes.SELECT });
        const countries = [{ "countryid": 8, "country_iso2": "LU", "country_iso3": "LUX", "codbase": "WBE", "countryname": "Luxembourg", "codbase_desc": "Belgium", "codbase_desc_okws": "OneKey Belgium" }, { "countryid": 1, "country_iso2": "BE", "country_iso3": "BEL", "codbase": "WBE", "countryname": "Belgium", "codbase_desc": "Belgium", "codbase_desc_okws": "OneKey Belgium" }, { "countryid": 9, "country_iso2": "MC", "country_iso3": "MCO", "codbase": "WFR", "countryname": "Monaco", "codbase_desc": "France", "codbase_desc_okws": "OneKey France" }, { "countryid": 11, "country_iso2": "AD", "country_iso3": "AND", "codbase": "WFR", "countryname": "Andorra", "codbase_desc": "France", "codbase_desc_okws": "OneKey France" }, { "countryid": 4, "country_iso2": "FR", "country_iso3": "FRA", "codbase": "WFR", "countryname": "France", "codbase_desc": "France", "codbase_desc_okws": "OneKey France" }, { "countryid": 2, "country_iso2": "DE", "country_iso3": "DEU", "codbase": "WDE", "countryname": "Germany", "codbase_desc": "Germany", "codbase_desc_okws": "OneKey Germany" }, { "countryid": 7, "country_iso2": "IT", "country_iso3": "ITA", "codbase": "WIT", "countryname": "Italy", "codbase_desc": "Italy", "codbase_desc_okws": "OneKey Italia" }, { "countryid": 10, "country_iso2": "NL", "country_iso3": "NLD", "codbase": "WNL", "countryname": "Netherlands", "codbase_desc": "Netherlands", "codbase_desc_okws": "OneKey Netherlands" }, { "countryid": 3, "country_iso2": "ES", "country_iso3": "ESP", "codbase": "WES", "countryname": "Spain", "codbase_desc": "Spain", "codbase_desc_okws": "OneKey Spania" }, { "countryid": 5, "country_iso2": "GB", "country_iso3": "GBR", "codbase": "WUK", "countryname": "United Kingdom", "codbase_desc": "United Kingdom", "codbase_desc_okws": "OneKey United Kingdom" }, { "countryid": 6, "country_iso2": "IE", "country_iso3": "IRL", "codbase": "WUK", "countryname": "Ireland", "codbase_desc": "United Kingdom", "codbase_desc_okws": "OneKey United Kingdom" }];
        res.json(countries);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

exports.getCountries = getCountries;
exports.getAllCountries = getAllCountries;

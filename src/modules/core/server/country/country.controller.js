const Country = require('./country.model');

async function getCountries(req, res) {
    try {
        const countries = await Country.findAll();
        res.json(countries);
    } catch (error) {
        console.log(error);
    }
}

exports.getCountries = getCountries;

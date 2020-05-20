const path = require('path');
const jwt = require('jsonwebtoken');
const Country = require('./country.model');


async function getCountryList(req, res) {
    try {
        const country = await Country.findAll();
        return res.json(country);
    } catch (error) {
        console.log(error);
    }
}


exports.getCountryList = getCountryList;
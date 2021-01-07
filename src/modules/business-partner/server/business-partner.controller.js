const path = require('path');
const PartnerRequest = require('./partner-request.model');
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));
const { Response, CustomError } = require(path.join(process.cwd(), 'src/modules/core/server/response'));


async function getPartnerRequests(req, res) {
    try {
        const PartnerRequests = await PartnerRequest.findAll();
        res.json(PartnerRequests);

    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function createPartnerRequest(req, res) {
    try {
        const { first_name, last_name, email, procurement_contact, company_codes } = req.body;

        const [user, created] = await PartnerRequest.findOrCreate({
            where: { email: email.toLowerCase() },
            defaults: {
                first_name,
                last_name,
                email,
                procurement_contact,
                company_codes
            }
        });

        if (!created) {
            return res.status(400).send('Email already exists.');
        }

        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}
exports.getPartnerRequests = getPartnerRequests;
exports.createPartnerRequest = createPartnerRequest;

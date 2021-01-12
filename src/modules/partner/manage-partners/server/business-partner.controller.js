const path = require('path');
const PartnerRequest = require('./partner-request.model');
const { QueryTypes, Op } = require('sequelize');
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
        const { first_name, last_name, email, procurement_contact, company_codes, purchasing_organization, type } = req.body;

        const companyCodes = company_codes && Array.isArray(company_codes)
            ? company_codes.filter(cb => 'string' === typeof cb)
            : null;

        if (!companyCodes || !companyCodes.length) return res.status(400).send('Invalid Company Codes.');

        const data = {
            type,
            first_name,
            last_name,
            email,
            procurement_contact,
            company_codes: companyCodes
        };

        if(type === 'vendor' || type === 'wholesaler') data.purchasing_organization = purchasing_organization;

        const [user, created] = await PartnerRequest.findOrCreate({
            where: { email: email.toLowerCase() },
            defaults: data
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

async function getPartnerRequest(req, res) {
    try {
        const data = await PartnerRequest.findOne({ where: { id: req.params.id } });
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function updatePartnerRequest(req, res) {
    try {
        const { first_name, last_name, email, procurement_contact, company_codes } = req.body;

        const companyCodes = company_codes && Array.isArray(company_codes)
            ? company_codes.filter(cb => 'string' === typeof cb)
            : null;

        if (!companyCodes || !companyCodes.length) return res.status(400).send('Invalid Company Codes.');

        const partnerRequest = await PartnerRequest.findOne({ where: { id: req.params.id } });
        if (!partnerRequest) return res.status(404).send('The partner request does not exist');

        const isEmailExists = await PartnerRequest.findOne({
            where: {
                id: { [Op.not]: req.params.id },
                email: email.toLowerCase()
            }
        });

        if (isEmailExists) return res.status(400).send('The Email already exists.');

        const data = await partnerRequest.update({ first_name, last_name, email, procurement_contact, company_codes: companyCodes });

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function deletePartnerRequest(req, res) {
    try {
        const id = req.params.id;

        if (!id) return res.status(400).send('Invalid request.');

        const partnerRequest = await PartnerRequest.findOne({ where: { id } });
        if (!partnerRequest) return res.status(404).send('The partner request does not exist.');

        const deleted = await PartnerRequest.destroy({ where: { id } });

        if (!deleted) return res.status(400).send('Delete failed.');

        res.json(partnerRequest);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

exports.getPartnerRequests = getPartnerRequests;
exports.createPartnerRequest = createPartnerRequest;
exports.getPartnerRequest = getPartnerRequest;
exports.updatePartnerRequest = updatePartnerRequest;
exports.deletePartnerRequest = deletePartnerRequest;

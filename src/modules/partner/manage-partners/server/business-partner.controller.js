const path = require('path');
const PartnerRequest = require('./partner-request.model');
const HcpPartner = require('./partner-hcp.model');
const HcoPartner = require('./partner-hco.model');
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

        if (type === 'vendor' || type === 'wholesaler') data.purchasing_organization = purchasing_organization;

        const [user, created] = await PartnerRequest.findOrCreate({
            where: { type, email: email.toLowerCase() },
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
        const { type, first_name, last_name, email, procurement_contact, company_codes, purchasing_organization } = req.body;

        const companyCodes = company_codes && Array.isArray(company_codes)
            ? company_codes.filter(cb => 'string' === typeof cb)
            : null;

        if (!companyCodes || !companyCodes.length) return res.status(400).send('Invalid Company Codes.');

        const partnerRequest = await PartnerRequest.findOne({ where: { id: req.params.id } });
        if (!partnerRequest) return res.status(404).send('The partner request does not exist');

        const isEmailExists = await PartnerRequest.findOne({
            where: {
                id: { [Op.not]: req.params.id },
                type,
                email: email.toLowerCase()
            }
        });

        if (isEmailExists) return res.status(400).send('The Email already exists.');

        const data = {
            first_name,
            last_name,
            email,
            procurement_contact,
            company_codes: companyCodes
        };

        if (type === 'vendor' || type === 'wholesaler') data.purchasing_organization = purchasing_organization;

        const updated_data = await partnerRequest.update(data);

        res.json(updated_data);
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

async function getHcpPartners(req, res) {
    try {
        const HcpPartners = await HcpPartner.findAll();
        res.json(HcpPartners);

    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function createHcpPartner(req, res) {
    try {
        const { first_name, last_name, address_line_1, address_line_2, email, telephone,
            type, uuid, is_italian_hcp, should_report_hco, beneficiary_category,
            iban, bank_name, bank_account_no, currency, document_urls } = req.body;

        const data = {
            first_name, last_name, address_line_1, address_line_2, email, telephone,
            type, uuid, is_italian_hcp, should_report_hco, beneficiary_category,
            iban, bank_name, bank_account_no, currency, document_urls
        };

        const [user, created] = await HcpPartner.findOrCreate({
            where: { type, email: email.toLowerCase() },
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

async function updateHcpPartner(req, res) {
    try {
        const { first_name, last_name, address_line_1, address_line_2, email, telephone,
            type, uuid, is_italian_hcp, should_report_hco, beneficiary_category,
            iban, bank_name, bank_account_no, currency, document_urls } = req.body;

        const hcpPartner = await HcoPartner.findOne({ where: { id: req.params.id } });
        if (!hcpPartner) return res.status(404).send('The partner request does not exist');

        const data = {
            first_name, last_name, address_line_1, address_line_2, email, telephone,
            type, uuid, is_italian_hcp, should_report_hco, beneficiary_category,
            iban, bank_name, bank_account_no, currency, document_urls
        }
        const updated_data = await HcpPartner.update(data);

        res.json(updated_data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function getHcoPartners(req, res) {
    try {
        const HcoPartners = await HcoPartner.findAll();
        res.json(HcoPartners);

    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function createHcoPartner(req, res) {
    try {
        const { contact_first_name, contact_last_name, name, address_line_1,
            address_line_2, email, telephone, type, registration_number,
            iban, bank_name, bank_account_no, currency, document_urls } = req.body;

        const data = {
            contact_first_name, contact_last_name, name, address_line_1,
            address_line_2, email, telephone, type, registration_number,
            iban, bank_name, bank_account_no, currency, document_urls
        };

        const [user, created] = await HcoPartner.findOrCreate({
            where: { type, email: email.toLowerCase() },
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

async function updateHcoPartner(req, res) {
    try {
        const { contact_first_name, contact_last_name, name, address_line_1,
            address_line_2, email, telephone, type, registration_number,
            iban, bank_name, bank_account_no, currency, document_urls } = req.body;

        const hcpPartner = await HcoPartner.findOne({ where: { id: req.params.id } });
        if (!hcpPartner) return res.status(404).send('The partner request does not exist');

        const data = {
            contact_first_name, contact_last_name, name, address_line_1,
            address_line_2, email, telephone, type, registration_number,
            iban, bank_name, bank_account_no, currency, document_urls
        }
        const updated_data = await HcpPartner.update(data);

        res.json(updated_data);
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
exports.getHcpPartners = getHcpPartners;
exports.createHcpPartner = createHcpPartner;
exports.updateHcpPartner = updateHcpPartner;
exports.getHcoPartners = getHcoPartners;
exports.createHcoPartner = createHcoPartner;
exports.updateHcoPartner = updateHcoPartner;

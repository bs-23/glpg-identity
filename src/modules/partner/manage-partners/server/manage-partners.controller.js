const path = require('path');
const HcpPartner = require('./partner-hcp.model');
const HcoPartner = require('./partner-hco.model');
const Application = require('./../../../platform/application/server/application.model');
const { QueryTypes, Op } = require('sequelize');
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));
const { Response, CustomError } = require(path.join(process.cwd(), 'src/modules/core/server/response'));

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

exports.getHcpPartners = getHcpPartners;
exports.createHcpPartner = createHcpPartner;
exports.updateHcpPartner = updateHcpPartner;
exports.getHcoPartners = getHcoPartners;
exports.createHcoPartner = createHcoPartner;
exports.updateHcoPartner = updateHcoPartner;

const path = require('path');
const HcpPartner = require('./partner-hcp.model');
const HcoPartner = require('./partner-hco.model');
const { QueryTypes, Op } = require('sequelize');
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));
const { Response, CustomError } = require(path.join(process.cwd(), 'src/modules/core/server/response'));

async function getHcpPartners(req, res) {
    try {
        const hcpPartners = await HcpPartner.findAll();
        res.json(hcpPartners);

    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function createHcpPartner(req, res) {
    const response = new Response({}, []);
    try {
        const { first_name, last_name, address_line_1, address_line_2, email, telephone,
            type, uuid, is_italian_hcp, should_report_hco, beneficiary_category,
            iban, bank_name, bank_account_no, currency, document_urls } = req.body;

        if (!first_name) response.errors.push(new CustomError('First name is missing.', 400, 'first_name'));
        if (!last_name) response.errors.push(new CustomError('Last name is missing.', 400, 'last_name'));
        if (!email) response.errors.push(new CustomError('Last name is missing.', 400, 'email'));
        if (!type) response.errors.push(new CustomError('Type is missing.', 400, 'type'));

        if (response.errors.length) return res.status(400).send(response);

        const data = {
            first_name, last_name, address_line_1, address_line_2, email, telephone,
            type, uuid, is_italian_hcp, should_report_hco, beneficiary_category,
            iban, bank_name, bank_account_no, currency, document_urls
        };

        const [user, existing] = await HcpPartner.findOrCreate({
            where: { type, email: email.toLowerCase() },
            defaults: data
        });

        if (!existing) {
            response.errors.push(new CustomError('Email already exists.', 400, 'email'));
            return res.status(400).send(response);
        }

        response.data = user;
        res.json(response);

    } catch (err) {
        console.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

async function updateHcpPartner(req, res) {
    try {
        const { first_name, last_name, address_line_1, address_line_2, email, telephone,
            type, uuid, is_italian_hcp, should_report_hco, beneficiary_category,
            iban, bank_name, bank_account_no, currency, document_urls } = req.body;

        const hcpPartner = await HcoPartner.findOne({ where: { id: req.params.id } });
        if (!hcpPartner) return res.status(404).send('The partner does not exist');

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
        const hcoPartners = await HcoPartner.findAll();
        res.json(hcoPartners);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function createHcoPartner(req, res) {
    const response = new Response({}, []);
    try {
        const { contact_first_name, contact_last_name, name, address_line_1,
            address_line_2, email, telephone, type, registration_number,
            iban, bank_name, bank_account_no, currency, document_urls } = req.body;

        if (!contact_first_name) response.errors.push(new CustomError('Contact first name is missing.', 400, 'contact_first_name'));
        if (!contact_last_name) response.errors.push(new CustomError('Contact last name is missing.', 400, 'contact_last_name'));
        if (!name) response.errors.push(new CustomError('Name is missing.', 400, 'name'));
        if (!email) response.errors.push(new CustomError('Email is missing.', 400, 'email'));
        if (!type) response.errors.push(new CustomError('Type is missing.', 400, 'type'));

        if (response.errors.length) return res.status(400).send(response);

        const data = {
            contact_first_name, contact_last_name, name, address_line_1,
            address_line_2, email, telephone, type, registration_number,
            iban, bank_name, bank_account_no, currency, document_urls
        };

        const [user, existing] = await HcoPartner.findOrCreate({
            where: { type, email: email.toLowerCase() },
            defaults: data
        });

        if (!existing) {
            response.errors.push(new CustomError('Email already exists.', 400, 'email'));
            return res.status(400).send(response);
        }

        response.data = user;
        res.json(response);

    } catch (err) {
        console.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

async function updateHcoPartner(req, res) {
    try {
        const { contact_first_name, contact_last_name, name, address_line_1,
            address_line_2, email, telephone, type, registration_number,
            iban, bank_name, bank_account_no, currency, document_urls } = req.body;

        const hcpPartner = await HcoPartner.findOne({ where: { id: req.params.id } });
        if (!hcpPartner) return res.status(404).send('The partner does not exist');

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

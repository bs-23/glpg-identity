const path = require('path');
const PartnerHcps = require('./partner-hcp.model');
const PartnerHcos = require('./partner-hco.model');
const PartnerVendors = require('./partner-vendor.model');
const { QueryTypes, Op } = require('sequelize');
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));
const { Response, CustomError } = require(path.join(process.cwd(), 'src/modules/core/server/response'));
const PartnerRequest = require(path.join(process.cwd(), 'src/modules/partner/manage-requests/server/partner-request.model'));

async function getPartnerHcps(req, res) {
    try {
        const page = req.query.page ? +req.query.page - 1 : 0;
        const limit = req.query.limit ? +req.query.limit : 15;
        const offset = page * limit;

        const hcpPartners = await PartnerHcps.findAll({
            offset,
            limit,
            order: [['created_at', 'DESC']]
        });

        const total = await PartnerHcps.count();

        const responseData = {
            hcpPartners,
            metadata: {
                page: page + 1,
                limit,
                total,
                start: limit * page + 1,
                end: offset + limit > total ? parseInt(total) : parseInt(offset + limit)
            }
        };

        res.json(responseData);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function createPartnerHcp(req, res) {
    const response = new Response({}, []);
    try {
        const { request_id, first_name, last_name, address, city, post_code, email, telephone,
            type, uuid, is_italian_hcp, should_report_hco, beneficiary_category,
            iban, bank_name, bank_account_no, currency, document_urls } = req.body;

        if (!request_id) response.errors.push(new CustomError('Request ID is missing.', 400, 'request_id'));
        if (!first_name) response.errors.push(new CustomError('First name is missing.', 400, 'first_name'));
        if (!last_name) response.errors.push(new CustomError('Last name is missing.', 400, 'last_name'));
        if (!email) response.errors.push(new CustomError('Email is missing.', 400, 'email'));
        if (!type) response.errors.push(new CustomError('Type is missing.', 400, 'type'));

        if (response.errors.length) return res.status(400).send(response);

        const partnerRequest = await PartnerRequest.findOne({
            where: {
                id: request_id,
                entity_type: 'hcp'
            }
        });

        if (!partnerRequest) {
            response.errors.push(new CustomError('Partner request not found.', 404));
            return res.status(404).send(response);
        }

        if (partnerRequest && partnerRequest.status !== 'pending') {
            response.errors.push(new CustomError('Invalid partner request status.', 400));
            return res.status(404).send(response);
        }

        const data = {
            request_id, first_name, last_name, address, city, post_code, email, telephone,
            type, uuid, is_italian_hcp, should_report_hco, beneficiary_category,
            iban, bank_name, bank_account_no, currency, document_urls
        };

        const [partnerHcp, created] = await PartnerHcps.findOrCreate({
            where: {
                [Op.or]: [
                    { request_id: request_id },
                    { email: { [Op.iLike]: email } }
                ]
            },
            defaults: data
        });

        if (!created) {
            response.errors.push(new CustomError('Partner HCP with Request ID/Email already exists.', 400));
            return res.status(400).send(response);
        }

        await partnerRequest.update({ status: 'submitted' });

        response.data = partnerHcp;
        res.json(response);

    } catch (err) {
        console.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

async function updatePartnerHcp(req, res) {
    try {
        const { first_name, last_name, address, city, post_code, email, telephone,
            type, uuid, is_italian_hcp, should_report_hco, beneficiary_category,
            iban, bank_name, bank_account_no, currency, document_urls } = req.body;

        const hcpPartner = await PartnerHcos.findOne({ where: { id: req.params.id } });
        if (!hcpPartner) return res.status(404).send('The partner does not exist');

        const data = {
            first_name, last_name, address, city, post_code, email, telephone,
            type, uuid, is_italian_hcp, should_report_hco, beneficiary_category,
            iban, bank_name, bank_account_no, currency, document_urls
        }
        const updated_data = await PartnerHcps.update(data);

        res.json(updated_data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function getPartnerHcos(req, res) {
    try {
        const page = req.query.page ? +req.query.page - 1 : 0;
        const limit = req.query.limit ? +req.query.limit : 15;
        const offset = page * limit;

        const hcoPartners = await PartnerHcos.findAll({
            offset,
            limit,
            order: [['created_at', 'DESC']]
        });

        const total = await PartnerHcos.count();

        const responseData = {
            hcoPartners,
            metadata: {
                page: page + 1,
                limit,
                total,
                start: limit * page + 1,
                end: offset + limit > total ? parseInt(total) : parseInt(offset + limit)
            }
        };

        res.json(responseData);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function createPartnerHco(req, res) {
    const response = new Response({}, []);
    try {
        const { request_id, contact_first_name, contact_last_name, name, address, city, post_code, email, telephone, type, registration_number, iban, bank_name, bank_account_no, currency, document_urls } = req.body;

        if (!request_id) response.errors.push(new CustomError('Request ID is missing.', 400, 'request_id'));
        if (!contact_first_name) response.errors.push(new CustomError('Contact first name is missing.', 400, 'contact_first_name'));
        if (!contact_last_name) response.errors.push(new CustomError('Contact last name is missing.', 400, 'contact_last_name'));
        if (!name) response.errors.push(new CustomError('Name is missing.', 400, 'name'));
        if (!email) response.errors.push(new CustomError('Email is missing.', 400, 'email'));
        if (!type) response.errors.push(new CustomError('Type is missing.', 400, 'type'));

        if (response.errors.length) return res.status(400).send(response);

        const partnerRequest = await PartnerRequest.findOne({
            where: {
                id: request_id,
                entity_type: 'hco'
            }
        });

        if (!partnerRequest) {
            response.errors.push(new CustomError('Partner request not found.', 404));
            return res.status(404).send(response);
        }

        if (partnerRequest && partnerRequest.status !== 'pending') {
            response.errors.push(new CustomError('Invalid partner request status.', 400));
            return res.status(404).send(response);
        }

        const data = {
            request_id, contact_first_name, contact_last_name, name, address, city, post_code, email, telephone, type, registration_number, iban, bank_name, bank_account_no, currency, document_urls
        };

        const [partnerHco, created] = await PartnerHcos.findOrCreate({
            where: {
                [Op.or]: [
                    { request_id: request_id },
                    { registration_number: { [Op.iLike]: registration_number } }
                ]
            },
            defaults: data
        });

        if (!created) {
            response.errors.push(new CustomError('Partner with VAT number/Registration number already exists.', 400, 'registration_number'));
            return res.status(400).send(response);
        }

        await partnerRequest.update({ status: 'submitted' });

        response.data = partnerHco;
        res.json(response);

    } catch (err) {
        console.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

async function updatePartnerHco(req, res) {
    try {
        const { contact_first_name, contact_last_name, name, address, city, post_code, email, telephone, type, registration_number, iban, bank_name, bank_account_no, currency, document_urls } = req.body;

        const hcpPartner = await PartnerHcos.findOne({ where: { id: req.params.id } });
        if (!hcpPartner) return res.status(404).send('The partner does not exist');

        const data = {
            contact_first_name, contact_last_name, name, address, city, post_code, email, telephone, type, registration_number, iban, bank_name, bank_account_no, currency, document_urls
        }
        const updated_data = await PartnerHcps.update(data);

        res.json(updated_data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function createPartnerVendor(req, res) {
    const response = new Response({}, []);
    try {
        const { request_id, requestor_first_name, requestor_last_name, purchasing_org, company_code, requestor_email, procurement_contact, name, registration_number, address, city, post_code, telephone, invoice_contact_name, invoice_address, invoice_city, invoice_post_code, invoice_email, invoice_telephone, commercial_contact_name, commercial_address, commercial_city, commercial_post_code, commercial_email, commercial_telephone, ordering_contact_name, ordering_email, ordering_telephone, iban, bank_name, bank_account_no, currency, document_urls } = req.body;

        if (!request_id) response.errors.push(new CustomError('Request ID is missing.', 400, 'request_id'));
        if (!name) response.errors.push(new CustomError('Name is missing.', 400, 'name'));
        if (!registration_number) response.errors.push(new CustomError('VAT number/Company Registration number is missing.', 400, 'registration_number'));
        if (!address) response.errors.push(new CustomError('Address is missing.', 400, 'address'));
        if (!city) response.errors.push(new CustomError('City is missing.', 400, 'city'));
        if (!ordering_email) response.errors.push(new CustomError('Ordering email address is missing.', 400, 'ordering_email'));

        if (response.errors.length) return res.status(400).send(response);

        const partnerRequest = await PartnerRequest.findOne({
            where: {
                id: request_id,
                entity_type: 'vendor'
            }
        });

        if (!partnerRequest) {
            response.errors.push(new CustomError('Partner request not found.', 404));
            return res.status(404).send(response);
        }

        if (partnerRequest && partnerRequest.status !== 'pending') {
            response.errors.push(new CustomError('Invalid partner request status.', 400));
            return res.status(404).send(response);
        }

        const data = {
            request_id, requestor_first_name, requestor_last_name, purchasing_org, company_code, requestor_email, procurement_contact, name, registration_number, address, city, post_code, telephone, invoice_contact_name, invoice_address, invoice_city, invoice_post_code, invoice_email, invoice_telephone, commercial_contact_name, commercial_address, commercial_city, commercial_post_code, commercial_email, commercial_telephone, ordering_contact_name, ordering_email, ordering_telephone, iban, bank_name, bank_account_no, currency, document_urls
        };

        const [partnerVendor, created] = await PartnerVendors.findOrCreate({
            where: {
                [Op.or]: [
                    { request_id: request_id },
                    { registration_number: { [Op.iLike]: registration_number } }
                ]
            },
            defaults: data
        });

        if (!created) {
            response.errors.push(new CustomError('Partner with VAT number/Registration number already exists.', 400, 'registration_number'));
            return res.status(400).send(response);
        }

        await partnerRequest.update({ status: 'submitted' });

        response.data = partnerVendor;
        res.json(response);

    } catch (err) {
        console.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

async function getPartnerVendors(req, res) {
    try {
        const page = req.query.page ? +req.query.page - 1 : 0;
        const limit = req.query.limit ? +req.query.limit : 15;
        const offset = page * limit;

        const partnerVendors = await PartnerVendors.findAll({
            offset,
            limit,
            order: [['created_at', 'DESC']]
        });

        const total = await PartnerVendors.count();

        const responseData = {
            partnerVendors,
            metadata: {
                page: page + 1,
                limit,
                total,
                start: limit * page + 1,
                end: offset + limit > total ? parseInt(total) : parseInt(offset + limit)
            }
        };

        res.json(responseData);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

exports.getPartnerHcps = getPartnerHcps;
exports.createPartnerHcp = createPartnerHcp;
exports.updatePartnerHcp = updatePartnerHcp;
exports.getPartnerHcos = getPartnerHcos;
exports.createPartnerHco = createPartnerHco;
exports.updatePartnerHco = updatePartnerHco;
exports.createPartnerVendor = createPartnerVendor;
exports.getPartnerVendors = getPartnerVendors;

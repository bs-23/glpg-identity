const path = require('path');
const PartnerHcps = require('./partner-hcp.model');
const PartnerHcos = require('./partner-hco.model');
const PartnerVendors = require('./partner-vendor.model');
const { QueryTypes, Op } = require('sequelize');
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));
const { Response, CustomError } = require(path.join(process.cwd(), 'src/modules/core/server/response'));
const PartnerRequest = require(path.join(process.cwd(), 'src/modules/partner/manage-requests/server/partner-request.model'));
const storageService = require(path.join(process.cwd(), 'src/modules/core/server/storage/storage.service'));
const File = require(path.join(process.cwd(), 'src/modules/core/server/storage/file.model'));

const FILE_SIZE_LIMIT = 5242880; // 5 MB


async function uploadDucuments(owner, type, files) {
    const fileEntities = [];
    const bucket = 'cdp-development';
    for (const file of files) {
        const uploadOptions = {
            bucket,
            folder: `documents/partner/${type}/${owner.id}/`,
            fileName: file.originalname,
            fileContent: file.buffer
        };

        const tableNames = {
            hcp: 'partner_hcps',
            hco: 'partner_hcos',
            vendor: 'partner_vendors',
            wholesaler: 'partner_vendors',
        };

        const response = await storageService.upload(uploadOptions);
        const fileCreated = await File.create({
            name: file.originalname,
            bucket,
            key: response.key,
            owner_id: owner.id,
            table_name: tableNames[type]
        });
        fileEntities.push(fileCreated.dataValues);
    };
    return fileEntities;
}

async function getPartnerHcps(req, res) {
    try {
        const page = req.query.page ? +req.query.page - 1 : 0;
        const limit = req.query.limit ? +req.query.limit : 15;
        const offset = page * limit;

        const orderBy = req.query.orderBy === 'null'
            ? null
            : req.query.orderBy;
        const orderType = req.query.orderType === 'asc' || req.query.orderType === 'desc'
            ? req.query.orderType
            : 'asc';

        const sortableColumns = ['first_name', 'last_name', 'status', 'uuid', 'onekey_id', 'country_iso2', 'language', 'city'];

        const order = [];
        if (orderBy && (sortableColumns || []).includes(orderBy)) {
            order.push([orderBy, orderType]);
        }

        if (orderBy !== 'created_at') order.push(['created_at', 'DESC']);

        const hcpPartners = await PartnerHcps.findAll({
            offset,
            limit,
            order,
            attributes: { exclude: ['created_at', 'updated_at'] }
        });

        const total = await PartnerHcps.count();

        const responseData = {
            partners: hcpPartners,
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

async function getPartnerHcp(req, res) {
    try {
        const partnerHcp = await PartnerHcps.findOne({
            where: { id: req.params.id },
            attributes: { exclude: ['created_at', 'updated_at'] }
        });

        if (!partnerHcp) return res.status(404).send('The partner does not exist');

        const documents = await File.findAll({ where: { owner_id: partnerHcp.id } });

        partnerHcp.dataValues.documents = documents.map(d => ({
            name: d.dataValues.name,
            id: d.dataValues.id
        }));

        res.json(partnerHcp);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function createPartnerHcp(req, res) {
    const response = new Response({}, []);
    try {
        const files = req.files;

        const { request_id, first_name, last_name, address, city, post_code, email, telephone,
            type, country_iso2, language, uuid, onekey_id, is_italian_hcp, should_report_hco, beneficiary_category,
            iban, bank_name, bank_account_no, currency } = req.body;

        if (!request_id) response.errors.push(new CustomError('Request ID is missing.', 400, 'request_id'));
        if (!first_name) response.errors.push(new CustomError('First name is missing.', 400, 'first_name'));
        if (!last_name) response.errors.push(new CustomError('Last name is missing.', 400, 'last_name'));
        if (!email) response.errors.push(new CustomError('Email is missing.', 400, 'email'));
        if (!type) response.errors.push(new CustomError('Type is missing.', 400, 'type'));
        if (!country_iso2) response.errors.push(new CustomError('Country code is missing.', 400, 'country_iso2'));
        if (!language) response.errors.push(new CustomError('Language is missing.', 400, 'language'));

        const fileWithInvalidType = files.find(f => f.mimetype !== 'application/pdf');
        if (fileWithInvalidType) response.errors.push(new CustomError('Invalid file type. Only PDF is allowed.', 400, 'documents'));

        const fileWithInvalidSize = files.find(f => f.size > FILE_SIZE_LIMIT);
        if (fileWithInvalidSize) response.errors.push(new CustomError('Invalid file size. Size limit is 5 MB', 400, 'documents'));

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
            return res.status(400).send(response);
        }

        const data = {
            request_id, first_name, last_name, address, city, post_code, email, telephone,
            type, country_iso2, language, uuid, onekey_id, is_italian_hcp, should_report_hco, beneficiary_category,
            iban, bank_name, bank_account_no, currency
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

        const documents = await uploadDucuments(partnerHcp, 'hcp', files);
        partnerHcp.dataValues.documents = documents.map(d => d.key);

        delete partnerHcp.created_at;
        delete partnerHcp.updated_at;

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

        const orderBy = req.query.orderBy === 'null'
            ? null
            : req.query.orderBy;
        const orderType = req.query.orderType === 'asc' || req.query.orderType === 'desc'
            ? req.query.orderType
            : 'asc';

        const sortableColumns = ['contact_first_name', 'contact_last_name', 'status', 'onekey_id', 'uuid', 'Ö', 'language', 'city'];

        const order = [];
        if (orderBy && (sortableColumns || []).includes(orderBy)) {
            order.push([orderBy, orderType]);
        }

        if (orderBy !== 'created_at') order.push(['created_at', 'DESC']);

        const hcoPartners = await PartnerHcos.findAll({
            offset,
            limit,
            order,
            attributes: { exclude: ['created_at', 'updated_at'] }
        });

        const total = await PartnerHcos.count();

        const responseData = {
            partners: hcoPartners,
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

async function getPartnerHco(req, res) {
    try {
        const partnerHco = await PartnerHcos.findOne({
            where: { id: req.params.id },
            attributes: { exclude: ['created_at', 'updated_at'] }
        });

        if (!partnerHco) return res.status(404).send('The partner does not exist');

        const documents = await File.findAll({ where: { owner_id: partnerHco.id } });

        partnerHco.dataValues.documents = documents.map(d => ({
            name: d.dataValues.name,
            id: d.dataValues.id
        }));

        res.json(partnerHco);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function createPartnerHco(req, res) {
    const response = new Response({}, []);
    try {
        const files = req.files;

        const { request_id, contact_first_name, contact_last_name, name, address, city, post_code, email, telephone, type, uuid, onekey_id, country_iso2, language, registration_number, iban, bank_name, bank_account_no, currency } = req.body;

        if (!request_id) response.errors.push(new CustomError('Request ID is missing.', 400, 'request_id'));
        if (!contact_first_name) response.errors.push(new CustomError('Contact first name is missing.', 400, 'contact_first_name'));
        if (!contact_last_name) response.errors.push(new CustomError('Contact last name is missing.', 400, 'contact_last_name'));
        if (!name) response.errors.push(new CustomError('Name is missing.', 400, 'name'));
        if (!email) response.errors.push(new CustomError('Email is missing.', 400, 'email'));
        if (!type) response.errors.push(new CustomError('Type is missing.', 400, 'type'));
        if (!country_iso2) response.errors.push(new CustomError('Country code is missing.', 400, 'country_iso2'));
        if (!language) response.errors.push(new CustomError('Language is missing.', 400, 'language'));

        const fileWithInvalidType = files.find(f => f.mimetype !== 'application/pdf');
        if (fileWithInvalidType) response.errors.push(new CustomError('Invalid file type. Only PDF is allowed.', 400, 'documents'));

        const fileWithInvalidSize = files.find(f => f.size > FILE_SIZE_LIMIT);
        if (fileWithInvalidSize) response.errors.push(new CustomError('Invalid file size. Size limit is 5 MB', 400, 'documents'));

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
            request_id, contact_first_name, contact_last_name, name, address, city, post_code, email, telephone, type, uuid, onekey_id, country_iso2, language, registration_number, iban, bank_name, bank_account_no, currency
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

        const documents = await uploadDucuments(partnerHco, 'hco', files);
        partnerHco.dataValues.documents = documents.map(d => d.key);

        delete partnerHco.created_at;
        delete partnerHco.updated_at;

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

async function getPartnerVendors(req, res) {
    try {
        const type = req.query.type ? req.query.type : 'vendor';
        const page = req.query.page ? +req.query.page - 1 : 0;
        const limit = req.query.limit ? +req.query.limit : 15;
        const offset = page * limit;

        const orderBy = req.query.orderBy === 'null'
            ? null
            : req.query.orderBy;
        const orderType = req.query.orderType === 'asc' || req.query.orderType === 'desc'
            ? req.query.orderType
            : 'asc';

        const sortableColumns = ['requestor_first_name', 'requestor_last_name', 'status', 'country_iso2', 'language', 'city'];

        const order = [];
        if (orderBy && (sortableColumns || []).includes(orderBy)) {
            order.push([orderBy, orderType]);
        }

        if (orderBy !== 'created_at') order.push(['created_at', 'DESC']);

        const partnerVendors = await PartnerVendors.findAll({
            where: { type },
            offset,
            limit,
            order,
            attributes: { exclude: ['created_at', 'updated_at'] }
        });

        const total = await PartnerVendors.count();

        const responseData = {
            partners: partnerVendors,
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

async function getPartnerVendor(req, res) {
    try {
        const partnerVendor = await PartnerVendors.findOne({
            where: { id: req.params.id },
            attributes: { exclude: ['created_at', 'updated_at'] }
        });

        if (!partnerVendor) return res.status(404).send('The partner does not exist');

        const documents = await File.findAll({ where: { owner_id: partnerVendor.id } });

        partnerVendor.dataValues.documents = documents.map(d => ({
            name: d.dataValues.name,
            id: d.dataValues.id
        }));

        res.json(partnerVendor);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function createPartnerVendor(req, res) {
    const response = new Response({}, []);
    try {
        const files = req.files;

        const { request_id, type, country_iso2, language, requestor_first_name, requestor_last_name, purchasing_org, company_code, requestor_email, procurement_contact, name, registration_number, address, city, post_code, telephone, invoice_contact_name, invoice_address, invoice_city, invoice_post_code, invoice_email, invoice_telephone, commercial_contact_name, commercial_address, commercial_city, commercial_post_code, commercial_email, commercial_telephone, ordering_contact_name, ordering_email, ordering_telephone, iban, bank_name, bank_account_no, currency } = req.body;

        if (!request_id) response.errors.push(new CustomError('Request ID is missing.', 400, 'request_id'));
        if (!type) response.errors.push(new CustomError('Vendor type is missing.', 400, 'type'));
        if (!name) response.errors.push(new CustomError('Name is missing.', 400, 'name'));
        if (!registration_number) response.errors.push(new CustomError('VAT number/Company Registration number is missing.', 400, 'registration_number'));
        if (!address) response.errors.push(new CustomError('Address is missing.', 400, 'address'));
        if (!city) response.errors.push(new CustomError('City is missing.', 400, 'city'));
        if (!ordering_email) response.errors.push(new CustomError('Ordering email address is missing.', 400, 'ordering_email'));
        if (!country_iso2) response.errors.push(new CustomError('Country code is missing.', 400, 'country_iso2'));
        if (!language) response.errors.push(new CustomError('Language is missing.', 400, 'language'));

        const fileWithInvalidType = files.find(f => f.mimetype !== 'application/pdf');
        if (fileWithInvalidType) response.errors.push(new CustomError('Invalid file type. Only PDF is allowed.', 400, 'documents'));

        const fileWithInvalidSize = files.find(f => f.size > FILE_SIZE_LIMIT);
        if (fileWithInvalidSize) response.errors.push(new CustomError('Invalid file size. Size limit is 5 MB', 400, 'documents'));

        if (response.errors.length) return res.status(400).send(response);

        const partnerRequest = await PartnerRequest.findOne({
            where: {
                id: request_id,
                entity_type: type
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
            request_id, type, country_iso2, language, requestor_first_name, requestor_last_name, purchasing_org, company_code, requestor_email, procurement_contact, name, registration_number, address, city, post_code, telephone, invoice_contact_name, invoice_address, invoice_city, invoice_post_code, invoice_email, invoice_telephone, commercial_contact_name, commercial_address, commercial_city, commercial_post_code, commercial_email, commercial_telephone, ordering_contact_name, ordering_email, ordering_telephone, iban, bank_name, bank_account_no, currency
        };

        const [partnerVendor, created] = await PartnerVendors.findOrCreate({
            where: {
                [Op.or]: [
                    { request_id: request_id },
                    {
                        [Op.and]: [
                            { registration_number: { [Op.iLike]: registration_number } },
                            { type: type }
                        ]
                    }
                ]
            },
            defaults: data
        });

        if (!created) {
            response.errors.push(new CustomError('Partner with VAT number/Registration number already exists.', 400, 'registration_number'));
            return res.status(400).send(response);
        }

        await partnerRequest.update({ status: 'submitted' });

        const documents = await uploadDucuments(partnerVendor, type, files);
        partnerVendor.dataValues.documents = documents.map(d => d.key);

        delete partnerVendor.created_at;
        delete partnerVendor.updated_at;

        response.data = partnerVendor;
        res.json(response);

    } catch (err) {
        console.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

exports.getPartnerHcps = getPartnerHcps;
exports.getPartnerHcp = getPartnerHcp;
exports.createPartnerHcp = createPartnerHcp;
exports.updatePartnerHcp = updatePartnerHcp;
exports.getPartnerHcos = getPartnerHcos;
exports.getPartnerHco = getPartnerHco;
exports.createPartnerHco = createPartnerHco;
exports.updatePartnerHco = updatePartnerHco;
exports.getPartnerVendors = getPartnerVendors;
exports.getPartnerVendor = getPartnerVendor;
exports.createPartnerVendor = createPartnerVendor;

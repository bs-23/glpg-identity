const path = require('path');
const Partner = require('./partner.model');
const PartnerVendors = require('./partner-vendor.model');
const { Op } = require('sequelize');
const { Response, CustomError } = require(path.join(process.cwd(), 'src/modules/core/server/response'));
const PartnerRequest = require(path.join(process.cwd(), 'src/modules/partner/manage-requests/server/partner-request.model'));
const storageService = require(path.join(process.cwd(), 'src/modules/core/server/storage/storage.service'));
const File = require(path.join(process.cwd(), 'src/modules/core/server/storage/file.model'));

const FILE_SIZE_LIMIT = 5242880; // 5 MB


async function uploadDucuments(owner, type, files) {
    const fileEntities = [];
    const bucketName = 'cdp-development';
    for (const file of files) {
        const uploadOptions = {
            bucket: bucketName,
            folder: `documents/partner/${type}/${owner.id}/`,
            fileName: file.originalname,
            fileContent: file.buffer
        };

        const tableNames = {
            hcp: 'partners',
            hco: 'partners',
            vendor: 'partner_vendors',
            wholesaler: 'partner_vendors',
        };

        const response = await storageService.upload(uploadOptions);
        const fileCreated = await File.create({
            name: file.originalname,
            bucket_name: bucketName,
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

        const sortableColumns = ['first_name', 'last_name', 'onekey_id', 'uuid', 'language', 'city'];

        const order = [];
        if (orderBy && (sortableColumns || []).includes(orderBy)) {
            order.push([orderBy, orderType]);
        }

        if (orderBy !== 'created_at') order.push(['created_at', 'DESC']);

        const hcpPartners = await Partner.findAll({
            where: { entity_type: 'hcp' },
            offset,
            limit,
            order,
            attributes: ['id', 'onekey_id', 'uuid', 'first_name', 'last_name', 'address', 'city', 'country_iso2', 'language', 'status']
        });

        const total = await Partner.count({ where: { entity_type: 'hcp' }, });

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
        const partnerHcp = await Partner.findOne({
            where: { id: req.params.id },
            attributes: { exclude: ['entity_type', 'organization_name', 'organization_type', 'created_at', 'updated_at'] }
        });

        if (!partnerHcp) return res.status(404).send('The partner does not exist');

        partnerHcp.dataValues.type = partnerHcp.dataValues.individual_type;
        delete partnerHcp.dataValues.individual_type;

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
    const entityType = 'hcp';
    try {
        const files = req.files;

        const { request_id, first_name, last_name, address, city, post_code, email, telephone,
            type, country_iso2, language, registration_number, uuid, onekey_id, is_italian_hcp, should_report_hco, beneficiary_category,
            iban, bank_name, bank_account_no, currency } = req.body;

        if (response.errors.length) return res.status(400).send(response);

        const partnerRequest = await PartnerRequest.findOne({
            where: {
                id: request_id,
                entity_type: entityType
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
            request_id, first_name, last_name, address, city, post_code, email, telephone, country_iso2, language, registration_number, uuid, onekey_id, is_italian_hcp, should_report_hco, beneficiary_category, iban, bank_name, bank_account_no, currency
        };

        data.entity_type = entityType;
        data.individual_type = type;

        const [partnerHcp, created] = await Partner.findOrCreate({
            where: { request_id: request_id },
            defaults: data
        });

        if (!created) {
            response.errors.push(new CustomError('Partner HCP with Request ID/Email already exists.', 400));
            return res.status(400).send(response);
        }

        await partnerRequest.update({ status: 'submitted' });

        const documents = await uploadDucuments(partnerHcp, entityType, files);
        partnerHcp.dataValues.documents = documents.map(d => d.key);

        partnerHcp.dataValues.type = partnerHcp.dataValues.individual_type;

        delete partnerHcp.dataValues.created_at;
        delete partnerHcp.dataValues.updated_at;
        delete partnerHcp.dataValues.individual_type;
        delete partnerHcp.dataValues.organization_name;
        delete partnerHcp.dataValues.organization_type;
        delete partnerHcp.dataValues.entity_type;


        response.data = partnerHcp;
        res.json(response);

    } catch (err) {
        console.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
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

        const sortableColumns = ['first_name', 'last_name', 'onekey_id', 'uuid', 'language', 'city'];

        const order = [];
        if (orderBy && (sortableColumns || []).includes(orderBy)) {
            order.push([orderBy, orderType]);
        }

        if (orderBy !== 'created_at') order.push(['created_at', 'DESC']);

        const hcoPartners = await Partner.findAll({
            where: { entity_type: 'hco' },
            offset,
            limit,
            order,
            attributes: ['id', 'onekey_id', 'uuid', 'first_name', 'last_name', 'address', 'city', 'country_iso2', 'language', 'status']
        });

        const total = await Partner.count({ where: { entity_type: 'hco' } });

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
        const partnerHco = await Partner.findOne({
            where: { id: req.params.id },
            attributes: { exclude: ['entity_type', 'is_italian_hcp', 'should_report_hco', 'beneficiary_category', 'created_at', 'updated_at'] }
        });

        if (!partnerHco) return res.status(404).send('The partner does not exist');

        partnerHco.dataValues.type = partnerHco.dataValues.organization_type;
        delete partnerHco.dataValues.organization_type;

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
    const entityType = 'hco';
    try {
        const files = req.files;

        const { request_id, contact_first_name, contact_last_name, organization_name, address, city, post_code, email, telephone, type, uuid, onekey_id, country_iso2, language, registration_number, iban, bank_name, bank_account_no, currency } = req.body;

        if (response.errors.length) return res.status(400).send(response);

        const partnerRequest = await PartnerRequest.findOne({
            where: {
                id: request_id,
                entity_type: entityType
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
            request_id, organization_name, address, city, post_code, email, telephone, uuid, onekey_id, country_iso2, language, registration_number, iban, bank_name, bank_account_no, currency
        };
        data.entityType = entityType;
        data.first_name = contact_first_name;
        data.last_name = contact_last_name;
        data.organization_type = type;

        const [partnerHco, created] = await Partner.findOrCreate({
            where: { request_id: request_id },
            defaults: data
        });

        if (!created) {
            response.errors.push(new CustomError('Partner with VAT number/Registration number already exists.', 400, 'registration_number'));
            return res.status(400).send(response);
        }

        await partnerRequest.update({ status: 'submitted' });

        const documents = await uploadDucuments(partnerHco, entityType, files);
        partnerHco.dataValues.documents = documents.map(d => d.key);

        partnerHco.dataValues.contact_first_name = partnerHco.dataValues.first_name;
        partnerHco.dataValues.contact_last_name = partnerHco.dataValues.last_name;

        delete partnerHco.dataValues.individual_type;
        delete partnerHco.dataValues.is_italian_hcp;
        delete partnerHco.dataValues.should_report_hco;
        delete partnerHco.dataValues.beneficiary_category;
        delete partnerHco.dataValues.created_at;
        delete partnerHco.dataValues.updated_at;

        response.data = partnerHco;
        res.json(response);

    } catch (err) {
        console.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
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
            where: { entity_type: type },
            offset,
            limit,
            order,
            attributes: ['id', 'requestor_first_name', 'requestor_last_name', 'language', 'address', 'city', 'country_iso2', 'status']
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
            attributes: { exclude: ['entity_type', 'created_at', 'updated_at'] }
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
            request_id, country_iso2, language, requestor_first_name, requestor_last_name, purchasing_org, company_code, requestor_email, procurement_contact, name, registration_number, address, city, post_code, telephone, invoice_contact_name, invoice_address, invoice_city, invoice_post_code, invoice_email, invoice_telephone, commercial_contact_name, commercial_address, commercial_city, commercial_post_code, commercial_email, commercial_telephone, ordering_contact_name, ordering_email, ordering_telephone, iban, bank_name, bank_account_no, currency
        };

        data.entity_type = type;

        const [partnerVendor, created] = await PartnerVendors.findOrCreate({
            where: {
                [Op.or]: [
                    { request_id: request_id },
                    {
                        [Op.and]: [
                            { registration_number: { [Op.iLike]: registration_number } },
                            { entity_type: type }
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

        delete partnerVendor.dataValues.created_at;
        delete partnerVendor.dataValues.updated_at;

        response.data = partnerVendor;
        res.json(response);

    } catch (err) {
        console.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

async function getDownloadUrl(req, res) {
    try {
        const file = await File.findOne({
            where: { id: req.params.id }
        });

        if (!file) return res.status(404).send('The file does not exist');

        const url = storageService.getSignedUrl(file.bucket_name, file.key);

        res.json(url)
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
}

async function approvePartner(req, res) {
    try {
        const id = req.params.id;
        const entityType = req.params.entityType;

        const PartnerModel = entityType === 'hcp' || entityType === 'hco'
            ? Partner
            : PartnerVendors;

        const partner = await PartnerModel.findOne({
            where: {
                id: id,
                entity_type: entityType
            }
        });

        if (!partner) return res.status(404).send(`The ${entityType} partner does not exist`);

        if (partner.status !== 'pending') return res.status(400).send(`The ${entityType} partner has already been approved/rejected`);

        await partner.update({ status: 'approved' });

        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
}

exports.getPartnerHcps = getPartnerHcps;
exports.getPartnerHcp = getPartnerHcp;
exports.createPartnerHcp = createPartnerHcp;
exports.getPartnerHcos = getPartnerHcos;
exports.getPartnerHco = getPartnerHco;
exports.createPartnerHco = createPartnerHco;
exports.getPartnerVendors = getPartnerVendors;
exports.getPartnerVendor = getPartnerVendor;
exports.createPartnerVendor = createPartnerVendor;
exports.getDownloadUrl = getDownloadUrl;
exports.approvePartner = approvePartner;

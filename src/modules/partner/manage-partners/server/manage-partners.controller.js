const path = require('path');
const url = require('url');
const Partner = require('./partner.model');
const PartnerVendors = require('./partner-vendor.model');
const { Op } = require('sequelize');
const { Response, CustomError } = require(path.join(process.cwd(), 'src/modules/core/server/response'));
const PartnerRequest = require(path.join(process.cwd(), 'src/modules/partner/manage-requests/server/partner-request.model'));
const storageService = require(path.join(process.cwd(), 'src/modules/core/server/storage/storage.service'));
const File = require(path.join(process.cwd(), 'src/modules/core/server/storage/file.model'));
const ExportService = require(path.join(process.cwd(), 'src/modules/core/server/export/export.service'));

async function uploadDucuments(owner, type, files) {
    const bucketName = 'cdp-development';
    for (const file of files) {
        const uploadOptions = {
            bucket: bucketName,
            folder: `business-partner/documents/${owner.id}/`,
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
    };
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

        const sortableColumns = ['first_name', 'last_name', 'onekey_id', 'uuid', 'locale', 'city'];

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
            attributes: ['id', 'onekey_id', 'uuid', 'first_name', 'last_name', 'address', 'city', 'country_iso2', 'locale', 'status']
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

async function registrationLookup(req, res) {
    const response = new Response({}, []);

    try {
        if (!req.query.request_id) response.errors.push(new CustomError('Request Id missing.', 400));

        if (response.errors.length) return res.status(400).send(response);

        const partnerRequest = await PartnerRequest.findOne({
            where: { id: req.query.request_id },
            attributes: ["id", "entity_type", "first_name", "last_name", "email", "procurement_contact", "partner_type", "uuid", "company_codes", "country_iso2", "locale"]
        });

        response.data = partnerRequest;

        res.json(response);
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
            type, country_iso2, locale, registration_number, uuid, is_italian_hcp, should_report_hco, beneficiary_category,
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
            request_id, first_name, last_name, address, city, post_code, email, telephone, country_iso2, locale, registration_number, uuid, is_italian_hcp, should_report_hco, beneficiary_category, iban, bank_name, bank_account_no, currency
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

        await uploadDucuments(partnerHcp, entityType, files);

        partnerHcp.dataValues.type = partnerHcp.dataValues.individual_type;

        delete partnerHcp.dataValues.created_at;
        delete partnerHcp.dataValues.updated_at;
        delete partnerHcp.dataValues.individual_type;
        delete partnerHcp.dataValues.organization_name;
        delete partnerHcp.dataValues.organization_type;
        delete partnerHcp.dataValues.entity_type;
        delete partnerHcp.dataValues.onekey_id;


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
        const files = req.files;

        const { first_name, last_name, address, city, post_code, email, telephone,
            type, country_iso2, locale, registration_number, uuid, is_italian_hcp, should_report_hco, beneficiary_category,
            iban, bank_name, bank_account_no, currency } = req.body;

        console.log(files);

        const partner = await Partner.findOne({
            where: {
                id: req.params.id
            }
        });

        if (!partner) {
            return res.status(404).send('Partner not found.');
        }

        const data = {
            first_name, last_name, address, city, post_code, email, telephone, country_iso2, locale, registration_number, uuid, is_italian_hcp, should_report_hco, beneficiary_category, iban, bank_name, bank_account_no, currency,
            individual_type: type
        };


        const updated_data = await partner.update(data);

        await uploadDucuments(partner, updated_data.dataValues.entity_type, files);

        updated_data.dataValues.type = partner.dataValues.individual_type;

        delete updated_data.dataValues.created_at;
        delete updated_data.dataValues.updated_at;
        delete updated_data.dataValues.individual_type;
        delete updated_data.dataValues.organization_name;
        delete updated_data.dataValues.organization_type;
        delete updated_data.dataValues.entity_type;
        delete updated_data.dataValues.onekey_id;

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

        const sortableColumns = ['first_name', 'last_name', 'onekey_id', 'uuid', 'locale', 'city'];

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
            attributes: ['id', 'onekey_id', 'uuid', 'first_name', 'last_name', 'address', 'city', 'country_iso2', 'locale', 'status']
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
    const entityType = 'hco';
    try {
        const files = req.files;

        const { request_id, contact_first_name, contact_last_name, organization_name, address, city, post_code, email, telephone, type, uuid, country_iso2, locale, registration_number, iban, bank_name, bank_account_no, currency } = req.body;

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
            request_id, organization_name, address, city, post_code, email, telephone, uuid, country_iso2, locale, registration_number, iban, bank_name, bank_account_no, currency
        };
        data.entity_type = entityType;
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

        await uploadDucuments(partnerHco, entityType, files);

        partnerHco.dataValues.contact_first_name = partnerHco.dataValues.first_name;
        partnerHco.dataValues.contact_last_name = partnerHco.dataValues.last_name;

        delete partnerHco.dataValues.individual_type;
        delete partnerHco.dataValues.is_italian_hcp;
        delete partnerHco.dataValues.should_report_hco;
        delete partnerHco.dataValues.beneficiary_category;
        delete partnerHco.dataValues.onekey_id;
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

async function updatePartnerHco(req, res) {
    try {
        const files = req.files;

        const { contact_first_name, contact_last_name, organization_name, address, city, post_code, email, telephone, type, uuid, country_iso2, locale, registration_number, iban, bank_name, bank_account_no, currency } = req.body;

        const partner = await Partner.findOne({
            where: {
                id: req.params.id
            }
        });

        if (!partner) {
            return res.status(404).send('Partner not found.');
        }

        const data = {
            contact_first_name, contact_last_name, organization_name, address, city, post_code, email, telephone, type, uuid, country_iso2, locale, registration_number, iban, bank_name, bank_account_no, currency
        };

        data.entity_type = entityType;
        data.first_name = contact_first_name;
        data.last_name = contact_last_name;
        data.organization_type = type;


        const updated_data = await partner.update(data);

        await uploadDucuments(partner, updated_data.dataValues.entity_type, files);

        updated_data.dataValues.contact_first_name = updated_data.dataValues.first_name;
        updated_data.dataValues.contact_last_name = updated_data.dataValues.last_name;

        delete updated_data.dataValues.individual_type;
        delete updated_data.dataValues.is_italian_hcp;
        delete updated_data.dataValues.should_report_hco;
        delete updated_data.dataValues.beneficiary_category;
        delete updated_data.dataValues.onekey_id;
        delete updated_data.dataValues.created_at;
        delete updated_data.dataValues.updated_at;


        res.json(updated_data);

    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function getNonHealthcarePartners(req, res, type) {
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

        const sortableColumns = ['name', 'status', 'country_iso2', 'locale', 'city'];

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
            attributes: ['id', 'name', 'locale', 'address', 'city', 'country_iso2', 'status']
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

async function getPartnerVendors(req, res) {
    await getNonHealthcarePartners(req, res, 'vendor');
}

async function getPartnerWholesalers(req, res) {
    await getNonHealthcarePartners(req, res, 'wholesaler');
}

async function getNonHealthcarePartner(req, res) {
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

        const { request_id, type, country_iso2, locale, requestor_first_name, requestor_last_name, purchasing_org, company_code, requestor_email, procurement_contact, name, registration_number, address, city, post_code, telephone, invoice_contact_name, invoice_address, invoice_city, invoice_post_code, invoice_email, invoice_telephone, commercial_contact_name, commercial_address, commercial_city, commercial_post_code, commercial_email, commercial_telephone, ordering_contact_name, ordering_email, ordering_telephone, iban, bank_name, bank_account_no, currency } = req.body;

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
            request_id, country_iso2, locale, requestor_first_name, requestor_last_name, purchasing_org, company_code, requestor_email, procurement_contact, name, registration_number, address, city, post_code, telephone, invoice_contact_name, invoice_address, invoice_city, invoice_post_code, invoice_email, invoice_telephone, commercial_contact_name, commercial_address, commercial_city, commercial_post_code, commercial_email, commercial_telephone, ordering_contact_name, ordering_email, ordering_telephone, iban, bank_name, bank_account_no, currency
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

        await uploadDucuments(partnerVendor, type, files);

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

async function updatePartnerVendor(req, res) {
    try {
        const files = req.files;

        const { type, country_iso2, locale, requestor_first_name, requestor_last_name, purchasing_org, company_code, requestor_email, procurement_contact, name, registration_number, address, city, post_code, telephone, invoice_contact_name, invoice_address, invoice_city, invoice_post_code, invoice_email, invoice_telephone, commercial_contact_name, commercial_address, commercial_city, commercial_post_code, commercial_email, commercial_telephone, ordering_contact_name, ordering_email, ordering_telephone, iban, bank_name, bank_account_no, currency } = req.body;

        const partner = await PartnerVendors.findOne({
            where: {
                id: req.params.id
            }
        });

        if (!partner) {
            return res.status(404).send('Partner not found.');
        }

        const data = {
            type, country_iso2, locale, requestor_first_name, requestor_last_name, purchasing_org, company_code, requestor_email, procurement_contact, name, registration_number, address, city, post_code, telephone, invoice_contact_name, invoice_address, invoice_city, invoice_post_code, invoice_email, invoice_telephone, commercial_contact_name, commercial_address, commercial_city, commercial_post_code, commercial_email, commercial_telephone, ordering_contact_name, ordering_email, ordering_telephone, iban, bank_name, bank_account_no, currency,
            entity_type: type
        };


        const updated_data = await partner.update(data);

        await uploadDucuments(partner, updated_data.dataValues.entity_type, files);

        delete updated_data.dataValues.created_at;
        delete updated_data.dataValues.updated_at;

        res.json(updated_data);

    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
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
        const entityMap = {
            hcps: 'hcp',
            hcos: 'hco',
            vendors: 'vendor',
            wholesalers: 'wholesaler'
        };
        const entityType = entityMap[req.params.entityType];

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

function getExportData(entityType, partners) {
    if (entityType === 'hcp') return partners.map(partner => ({
        'Id': partner.id,
        'Request Id': partner.request_id,
        'First Name': partner.first_name,
        'Last Name': partner.last_name,
        'Email': partner.email,
        'Phone': partner.telephone,
        'Address': partner.address,
        'City': partner.city,
        'Post code': partner.post_code,
        'Country code': partner.country_iso2,
        'Locale': partner.locale,
        'Type': partner.individual_type,
        'UUID': partner.uuid,
        'Onekey Id': partner.onekey_id,
        'Italian HCP?': partner.is_italian_hcp,
        'Should Report to HCO?': partner.should_report_hco,
        'Beneficiary Category': partner.beneficiary_category,
        'IBAN': partner.iban,
        'Bank Name': partner.bank_name,
        'Bank Account No': partner.bank_account_no,
        'Currency': partner.currency,
        'Created at': (new Date(partner.created_at)).toLocaleDateString('en-GB').replace(/\//g, '.')
    }));

    if (entityType === 'hco') return partners.map(partner => ({
        'Id': partner.id,
        'Request Id': partner.request_id,
        'First Name': partner.first_name,
        'Last Name': partner.last_name,
        'Organization Name': partner.organization_name,
        'Email': partner.email,
        'Phone': partner.telephone,
        'Address': partner.address,
        'City': partner.city,
        'Post code': partner.post_code,
        'Country code': partner.country_iso2,
        'Locale': partner.locale,
        'Registration no./VAT code': partner.registration_number,
        'Type': partner.organization_type,
        'UUID': partner.uuid,
        'Onekey Id': partner.onekey_id,
        'IBAN': partner.iban,
        'Bank Name': partner.bank_name,
        'Bank Account No': partner.bank_account_no,
        'Currency': partner.currency,
        'Created at': (new Date(partner.created_at)).toLocaleDateString('en-GB').replace(/\//g, '.')
    }));

    if (entityType === 'vendor' || entityType === 'wholesaler') return partners.map(partner => ({
        'Id': partner.id,
        'Request Id': partner.request_id,
        'Requestor First Name': partner.requestor_first_name,
        'Requestor Last Name': partner.requestor_last_name,
        'Purchasing Organization': partner.purchasing_org,
        'Company Code': partner.company_code,
        'Requestor Email': partner.requestor_email,
        'Procurement Contact': partner.procurement_contact,
        'Name': partner.name,
        'Registration no./VAT code': partner.registration_number,
        'Address': partner.address,
        'City': partner.city,
        'Post code': partner.post_code,
        'Phone': partner.telephone,
        'Country code': partner.country_iso2,
        'Locale': partner.locale,
        'Invoice Contact Name': partner.invoice_contact_name,
        'Invoice Contact Address': partner.invoice_address,
        'Invoice Contact City': partner.invoice_city,
        'Invoice Contact Post Code': partner.invoice_post_code,
        'Invoice Contact Email': partner.invoice_email,
        'Invoice Contact Phone': partner.invoice_telephone,
        'Commercial Contact Name': partner.commercial_contact_name,
        'Commercial Contact Address': partner.commercial_address,
        'Commercial Contact City': partner.commercial_city,
        'Commercial Contact Post Code': partner.commercial_post_code,
        'Commercial Contact Email': partner.commercial_email,
        'Commercial Contact Phone': partner.commercial_telephone,
        'Ordering Contact Name': partner.ordering_contact_name,
        'Ordering Contact Email': partner.ordering_email,
        'Ordering Contact Phone': partner.ordering_telephone,
        'IBAN': partner.iban,
        'Bank Name': partner.bank_name,
        'Bank Account No': partner.bank_account_no,
        'Currency': partner.currency,
        'Created at': (new Date(partner.created_at)).toLocaleDateString('en-GB').replace(/\//g, '.')
    }));
}

async function exportApprovedPartners(req, res) {
    try {
        const entityMap = {
            hcps: 'hcp',
            hcos: 'hco',
            vendors: 'vendor',
            wholesalers: 'wholesaler'
        };

        const entityType = entityMap[req.params.entityType];

        if (!entityType) return res.status(404).send(`No ${req.params.entityType} partners found`);

        const PartnerModel = entityType === 'hcp' || entityType === 'hco'
            ? Partner
            : PartnerVendors;

        const partners = await PartnerModel.findAll({
            where: {
                entity_type: entityType,
                status: 'approved'
            }
        });

        if (!partners || !partners.length) return res.status(404).send(`No approved ${entityType} partners found.`);

        const data = getExportData(entityType, partners);

        const sheetNames = {
            hcp: 'HCP Partners',
            hco: 'HCO Partners',
            vendor: 'Vendor Partners',
            wholesaler: 'Wholesaler Partners'
        };

        const sheetName = sheetNames[entityType];
        const fileBuffer = ExportService.exportDataToExcel(data, sheetName);

        res.writeHead(200, {
            'Content-Disposition': `attachment;filename=${sheetNames[entityType].replace(' ', '_')}.xlsx`,
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        res.end(fileBuffer);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
}

async function getPartnerById(req, res) {

    try {
        let excludedFields = [];
        const entityType = req.params.entityType;

        if (entityType === 'hcp') { excludedFields = ['entity_type', 'organization_name', 'organization_type', 'created_at', 'updated_at'] }
        else if (entityType === 'hco') { excludedFields = ['entity_type', 'is_italian_hcp', 'should_report_hco', 'beneficiary_category', 'created_at', 'updated_at'] }
        else if (entityType === 'vendor' || 'wholesaler') { excludedFields = ['entity_type', 'created_at', 'updated_at'] }
        else { res.status(404).send(`The ${entityType} does not exist`); }

        let partner = null;
        if (entityType === 'hcp' || entityType === 'hco') {
            partner = await Partner.findOne({
                where: { id: req.params.id },
                attributes: { exclude: excludedFields }
            });
        } else {
            partner = await PartnerVendors.findOne({
                where: { id: req.params.id },
                attributes: { exclude: excludedFields }
            });
        }

        if (!partner) return res.status(404).send('The partner does not exist');

        partner.dataValues.type = partner.dataValues.individual_type;
        delete partner.dataValues.individual_type;

        const documents = await File.findAll({ where: { owner_id: partner.id } });

        partner.dataValues.documents = documents.map(d => ({
            name: d.dataValues.name,
            id: d.dataValues.id
        }));

        res.json(partner);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
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
exports.getPartnerWholesalers = getPartnerWholesalers;
exports.getNonHealthcarePartner = getNonHealthcarePartner;
exports.createPartnerVendor = createPartnerVendor;
exports.updatePartnerVendor = updatePartnerVendor;
exports.getDownloadUrl = getDownloadUrl;
exports.registrationLookup = registrationLookup;
exports.approvePartner = approvePartner;
exports.exportApprovedPartners = exportApprovedPartners;
exports.getPartnerById = getPartnerById;

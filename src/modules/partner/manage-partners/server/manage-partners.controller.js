const path = require('path');
const { Op, QueryTypes } = require('sequelize');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const Country = require(path.join(process.cwd(), 'src/modules/core/server/country/country.model'));
const Application = require(path.join(process.cwd(), 'src/modules/platform/application/server/application.model'));
const Partners = require('./partner.model');
const PartnerVendors = require('./partner-vendor.model');
const { Response, CustomError } = require(path.join(process.cwd(), 'src/modules/core/server/response'));
const PartnerRequest = require(path.join(process.cwd(), 'src/modules/partner/manage-requests/server/partner-request.model'));
const Consent = require(path.join(process.cwd(), 'src/modules/privacy/manage-consent/server/consent.model'));
const ConsentLocale = require(path.join(process.cwd(), 'src/modules/privacy/manage-consent/server/consent-locale.model'));
const ConsentCountry = require(path.join(process.cwd(), 'src/modules/privacy/consent-country/server/consent-country.model'));
const PartnerConsent = require(path.join(process.cwd(), 'src/modules/partner/manage-partners/server/partner-consents.model'));
const storageService = require(path.join(process.cwd(), 'src/modules/core/server/storage/storage.service'));
const File = require(path.join(process.cwd(), 'src/modules/core/server/storage/file.model'));
const ExportService = require(path.join(process.cwd(), 'src/modules/core/server/export/export.service'));
const logger = require(path.join(process.cwd(), 'src/config/server/lib/winston'));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));
const auditService = require(path.join(process.cwd(), 'src/modules/core/server/audit/audit.service'));

async function uploadDucuments(owner, type, files = []) {
    const bucketName = nodecache.getValue('S3_BUCKET_NAME');
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

async function removeDocuments(fileKeys) {
    const deleteParam = {
        Bucket: nodecache.getValue('S3_BUCKET_NAME'),
        Delete: {
            Objects: fileKeys.map((key) => ({ Key: key }))
        }
    };
    await storageService.deleteFiles(deleteParam);

    await File.destroy({ where: { key: fileKeys } });
}

async function getPartners(req, res) {
    try {
        const type = req.query.type;
        if (!type) return res.status(400).send('type not specified');

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

        const hcpPartners = await Partners.findAll({
            where: { entity_type: type },
            offset,
            limit,
            order,
            attributes: ['id', 'onekey_id', 'uuid', 'first_name', 'last_name', 'address', 'city', 'country_iso2', 'locale', 'status']
        });

        const total = await Partners.count({ where: { entity_type: type }, });

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
        logger.error(err);
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
        logger.error(err);
        res.status(500).send('Internal server error');
    }
}

async function getPartnerHcp(req, res) {
    try {
        const partnerHcp = await Partners.findOne({
            where: { id: req.params.id },
            attributes: { exclude: ['organization_name', 'organization_type'] }
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
        logger.error(err);
        res.status(500).send('Internal server error');
    }
}

async function createPartner(req, res) {
    const response = new Response({}, []);
    try {
        const files = req.files;

        const { type, request_id, first_name, last_name, organization_name, address, city, post_code, email, telephone, country_iso2, locale, registration_number, uuid, individual_type, organization_type, is_italian_hcp, should_report_hco, beneficiary_category, iban, bank_name, bank_account_no, currency, swift_code, routing } = req.body;

        const entityType = type;

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

        if (partnerRequest && partnerRequest.status !== 'email_sent') {
            response.errors.push(new CustomError('Invalid partner request status.', 400));
            return res.status(400).send(response);
        }

        const data = {
            request_id, first_name, last_name, address, city, post_code, email, telephone, country_iso2, locale, registration_number, uuid, is_italian_hcp, should_report_hco, iban, bank_name, bank_account_no, currency, swift_code, routing
        };

        data.entity_type = entityType;
        if (entityType === 'hcp') {
            data.individual_type = individual_type;
            data.beneficiary_category = beneficiary_category;
        }

        if (entityType === 'hco') {
            data.organization_type = organization_type;
            data.organization_name = organization_name;
        }
        data.onekey_id = partnerRequest.onekey_id;

        const countries = await Country.findAll({
            order: [
                ['codbase_desc', 'ASC'],
                ['countryname', 'ASC']
            ]
        });

        let hasDoubleOptIn = false;
        let consentArr = [];

        const consents = JSON.parse('[' + (req.body.consents || '') + ']');

        if (consents && consents.length) {
            await Promise.all(consents.map(async consent => {
                const consentId = Object.keys(consent)[0];
                const consentResponse = Object.values(consent)[0];
                const language_code = locale.split('_')[0];
                let richTextLocale = `${language_code}_${country_iso2.toUpperCase()}`;

                if (!consentResponse) return;

                const consentDetails = await Consent.findOne({ where: { id: consentId } });

                if (!consentDetails) {
                    response.errors.push(new CustomError('Invalid consents.', 400));
                    return;
                };

                const currentCountry = countries.find(c => c.country_iso2.toLowerCase() === country_iso2.toLowerCase());

                const baseCountry = countries.find(c => c.countryname === currentCountry.codbase_desc);

                const consentCountry = await ConsentCountry.findOne({
                    where: {
                        country_iso2: {
                            [Op.iLike]: baseCountry.country_iso2
                        },
                        consent_id: consentDetails.id
                    }
                });

                if (!consentCountry) {
                    response.errors.push(new CustomError('Invalid consent country.', 400));
                    return;
                }

                let consentLocale = await ConsentLocale.findOne({
                    where: {
                        consent_id: consentId,
                        locale: { [Op.iLike]: `${language_code}_${country_iso2}` }
                    }
                });

                if (!consentLocale) {
                    const codbaseCountry = countries.filter(c => c.country_iso2.toLowerCase() === country_iso2.toLowerCase());

                    const localeUsingParentCountryISO = `${language_code}_${(codbaseCountry[0].country_iso2 || '').toUpperCase()}`;

                    consentLocale = await ConsentLocale.findOne({
                        where: {
                            consent_id: consentId,
                            locale: { [Op.iLike]: localeUsingParentCountryISO }
                        }
                    });

                    richTextLocale = localeUsingParentCountryISO;
                }

                if (!consentLocale) {
                    response.errors.push(new CustomError('Invalid consent locale.', 400));
                    return;
                }

                if (consentCountry.opt_type === 'double-opt-in') {
                    hasDoubleOptIn = true;
                }

                consentArr.push({
                    consent_id: consentDetails.id,
                    consent_confirmed: hasDoubleOptIn ? false : true,
                    opt_type: consentCountry.opt_type,
                    rich_text: validator.unescape(consentLocale.rich_text),
                    consent_locale: richTextLocale,
                    created_by: req.user.id,
                    updated_by: req.user.id
                });
            }));
        }

        const [partnerHcx, created] = await Partners.findOrCreate({
            where: { request_id: request_id },
            defaults: data
        });

        if (!created) {
            response.errors.push(new CustomError('Partner HCP with Request ID/Email already exists.', 400));
            return res.status(400).send(response);
        }

        await partnerRequest.update({ status: 'request_processed' });

        await uploadDucuments(partnerHcx, entityType, files);

        if (consentArr.length) {
            consentArr = consentArr.map(c => {
                c.user_id = partnerHcx.id
                return c;
            });
            await PartnerConsent.bulkCreate(consentArr, {
                returning: true,
                ignoreDuplicates: false
            });
        }

        partnerHcx.dataValues.type = partnerHcx.dataValues.individual_type;

        if (entityType === 'hcp') {
            delete partnerHcx.dataValues.organization_name;
            delete partnerHcx.dataValues.organization_type;
        }

        if (entityType === 'hco') {
            delete partnerHcx.dataValues.individual_type;
            delete partnerHcx.dataValues.is_italian_hcp;
            delete partnerHcx.dataValues.should_report_hco;
            delete partnerHcx.dataValues.beneficiary_category;
        }

        partnerHcx.dataValues.type = partnerHcx.dataValues.entity_type;
        delete partnerHcx.dataValues.entity_type;
        delete partnerHcx.dataValues.created_at;
        delete partnerHcx.dataValues.updated_at;
        delete partnerHcx.dataValues.onekey_id;

        response.data = partnerHcx;
        res.json(response);

    } catch (err) {
        logger.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

async function updatePartner(req, res) {
    const response = new Response({}, []);
    try {
        const files = req.files;

        const { type, first_name, last_name, organization_name, address, city, post_code, email, telephone, individual_type, organization_type, country_iso2, locale, registration_number, uuid, is_italian_hcp, should_report_hco, beneficiary_category, iban, bank_name, bank_account_no, currency, swift_code, routing, remove_files } = req.body;

        const partner = await Partners.findOne({
            where: {
                id: req.params.id,
                entity_type: type
            }
        });

        if (!partner) {
            response.errors.push(new CustomError('Partner not found.', 400));
            return res.status(400).send(response);
        }

        const countries = await Country.findAll({
            order: [
                ['codbase_desc', 'ASC'],
                ['countryname', 'ASC']
            ]
        });
        let consentArr = [];
        const consents = JSON.parse('[' + (req.body.consents || '') + ']');

        if (consents && consents.length) {
            await Promise.all(consents.map(async x => {
                const consentId = Object.keys(x)[0];
                const consentResponse = Object.values(x)[0];

                const partnerConsent = await PartnerConsent.findOne({ where: { user_id: partner.id, consent_id: consentId } });

                if (partnerConsent) {
                    await partnerConsent.update({
                        opt_type: consentResponse ? 'single-opt-in' : 'opt-out',
                        consent_confirmed: consentResponse
                    });
                } else {
                    const language_code = locale.split('_')[0];
                    let richTextLocale = `${language_code}_${country_iso2.toUpperCase()}`;

                    if (!consentResponse) return;

                    const consentDetails = await Consent.findOne({ where: { id: consentId } });

                    if (!consentDetails) {
                        response.errors.push(new CustomError('Invalid consents.', 400));
                        return;
                    };

                    const currentCountry = countries.find(c => c.country_iso2.toLowerCase() === country_iso2.toLowerCase());

                    const baseCountry = countries.find(c => c.countryname === currentCountry.codbase_desc);

                    const consentCountry = await ConsentCountry.findOne({
                        where: {
                            country_iso2: {
                                [Op.iLike]: baseCountry.country_iso2
                            },
                            consent_id: consentDetails.id
                        }
                    });

                    if (!consentCountry) {
                        response.errors.push(new CustomError('Invalid consent country.', 400));
                        return;
                    }

                    let consentLocale = await ConsentLocale.findOne({
                        where: {
                            consent_id: consentId,
                            locale: { [Op.iLike]: `${language_code}_${country_iso2}` }
                        }
                    });

                    if (!consentLocale) {
                        const codbaseCountry = countries.filter(c => c.country_iso2.toLowerCase() === country_iso2.toLowerCase());

                        const localeUsingParentCountryISO = `${language_code}_${(codbaseCountry[0].country_iso2 || '').toUpperCase()}`;

                        consentLocale = await ConsentLocale.findOne({
                            where: {
                                consent_id: consentId,
                                locale: { [Op.iLike]: localeUsingParentCountryISO }
                            }
                        });

                        richTextLocale = localeUsingParentCountryISO;
                    }

                    if (!consentLocale) {
                        response.errors.push(new CustomError('Invalid consent locale.', 400));
                        return;
                    }

                    consentArr.push({
                        consent_id: consentDetails.id,
                        consent_confirmed: true,
                        opt_type: consentCountry.opt_type,
                        rich_text: validator.unescape(consentLocale.rich_text),
                        consent_locale: richTextLocale,
                        created_by: req.user.id,
                        updated_by: req.user.id
                    });
                }
            }));
        }

        const data = {
            first_name, last_name, address, city, post_code, email, telephone, country_iso2, locale, registration_number, uuid, iban, bank_name, bank_account_no, currency, swift_code, routing
        };

        if (partner.dataValues.entity_type === 'hcp') {
            data.individual_type = individual_type;
            data.is_italian_hcp = is_italian_hcp;
            data.should_report_hco = should_report_hco;
            data.beneficiary_category = beneficiary_category;
        }

        if (partner.dataValues.entity_type === 'hco') {
            data.organization_name = organization_name;
            data.organization_type = organization_type;
        }

        if (remove_files) {
            const documents = await File.findAll({ where: { table_name: 'partners', owner_id: req.params.id } });
            fileIds = documents.map(function (obj) {
                return obj.id;
            });

            function fileExists(mainArr, subArr) {
                return subArr.every(i => mainArr.includes(i));
            }

            let files = null;
            (typeof remove_files === 'string') ? files = [remove_files] : files = remove_files;

            const check = fileExists(fileIds, files);
            if (!check) {
                response.errors.push(new CustomError('File does not exist', 404));
                return res.status(404).send(response);
            }

            let file_keys = [];

            files.forEach(element => {
                file_keys.push(documents.find(x => x.id === element).key);
            });

            await removeDocuments(file_keys);

        }

        const updated_data = await partner.update(data);

        await uploadDucuments(partner, updated_data.dataValues.entity_type, files);

        if (consentArr.length) {
            consentArr = consentArr.map(c => {
                c.user_id = updated_data.id
                return c;
            });
            await PartnerConsent.bulkCreate(consentArr, {
                returning: true,
                ignoreDuplicates: false
            });
        }

        delete updated_data.dataValues.created_at;
        delete updated_data.dataValues.updated_at;
        delete updated_data.dataValues.onekey_id;
        if (type === 'hcp') {
            delete updated_data.dataValues.organization_name;
            delete updated_data.dataValues.organization_type;
        }
        if (type === 'hco') {
            delete updated_data.dataValues.individual_type;
            delete updated_data.dataValues.is_italian_hcp;
            delete updated_data.dataValues.should_report_hco;
            delete updated_data.dataValues.beneficiary_category;
        }

        response.data = updated_data;
        res.json(response);

    } catch (err) {
        logger.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

async function getPartnerHco(req, res) {
    try {
        const partnerHco = await Partners.findOne({
            where: { id: req.params.id },
            attributes: { exclude: ['is_italian_hcp', 'should_report_hco', 'beneficiary_category'] }
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
        logger.error(err);
        res.status(500).send('Internal server error');
    }
}

async function getNonHealthcarePartners(req, res, type) {
    try {
        const page = req.query.page ? +req.query.page - 1 : 0;
        const limit = req.query.limit ? +req.query.limit : 15;
        const status = req.query.status;
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
        const filterLitaral = status ? { entity_type: type, status : status} : { entity_type: type };
        const partnerVendors = await PartnerVendors.findAll({
            where: filterLitaral,
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
        logger.error(err);
        res.status(500).send('Internal server error');
    }
}
async function getPartnerApproval(req, res){
     try {
        const page = req.query.page ? +req.query.page - 1 : 0;
        const limit = req.query.limit ? +req.query.limit : 15;
        const status = req.query.status;
        const offset = page * limit;

        const hcpPartners = await Partners.findAll({
            where: { status: status },
            offset,
            limit,
            order: [
               ['created_at', 'DESC']
            ],
            attributes: ['id', 'first_name', 'last_name', 'address','locale', 'email', 'created_at', 'entity_type' ]
        });

        const totalHcpPartner = await Partners.count({ where: { status: status } });

        const partnerVendors = await PartnerVendors.findAll({
            where: { status : status } ,
            offset,
            limit,
            order: [
               ['created_at', 'DESC']
            ],
            attributes: ['id', 'name', 'locale', 'address', ['ordering_email', 'email'],'created_at','entity_type']
        });

        const totalVendors = await PartnerVendors.count({ where: { status: status } });
        const partners = hcpPartners.concat(partnerVendors);

        const totalPartners = totalHcpPartner + totalVendors;

        const responseData = {
            partners: partners.slice(0,5),
            totalPartners,

        };
        res.json(responseData);

    }
    catch (err) {
        logger.error(err);
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
            where: { id: req.params.id }
        });

        if (!partnerVendor) return res.status(404).send('The partner does not exist');

        const documents = await File.findAll({ where: { owner_id: partnerVendor.id } });

        partnerVendor.dataValues.documents = documents.map(d => ({
            name: d.dataValues.name,
            id: d.dataValues.id
        }));

        res.json(partnerVendor);
    } catch (err) {
        logger.error(err);
        res.status(500).send('Internal server error');
    }
}

async function createPartnerVendor(req, res) {
    const response = new Response({}, []);
    try {
        const files = req.files;

        const { request_id, type, country_iso2, locale, requestor_first_name, requestor_last_name, purchasing_org, company_code, requestor_email, procurement_contact, name, registration_number, address, city, post_code, telephone, invoice_contact_name, invoice_address, invoice_city, invoice_post_code, invoice_email, invoice_telephone, commercial_contact_name, commercial_address, commercial_city, commercial_post_code, commercial_email, commercial_telephone, ordering_contact_name, ordering_email, ordering_telephone, iban, bank_name, bank_account_no, currency, swift_code, routing } = req.body;

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

        if (partnerRequest && partnerRequest.status !== 'email_sent') {
            response.errors.push(new CustomError('Invalid partner request status.', 400));
            return res.status(404).send(response);
        }

        const data = {
            request_id, country_iso2, locale, requestor_first_name, requestor_last_name, purchasing_org, company_code, requestor_email, procurement_contact, name, registration_number, address, city, post_code, telephone, invoice_contact_name, invoice_address, invoice_city, invoice_post_code, invoice_email, invoice_telephone, commercial_contact_name, commercial_address, commercial_city, commercial_post_code, commercial_email, commercial_telephone, ordering_contact_name, ordering_email, ordering_telephone, iban, bank_name, bank_account_no, currency, swift_code, routing
        };

        data.entity_type = type;

        const countries = await Country.findAll({
            order: [
                ['codbase_desc', 'ASC'],
                ['countryname', 'ASC']
            ]
        });

        let hasDoubleOptIn = false;
        let consentArr = [];

        const consents = JSON.parse('[' + (req.body.consents || '') + ']');

        if (consents && consents.length) {
            await Promise.all(consents.map(async consent => {
                const consentId = Object.keys(consent)[0];
                const consentResponse = Object.values(consent)[0];
                const language_code = locale.split('_')[0];
                let richTextLocale = `${language_code}_${country_iso2.toUpperCase()}`;

                if (!consentResponse) return;

                const consentDetails = await Consent.findOne({ where: { id: consentId } });

                if (!consentDetails) {
                    response.errors.push(new CustomError('Invalid consents.', 400));
                    return;
                };

                const currentCountry = countries.find(c => c.country_iso2.toLowerCase() === country_iso2.toLowerCase());

                const baseCountry = countries.find(c => c.countryname === currentCountry.codbase_desc);

                const consentCountry = await ConsentCountry.findOne({
                    where: {
                        country_iso2: {
                            [Op.iLike]: baseCountry.country_iso2
                        },
                        consent_id: consentDetails.id
                    }
                });

                if (!consentCountry) {
                    response.errors.push(new CustomError('Invalid consent country.', 400));
                    return;
                }

                let consentLocale = await ConsentLocale.findOne({
                    where: {
                        consent_id: consentId,
                        locale: { [Op.iLike]: `${language_code}_${country_iso2}` }
                    }
                });

                if (!consentLocale) {
                    const codbaseCountry = countries.filter(c => c.country_iso2.toLowerCase() === country_iso2.toLowerCase());

                    const localeUsingParentCountryISO = `${language_code}_${(codbaseCountry[0].country_iso2 || '').toUpperCase()}`;

                    consentLocale = await ConsentLocale.findOne({
                        where: {
                            consent_id: consentId,
                            locale: { [Op.iLike]: localeUsingParentCountryISO }
                        }
                    });

                    richTextLocale = localeUsingParentCountryISO;
                }

                if (!consentLocale) {
                    response.errors.push(new CustomError('Invalid consent locale.', 400));
                    return;
                }

                if (consentCountry.opt_type === 'double-opt-in') {
                    hasDoubleOptIn = true;
                }

                consentArr.push({
                    consent_id: consentDetails.id,
                    consent_confirmed: hasDoubleOptIn ? false : true,
                    opt_type: consentCountry.opt_type,
                    rich_text: validator.unescape(consentLocale.rich_text),
                    consent_locale: richTextLocale,
                    created_by: req.user.id,
                    updated_by: req.user.id
                });
            }));
        }

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

        await partnerRequest.update({ status: 'request_processed' });

        await uploadDucuments(partnerVendor, type, files);

        if (consentArr.length) {
            consentArr = consentArr.map(c => {
                c.user_id = partnerVendor.id
                return c;
            });
            await PartnerConsent.bulkCreate(consentArr, {
                returning: true,
                ignoreDuplicates: false
            });
        }

        delete partnerVendor.dataValues.created_at;
        delete partnerVendor.dataValues.updated_at;

        response.data = partnerVendor;
        res.json(response);

    } catch (err) {
        logger.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

async function updatePartnerVendor(req, res) {
    const response = new Response({}, []);
    try {
        const files = req.files;

        const { type, country_iso2, locale, requestor_first_name, requestor_last_name, purchasing_org, company_code, requestor_email, procurement_contact, name, registration_number, address, city, post_code, telephone, invoice_contact_name, invoice_address, invoice_city, invoice_post_code, invoice_email, invoice_telephone, commercial_contact_name, commercial_address, commercial_city, commercial_post_code, commercial_email, commercial_telephone, ordering_contact_name, ordering_email, ordering_telephone, iban, bank_name, bank_account_no, currency, swift_code, routing, remove_files } = req.body;

        const partner = await PartnerVendors.findOne({
            where: {
                id: req.params.id,
                entity_type: type
            }
        });

        if (!partner) {
            response.errors.push(new CustomError('Partner not found.', 400));
            return res.status(400).send(response);
        }

        const countries = await Country.findAll({
            order: [
                ['codbase_desc', 'ASC'],
                ['countryname', 'ASC']
            ]
        });
        let consentArr = [];
        const consents = JSON.parse('[' + (req.body.consents || '') + ']');

        if (consents && consents.length) {
            await Promise.all(consents.map(async x => {
                const consentId = Object.keys(x)[0];
                const consentResponse = Object.values(x)[0];

                const partnerConsent = await PartnerConsent.findOne({ where: { user_id: partner.id, consent_id: consentId } });

                if (partnerConsent) {
                    await partnerConsent.update({
                        opt_type: consentResponse ? 'single-opt-in' : 'opt-out',
                        consent_confirmed: consentResponse
                    });
                } else {
                    const language_code = locale.split('_')[0];
                    let richTextLocale = `${language_code}_${country_iso2.toUpperCase()}`;

                    if (!consentResponse) return;

                    const consentDetails = await Consent.findOne({ where: { id: consentId } });

                    if (!consentDetails) {
                        response.errors.push(new CustomError('Invalid consents.', 400));
                        return;
                    };

                    const currentCountry = countries.find(c => c.country_iso2.toLowerCase() === country_iso2.toLowerCase());

                    const baseCountry = countries.find(c => c.countryname === currentCountry.codbase_desc);

                    const consentCountry = await ConsentCountry.findOne({
                        where: {
                            country_iso2: {
                                [Op.iLike]: baseCountry.country_iso2
                            },
                            consent_id: consentDetails.id
                        }
                    });

                    if (!consentCountry) {
                        response.errors.push(new CustomError('Invalid consent country.', 400));
                        return;
                    }

                    let consentLocale = await ConsentLocale.findOne({
                        where: {
                            consent_id: consentId,
                            locale: { [Op.iLike]: `${language_code}_${country_iso2}` }
                        }
                    });

                    if (!consentLocale) {
                        const codbaseCountry = countries.filter(c => c.country_iso2.toLowerCase() === country_iso2.toLowerCase());

                        const localeUsingParentCountryISO = `${language_code}_${(codbaseCountry[0].country_iso2 || '').toUpperCase()}`;

                        consentLocale = await ConsentLocale.findOne({
                            where: {
                                consent_id: consentId,
                                locale: { [Op.iLike]: localeUsingParentCountryISO }
                            }
                        });

                        richTextLocale = localeUsingParentCountryISO;
                    }

                    if (!consentLocale) {
                        response.errors.push(new CustomError('Invalid consent locale.', 400));
                        return;
                    }

                    consentArr.push({
                        consent_id: consentDetails.id,
                        consent_confirmed: true,
                        opt_type: consentCountry.opt_type,
                        rich_text: validator.unescape(consentLocale.rich_text),
                        consent_locale: richTextLocale,
                        created_by: req.user.id,
                        updated_by: req.user.id
                    });
                }
            }));
        }

        const data = {
            type, country_iso2, locale, requestor_first_name, requestor_last_name, purchasing_org, company_code, requestor_email, procurement_contact, name, registration_number, address, city, post_code, telephone, invoice_contact_name, invoice_address, invoice_city, invoice_post_code, invoice_email, invoice_telephone, commercial_contact_name, commercial_address, commercial_city, commercial_post_code, commercial_email, commercial_telephone, ordering_contact_name, ordering_email, ordering_telephone, iban, bank_name, bank_account_no, currency, swift_code, routing,
            entity_type: type
        };

        if (remove_files) {
            const documents = await File.findAll({ where: { table_name: 'partner_vendors', owner_id: req.params.id } });
            fileIds = documents.map(function (obj) {
                return obj.id;
            });

            function fileExists(mainArr, subArr) {
                return subArr.every(i => mainArr.includes(i));
            }

            let files = null;
            (typeof remove_files === 'string') ? files = [remove_files] : files = remove_files;

            const check = fileExists(fileIds, files);
            if (!check) {
                response.errors.push(new CustomError('File does not exist', 404));
                return res.status(404).send(response);
            }

            let file_keys = [];

            files.forEach(element => {
                file_keys.push(documents.find(x => x.id === element).key);
            });

            await removeDocuments(file_keys);

        }

        const updated_data = await partner.update(data);

        await uploadDucuments(partner, updated_data.dataValues.entity_type, files);

        if (consentArr.length) {
            consentArr = consentArr.map(c => {
                c.user_id = updated_data.id
                return c;
            });
            await PartnerConsent.bulkCreate(consentArr, {
                returning: true,
                ignoreDuplicates: false
            });
        }

        delete updated_data.dataValues.created_at;
        delete updated_data.dataValues.updated_at;

        response.data = updated_data;
        res.json(response);

    } catch (err) {
        logger.error(err);
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
        logger.error(error);
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
            ? Partners
            : PartnerVendors;

        const partner = await PartnerModel.findOne({
            where: {
                id: id,
                entity_type: entityType
            }
        });

        if (!partner) return res.status(404).send(`The ${entityType} partner does not exist`);

        if (partner.status !== 'not_approved') return res.status(400).send(`The ${entityType} partner has already been approved`);

        await partner.update({ status: 'approved' });

        res.sendStatus(200);
    } catch (error) {
        logger.error(error);
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
            ? Partners
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
        const fileBuffer = ExportService.exportToExcel(data, sheetName);

        res.writeHead(200, {
            'Content-Disposition': `attachment;filename=${sheetNames[entityType].replace(' ', '_')}.xlsx`,
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        res.end(fileBuffer);
    } catch (error) {
        logger.error(error);
        res.status(500).send('Internal server error');
    }
}


async function getPartnerVendorById(req, res) {
    const response = new Response({}, []);
    try {
        const partnerVendor = await PartnerVendors.findOne({
            where: { id: req.params.id },
            attributes: { exclude: ['entity_type', 'created_at', 'updated_at'] }
        });

        if (!partnerVendor) {
            response.errors.push(new CustomError('The partner does not exist.', 404));
            return res.status(404).send(response);
        }

        partnerVendor.dataValues.type = partnerVendor.dataValues.individual_type;
        delete partnerVendor.dataValues.individual_type;

        const documents = await File.findAll({ where: { owner_id: partnerVendor.id } });

        partnerVendor.dataValues.documents = documents.map(d => ({
            name: d.dataValues.name,
            id: d.dataValues.id
        }));

        const consents = await PartnerConsent.findAll({ where: { user_id: partnerVendor.id } });

        partnerVendor.dataValues.consents = consents.map(c => {
            return {
                rich_text: c.rich_text,
                id: c.id,
                consent_id: c.consnet_id,
                consent_confirmed: c.consent_confirmed,
                opt_type: c.opt_type,
                consent_locale: c.consent_locale
            };
        });

        response.data = partnerVendor;

        res.json(response);
    } catch (err) {
        logger.error(err);
        res.status(500).send('Internal server error');
    }
}

async function getPartnerById(req, res) {
    const response = new Response({}, []);
    try {
        const partner = await Partners.findOne({
            where: { id: req.params.id },
            attributes: { exclude: ['created_at', 'updated_at'] }
        });

        if (!partner) {
            response.errors.push(new CustomError('The partner does not exist.', 404));
            return res.status(404).send(response);
        }

        if (partner.dataValues.entity_type === 'hcp') {
            delete partner.dataValues.organization_name;
            delete partner.dataValues.organization_type;
        }

        if (partner.dataValues.entity_type === 'hco') {
            delete partner.dataValues.individual_type;
            delete partner.dataValues.is_italian_hcp;
            delete partner.dataValues.should_report_hco;
            delete partner.dataValues.beneficiary_category;
        }

        partner.dataValues.type = partner.dataValues.entity_type;
        delete partner.dataValues.entity_type;

        const documents = await File.findAll({ where: { owner_id: partner.id } });

        partner.dataValues.documents = documents.map(d => ({
            name: d.dataValues.name,
            id: d.dataValues.id
        }));

        const consents = await PartnerConsent.findAll({ where: { user_id: partner.id } });

        partner.dataValues.consents = consents.map(c => {
            return {
                rich_text: c.rich_text,
                id: c.id,
                consent_id: c.consnet_id,
                consent_confirmed: c.consent_confirmed,
                opt_type: c.opt_type,
                consent_locale: c.consent_locale
            };
        });

        response.data = partner;
        res.json(response);
    } catch (err) {
        logger.error(err);
        res.status(500).send('Internal server error');
    }
}

async function getPartnerInformation(req, res) {
    const entityType = req.params.entityType;
    if (entityType === 'hcps') {
        return await getPartnerHcp(req, res);
    } else if (entityType === 'hcos') {
        return await getPartnerHco(req, res);
    } else if (entityType === 'vendors' || entityType === 'wholesalers') {
        return await getNonHealthcarePartner(req, res);
    } else {
        return res.status(404).send('The partner does not exist');
    }
}

async function resendForm(req, res) {
    try {
        const { id } = req.params;
        const { reason_for_correction } = req.body;

        const entityMap = {
            hcps: 'hcp',
            hcos: 'hco',
            vendors: 'vendor',
            wholesalers: 'wholesaler'
        };
        const entityType = entityMap[req.params.entityType];

        let partner;
        if (entityType === 'hcp' || entityType === 'hco') {
            partner = await Partners.findOne({ where: { id } })
        } else {
            partner = await PartnerVendors.findOne({ where: { id } })
        }

        if (!partner) return res.status(400).send('Partner not found.');

        const { request_id } = partner.dataValues;
        const partnerRequest = await PartnerRequest.findOne({ where: { id: request_id } });

        if (!partnerRequest) return res.status(400).send('Partner Request not found.');

        const {
            application_id,
            first_name,
            last_name,
            email,
            entity_type,
            country_iso2,
            locale
        } = partnerRequest.dataValues;

        const userApplication = await Application.findOne({ where: { id: application_id } });
        const jwt_token = jwt.sign({
            partner_id: id,
            status: 'update'
        }, userApplication.auth_secret, {
            expiresIn: '1h'
        });

        const payload = {
            jwt_token,
            first_name,
            last_name,
            email,
            partner_type: entity_type ? entity_type.toLowerCase() : undefined,
            country_iso2: country_iso2.toLowerCase(),
            locale: locale
        };

        const metaData = await Application.findAll({
            where: { id: application_id },
            attributes: ['metadata']
        });

        const resendFormLink = metaData[0].dataValues.metadata.request_notification_link;

        await axios.post(resendFormLink, payload);

        await partner.update({ status: 'correction_pending' });

        await auditService.log({
            event_type: 'UPDATE',
            object_id: partner.id,
            table_name: (entityType === 'hcp' || entityType === 'hco') ? 'partners' : 'partner_vendors',
            actor: req.user.id,
            remarks: reason_for_correction
        });

        res.json('Form resent successfully.');
    } catch (err) {
        logger.error(err);
        res.status(500).send('Internal server error');
    }
}

exports.getPartners = getPartners;
exports.getPartnerById = getPartnerById;
exports.createPartner = createPartner;
exports.updatePartner = updatePartner;

exports.getPartnerVendors = getPartnerVendors;
exports.getPartnerVendorById = getPartnerVendorById;
exports.getPartnerWholesalers = getPartnerWholesalers;
exports.createPartnerVendor = createPartnerVendor;
exports.updatePartnerVendor = updatePartnerVendor;
exports.getPartnerApproval = getPartnerApproval;

exports.getDownloadUrl = getDownloadUrl;
exports.registrationLookup = registrationLookup;
exports.approvePartner = approvePartner;
exports.exportApprovedPartners = exportApprovedPartners;
exports.getPartnerInformation = getPartnerInformation;
exports.resendForm = resendForm;

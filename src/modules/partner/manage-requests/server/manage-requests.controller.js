const path = require('path');
const PartnerRequest = require('./partner-request.model');
const Application = require('./../../../platform/application/server/application.model');
const { Op } = require('sequelize');
const ArchiveService = require(path.join(process.cwd(), 'src/modules/core/server/archive/archive.service.js'));
const logService = require(path.join(process.cwd(), 'src/modules/core/server/audit/audit.service'));
const jwt = require('jsonwebtoken');
const axios = require('axios');

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
        const {
            entity_type,
            first_name,
            last_name,
            email,
            mdr_id,
            country_iso2,
            language,
            uuid,
            is_supplier,
            is_customer,
            procurement_contact,
            company_codes,
            partner_type,
            workplace_name,
            workplace_type,
            specialty,
            iqvia_wholesaler_id,
        } = req.body;

        const application = await Application.findOne({ where: { email: 'patients-organization@glpg.com' } });

        const data = {
            entity_type,
            application_id: application.id,
            first_name,
            last_name,
            email,
            mdr_id,
            country_iso2,
            locale: language.toLowerCase() + "_" + country_iso2.toUpperCase(),
            created_by: req.user.id,
            updated_by: req.user.id,
        };

        if (entity_type === 'hcp') {
            data.uuid = uuid;
            data.is_supplier = is_supplier;
            data.is_customer = is_customer;
            data.procurement_contact = procurement_contact;
            data.partner_type = partner_type;
            data.company_codes = company_codes;
        }
        else if (entity_type === 'hco') {
            data.uuid = uuid;
            data.workplace_name = workplace_name;
            data.workplace_type = workplace_type;
            data.procurement_contact = procurement_contact;
            data.specialty = specialty;
        }
        else if (entity_type === 'vendor') {
            data.procurement_contact = procurement_contact;
            data.partner_type = partner_type;
            data.company_codes = company_codes;
        }
        else if (entity_type === 'wholesaler') {
            data.iqvia_wholesaler_id = iqvia_wholesaler_id;
            data.procurement_contact = procurement_contact;
            data.partner_type = partner_type;
            data.company_codes = company_codes;
        }

        const [user, created] = await PartnerRequest.findOrCreate({
            where: { entity_type, email: email.toLowerCase() },
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

async function sendForm(req, res) {
    try {
        const {
            id,
            application_id,
            first_name,
            last_name,
            email,
            partner_type,
            country_iso2,
            locale
        } = req.body;

        const userApplication = await Application.findOne({ where: { id: application_id } });
        const jwt_token = jwt.sign({
            request_id: id
        }, userApplication.auth_secret, {
            expiresIn: '1h'
        });

        const payload = {
            jwt_token,
            first_name,
            last_name,
            email,
            partner_type: partner_type.toLowerCase(),
            country_iso2: country_iso2.toLowerCase(),
            locale: locale
        };

        const metaData = await Application.findAll({
            where: { id: application_id },
            attributes: ['metadata']
        });

        const sendFormLink = JSON.parse(metaData[0].dataValues.metadata).request_notification_link;

        await axios.post(sendFormLink, payload);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function updatePartnerRequest(req, res) {
    try {
        const {
            entity_type,
            first_name,
            last_name,
            email,
            mdr_id,
            country_iso2,
            language,
            uuid,
            is_supplier,
            is_customer,
            procurement_contact,
            company_codes,
            partner_type,
            workplace_name,
            workplace_type,
            specialty,
            iqvia_wholesaler_id,
        } = req.body;

        const partnerRequest = await PartnerRequest.findOne({ where: { id: req.params.id } });
        if (!partnerRequest) return res.status(404).send('The partner request does not exist');

        const isEmailExists = await PartnerRequest.findOne({
            where: {
                id: { [Op.not]: req.params.id },
                entity_type,
                email: email.toLowerCase()
            }
        });

        if (isEmailExists) return res.status(400).send('The Email already exists.');

        const data = {
            first_name,
            last_name,
            email,
            mdr_id,
            country_iso2,
            locale: language.toLowerCase() + "_" + country_iso2.toUpperCase(),
            updated_by: req.user.id
        };

        if (entity_type === 'hcp') {
            data.uuid = uuid;
            data.is_supplier = is_supplier;
            data.is_customer = is_customer;
            data.procurement_contact = procurement_contact;
            data.company_codes = company_codes;
            data.partner_type = partner_type;
        }
        else if (entity_type === 'hco') {
            data.uuid = uuid;
            data.workplace_name = workplace_name;
            data.workplace_type = workplace_type;
            data.specialty = specialty;
        }
        else if (entity_type === 'vendor') {
            data.procurement_contact = procurement_contact;
            data.company_codes = company_codes;
            data.partner_type = partner_type;
        }
        else if (entity_type === 'wholesaler') {
            data.iqvia_wholesaler_id = iqvia_wholesaler_id;
            data.procurement_contact = procurement_contact;
            data.company_codes = company_codes;
            data.partner_type = partner_type;
        }

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

        const archive = await ArchiveService.archiveData({
            object_id: partnerRequest.id,
            table_name: 'partner_requests',
            data: JSON.stringify(partnerRequest.dataValues),
            actor: req.user.id
        });

        await logService.log({
            event_type: 'CREATE',
            object_id: archive.id,
            table_name: 'archive',
            actor: req.user.id
        });

        await logService.log({
            event_type: 'CREATE',
            object_id: partnerRequest.id,
            table_name: 'partner_requests',
            actor: req.user.id
        });


        await partnerRequest.destroy();

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
exports.sendForm = sendForm;

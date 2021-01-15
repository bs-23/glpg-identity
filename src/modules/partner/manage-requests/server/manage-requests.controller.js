const path = require('path');
const PartnerRequest = require('./partner-request.model');
const Application = require('./../../../platform/application/server/application.model');
const HcpPartner = require('../../manage-partners/server/partner-hcp.model');
const HcoPartner = require('../../manage-partners/server/partner-hco.model');
const { QueryTypes, Op } = require('sequelize');
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));
const { Response, CustomError } = require(path.join(process.cwd(), 'src/modules/core/server/response'));
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
            procurement_contact,
            company_codes,
            uuid,
            partner_type,
            country_iso2,
            language,
        } = req.body;

        const companyCodes = company_codes && Array.isArray(company_codes)
            ? company_codes.filter(cb => 'string' === typeof cb)
            : null;

        if (!companyCodes || !companyCodes.length) return res.status(400).send('Invalid Company Codes.');

        const application = await Application.findOne({ where: { email: 'patients-organization@glpg.com'} });

        const data = {
            entity_type,
            first_name,
            last_name,
            email,
            procurement_contact,
            partner_type,
            company_codes: companyCodes,
            application_id: application.id,
            country_iso2,
            language,
        };

        if (entity_type === 'hcp' || entity_type === 'hco') data.uuid = uuid;

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
            language
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
            locale: `${language}_${country_iso2.toUpperCase()}`
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
            procurement_contact,
            company_codes,
            uuid,
            partner_type,
            country_iso2,
            language,
            status
        } = req.body;

        const companyCodes = company_codes && Array.isArray(company_codes)
            ? company_codes.filter(cb => 'string' === typeof cb)
            : null;

        if (!companyCodes || !companyCodes.length) return res.status(400).send('Invalid Company Codes.');

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
            procurement_contact,
            partner_type,
            company_codes: companyCodes,
            country_iso2,
            language,
            status
        };

        if (entity_type === 'hcp' || entity_type === 'hco') data.uuid = uuid;

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

exports.getPartnerRequests = getPartnerRequests;
exports.createPartnerRequest = createPartnerRequest;
exports.getPartnerRequest = getPartnerRequest;
exports.updatePartnerRequest = updatePartnerRequest;
exports.deletePartnerRequest = deletePartnerRequest;
exports.sendForm = sendForm;

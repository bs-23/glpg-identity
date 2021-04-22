const path = require('path');
const fs = require('fs');
const { QueryTypes, Op } = require('sequelize');

const Country = require(path.join(process.cwd(), 'src/modules/core/server/country/country.model'));
const Consent = require(path.join(process.cwd(), 'src/modules/privacy/manage-consent/server/consent.model'));
const ConsentCountry = require(path.join(process.cwd(), 'src/modules/privacy/consent-country/server/consent-country.model'));
const ConsentCategory = require(path.join(process.cwd(), 'src/modules/privacy/consent-category/server/consent-category.model'));
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const HCPS = require(path.join(process.cwd(), 'src/modules/information/hcp/server/hcp-profile.model'));
const HcpConsents = require(path.join(process.cwd(), 'src/modules/information/hcp/server/hcp-consents.model'));
const { Response, CustomError } = require(path.join(process.cwd(), 'src/modules/core/server/response'));
const { getUserPermissions } = require(path.join(process.cwd(), 'src/modules/platform/user/server/permission/permissions'));
const ExportService = require(path.join(process.cwd(), 'src/modules/core/server/export/export.service'));
const logger = require(path.join(process.cwd(), 'src/config/server/lib/winston'));

function ignoreCaseArray(str) {
    return [str.toLowerCase(), str.toUpperCase(), str.charAt(0).toLowerCase() + str.charAt(1).toUpperCase(), str.charAt(0).toUpperCase() + str.charAt(1).toLowerCase()];
}

async function getCdpConsentsReport(req, res) {
    const response = new Response({}, []);

    try {
        const page = req.query.page ? req.query.page - 1 : 0;
        const limit = 30;
        const codbase = req.query.codbase === undefined ? '' : req.query.codbase;
        const opt_type = req.query.opt_type === undefined ? '' : req.query.opt_type;
        const offset = page * limit;

        const orderBy = req.query.orderBy ? req.query.orderBy : '';
        const orderType = req.query.orderType ? req.query.orderType : '';
        const order = [];

        if (orderBy && orderType) {
            if (orderBy === 'first_name') order.push([HCPS, 'first_name', orderType]);
            if (orderBy === 'last_name') order.push([HCPS, 'last_name', orderType]);
            if (orderBy === 'email') order.push([HCPS, 'email', orderType]);

            if (orderBy === 'consent_type') order.push([Consent, ConsentCategory, 'title', orderType]);

            if (orderBy === 'opt_type') order.push(['opt_type', orderType === 'ASC' ? 'DESC' : 'ASC']);

            if (orderBy === 'legal_basis') order.push([Consent, 'legal_basis', orderType]);
            if (orderBy === 'preferences') order.push([Consent, 'preference', orderType]);
            if (orderBy === 'date') order.push(['updated_at', orderType]);
        }

        order.push([HCPS, 'created_at', 'DESC']);
        order.push([HCPS, 'id', 'DESC']);

        const countries = await Country.findAll();

        const userCountriesApplication = await getUserPermissions(req.user.id);
        const userPermittedCodbases = countries.filter(i => userCountriesApplication[1].includes(i.country_iso2)).map(i => i.codbase);
        const userPermittedCountries = countries.filter(i => userPermittedCodbases.includes(i.codbase)).map(i => i.country_iso2);
        const userPermittedApplications = userCountriesApplication[0].map(app => app.id);

        const country_iso2_list_for_codbase = countries.filter(i => i.codbase === codbase).map(i => i.country_iso2);
        const countries_with_ignorecase = [].concat.apply([], country_iso2_list_for_codbase.map(i => ignoreCaseArray(i)));

        const codbase_list = countries.filter(i => userPermittedCountries.includes(i.country_iso2)).map(i => i.codbase);
        const country_iso2_list = countries.filter(i => codbase_list.includes(i.codbase)).map(i => i.country_iso2);
        const country_iso2_list_with_ignorecase = [].concat.apply([], country_iso2_list.map(i => ignoreCaseArray(i)));

        const opt_types = ['opt-in', 'opt-in-pending', 'opt-out'];

        const consent_filter = {
            'opt_type': opt_type ? { [Op.eq]: opt_type } : { [Op.or]: opt_types },
            '$hcp_profile.application_id$': userPermittedApplications,
            '$hcp_profile.country_iso2$': codbase ? { [Op.any]: [countries_with_ignorecase] } : { [Op.any]: [country_iso2_list_with_ignorecase] },
        };

        const hcp_consents = await HcpConsents.findAll({
            where: consent_filter,
            include: [
                {
                    model: HCPS,
                    attributes: ['id', 'first_name', 'last_name', 'email', 'is_email_verified', 'uuid', 'individual_id_onekey']
                },
                {
                    model: Consent,
                    attributes: ['preference', 'legal_basis'],
                    include: [
                        {
                            model: ConsentCategory,
                            attributes: ['title', 'slug']
                        }
                    ]
                }
            ],
            attributes: ['consent_id', 'opt_type', 'created_at'],
            offset,
            limit,
            order: order,
            subQuery: false
        });

        hcp_consents.forEach(hcp_consent => {
            hcp_consent.dataValues.consent_id = hcp_consent.consent_id;
            hcp_consent.dataValues.legal_basis = hcp_consent.consent.legal_basis;
            hcp_consent.dataValues.given_date = hcp_consent.created_at;
            hcp_consent.dataValues.preference = hcp_consent.consent.preference;
            hcp_consent.dataValues.category = hcp_consent.consent.consent_category.title;
            hcp_consent.dataValues.type = hcp_consent.consent.consent_category.slug;

            delete hcp_consent.dataValues['consent'];
        });

        const total_consents = await HcpConsents.count({
            where: consent_filter,
            include: [
                {
                    model: HCPS,
                },
                {
                    model: Consent,
                    include: [
                        {
                            model: ConsentCategory
                        }
                    ]
                }
            ]
        });

        const data = {
            hcp_consents: hcp_consents,
            page: page + 1,
            limit,
            total: total_consents,
            start: limit * page + 1,
            end: offset + limit > total_consents ? total_consents : offset + limit,
            codbase: codbase ? codbase : '',
            opt_type: opt_type ? opt_type : '',
            countries: userCountriesApplication[1],
            orderBy: orderBy,
            orderType: orderType
        };

        response.data = data;
        res.json(response);
    } catch (err) {
        logger.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

async function getVeevaConsentsReport(req, res) {
    const response = new Response({}, []);

    try {
        const page = req.query.page ? req.query.page - 1 : 0;
        const limit = 30;
        const codbase = req.query.codbase === undefined ? '' : req.query.codbase;
        const opt_type = req.query.opt_type === undefined ? '' : req.query.opt_type;
        const offset = page * limit;

        const [, userPermittedCountries] = await getUserPermissions(req.user.id);
        const countries = await Country.findAll();

        async function getCountryIso2() {
            const user_codbase_list_for_iso2 = countries.filter(i => userPermittedCountries.includes(i.country_iso2)).map(i => i.codbase);
            const user_country_iso2_list = countries.filter(i => user_codbase_list_for_iso2.includes(i.codbase)).map(i => i.country_iso2);
            return user_country_iso2_list;
        }

        const country_iso2_list_for_codbase = countries.filter(i => i.codbase === codbase).map(i => i.country_iso2);
        const country_iso2_list = await getCountryIso2();

        const orderBy = req.query.orderBy ? req.query.orderBy : '';
        const orderType = req.query.orderType && req.query.orderType.toLowerCase() === "desc" ? "DESC" : "ASC";
        let sortBy = 'content_type';

        if (orderBy && orderType) {
            if (orderBy === 'account_name') sortBy = 'ciam.vw_veeva_consent_master.account_name';
            if (orderBy === 'channel_value') sortBy = 'ciam.vw_veeva_consent_master.channel_value';

            if (orderBy === 'opt_type') sortBy = 'ciam.vw_veeva_consent_master.opt_type';

            if (orderBy === 'content_type') sortBy = 'ciam.vw_veeva_consent_master.content_type';
            if (orderBy === 'capture_datetime') sortBy = 'ciam.vw_veeva_consent_master.capture_datetime';
        }

        const getConsentFilter = () => {
            if(opt_type === 'Opt_In_vod') return `ciam.vw_veeva_consent_master.country_code = ANY($countries) and
                ciam.vw_veeva_consent_master.opt_type = 'Opt_In_vod'`;
            if(opt_type === 'Opt_In_Pending_vod') return `ciam.vw_veeva_consent_master.country_code = ANY($countries) and
                ciam.vw_veeva_consent_master.opt_type = 'Opt_In_Pending_vod'`;
            if(opt_type === 'Opt_Out_vod') return `ciam.vw_veeva_consent_master.country_code = ANY($countries) and
                ciam.vw_veeva_consent_master.opt_type = 'Opt_Out_vod'`
            return `ciam.vw_veeva_consent_master.country_code = ANY($countries)`;
        }

        const consent_filter = getConsentFilter();

        const hcp_consents = await sequelize.datasyncConnector.query(
            `SELECT
                account_name,
                content_type,
                opt_type,
                capture_datetime,
                onekeyid,
                uuid_mixed,
                country_code,
                uuid_mixed,
                channel_value,
                glpg_consent_source
            FROM
                ciam.vw_veeva_consent_master
            WHERE ${consent_filter}
            ORDER BY
                ${sortBy} ${orderType}
            offset $offset
            limit $limit;`
            , {
                bind: {
                    countries: codbase ? country_iso2_list_for_codbase : country_iso2_list,
                    offset: offset,
                    limit: limit,
                },
                type: QueryTypes.SELECT
            });

        const total_consents = (await sequelize.datasyncConnector.query(
            `SELECT
                COUNT(*)
            FROM
                ciam.vw_veeva_consent_master
            WHERE ${consent_filter}`
            , {
                bind: {
                    countries: codbase ? country_iso2_list_for_codbase : country_iso2_list
                },
                type: QueryTypes.SELECT
            }))[0];

        const data = {
            hcp_consents,
            page: page + 1,
            limit,
            total: total_consents.count,
            start: limit * page + 1,
            end: offset + limit > total_consents.count ? total_consents.count : offset + limit,
            codbase: codbase ? codbase : '',
            opt_type: opt_type ? opt_type : '',
            countries: userPermittedCountries,
            orderBy: orderBy,
            orderType: orderType,
        };

        response.data = data;
        res.json(response);
    }
    catch (err) {
        logger.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

async function exportCdpConsentsReport(req, res) {
    try {
        const order = [];
        order.push([HCPS, 'created_at', 'DESC']);
        order.push([HCPS, 'id', 'DESC']);

        const countries = await Country.findAll();
        const userCountriesApplication = await getUserPermissions(req.user.id);
        const userPermittedCodbases = countries.filter(i => userCountriesApplication[1].includes(i.country_iso2)).map(i => i.codbase);
        const userPermittedCountries = countries.filter(i => userPermittedCodbases.includes(i.codbase)).map(i => i.country_iso2);
        const userPermittedApplications = userCountriesApplication[0].map(app => app.id);

        const codbase_list = countries.filter(i => userPermittedCountries.includes(i.country_iso2)).map(i => i.codbase);
        const country_iso2_list = countries.filter(i => codbase_list.includes(i.codbase)).map(i => i.country_iso2);
        const country_iso2_list_with_ignorecase = [].concat.apply([], country_iso2_list.map(i => ignoreCaseArray(i)));

        const consent_filter = {
            '$hcp_profile.application_id$': userPermittedApplications,
            '$hcp_profile.country_iso2$': { [Op.any]: [country_iso2_list_with_ignorecase] },
        };

        const hcp_consents = await HcpConsents.findAll({
            where: consent_filter,
            include: [
                {
                    model: HCPS,
                    attributes: ['first_name', 'last_name', 'email', 'uuid', 'individual_id_onekey', 'country_iso2'],
                },
                {
                    model: Consent,
                    attributes: ['preference'],
                    include: [
                        {
                            model: ConsentCategory,
                            attributes: ['title']
                        }
                    ]
                }
            ],
            attributes: ['consent_id', 'opt_type', 'created_at'],
            order: order,
            subQuery: false
        });

        if (!hcp_consents || !hcp_consents.length) return res.status(404).send(`No consents found.`);

        const data = hcp_consents.map(hcp_consent => ({
            'Individual OnekeyId': hcp_consent.hcp_profile.individual_id_onekey,
            'UUID': hcp_consent.hcp_profile.uuid,
            'First Name': hcp_consent.hcp_profile.first_name,
            'Last Name': hcp_consent.hcp_profile.last_name,
            'Email': hcp_consent.hcp_profile.email,
            'Country': hcp_consent.hcp_profile.country_iso2.toUpperCase(),
            'Consent Category': hcp_consent.consent.consent_category.title,
            'Preference': hcp_consent.consent.preference,
            'Opt Type': hcp_consent.opt_type,
            'Capture Date': (new Date(hcp_consent.created_at)).toLocaleDateString('en-GB').replace(/\//g, '.')
        }));

        const sheetName = 'HCP Consent Performance';
        const fileBuffer = ExportService.exportToExcel(data, sheetName);

        res.writeHead(200, {
            'Content-Disposition': `attachment;filename=${sheetName.replace(' ', '_')}.xlsx`,
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });

        res.end(fileBuffer);
    } catch (err) {
        logger.error(err);
        res.status(500).send(err);
    }
}

async function exportVeevaConsentsReport(req, res) {
    try {
        const [, userPermittedCountries] = await getUserPermissions(req.user.id);
        const countries = await Country.findAll();

        async function getCountryIso2() {
            const user_codbase_list_for_iso2 = countries.filter(i => userPermittedCountries.includes(i.country_iso2)).map(i => i.codbase);
            const user_country_iso2_list = countries.filter(i => user_codbase_list_for_iso2.includes(i.codbase)).map(i => i.country_iso2);
            return user_country_iso2_list;
        }

        const country_iso2_list = await getCountryIso2();

        const hcp_consents = await sequelize.datasyncConnector.query(
            `SELECT
                account_name,
                uuid_mixed,
                onekeyid,
                channel_value,
                opt_type,
                content_type,
                capture_datetime,
                country_code,
                glpg_consent_source
            FROM
                ciam.vw_veeva_consent_master
            WHERE ciam.vw_veeva_consent_master.country_code = ANY($countries)`
            , {
                bind: {
                    countries: country_iso2_list
                },
                type: QueryTypes.SELECT
            });

        if (!hcp_consents || !hcp_consents.length) return res.status(404).send(`No consents found.`);

        const data = hcp_consents.map(hcp_consent => ({
            'Individual OnekeyId': hcp_consent.onekeyid,
            'UUID': hcp_consent.uuid_mixed,
            'Name': hcp_consent.account_name,
            'Email': hcp_consent.channel_value,
            'Country': hcp_consent.country_code.toUpperCase(),
            'Content Type': hcp_consent.content_type,
            'Consent Source': hcp_consent.glpg_consent_source,
            'Opt Type': hcp_consent.opt_type,
            'Capture Date': (new Date(hcp_consent.capture_datetime)).toLocaleDateString('en-GB').replace(/\//g, '.')
        }));

        const sheetName = 'VeevaCRM Consent Performance';
        const fileBuffer = ExportService.exportToExcel(data, sheetName);

        res.writeHead(200, {
            'Content-Disposition': `attachment;filename=${sheetName.replace(' ', '_')}.xlsx`,
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        res.end(fileBuffer);
    } catch (err) {
        logger.error(err);
        res.status(500).send(err);
    }
}

exports.getCdpConsentsReport = getCdpConsentsReport;
exports.getVeevaConsentsReport = getVeevaConsentsReport;
exports.exportCdpConsentsReport = exportCdpConsentsReport;
exports.exportVeevaConsentsReport = exportVeevaConsentsReport;

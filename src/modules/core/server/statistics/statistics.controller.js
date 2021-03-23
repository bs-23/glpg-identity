const path = require('path');
const Sequelize = require('sequelize');
const logger = require(path.join(process.cwd(), 'src/config/server/lib/winston'));
const HCP = require(path.join(process.cwd(), 'src/modules/information/hcp/server/hcp-profile.model'));
const Consent = require(path.join(process.cwd(), 'src/modules/privacy/manage-consent/server/consent.model'));
const HcpConsent = require(path.join(process.cwd(), 'src/modules/information/hcp/server/hcp-consents.model'));
const HcpProfile = require(path.join(process.cwd(), 'src/modules/information/hcp/server/hcp-profile.model'));
const ConsentCountries = require(path.join(process.cwd(), 'src/modules/privacy/consent-country/server/consent-country.model'));
const Partner = require(path.join(process.cwd(), 'src/modules/partner/manage-partners/server/partner.model'));
const PartnerVendor = require(path.join(process.cwd(), 'src/modules/partner/manage-partners/server/partner-vendor.model'));
const Country = require(path.join(process.cwd(), 'src/modules/core/server/country/country.model'));

function ignoreCaseArray(str) {
    if (Array.isArray(str)) {
        let ignoreCase = [];

        str.map(s => {
            ignoreCase = [...ignoreCase, ...[s.toLowerCase(), s.toUpperCase(), s.charAt(0).toLowerCase() + s.charAt(1).toUpperCase(), s.charAt(0).toUpperCase() + s.charAt(1).toLowerCase()]];
        });

        return ignoreCase;
    }

    return [str.toLowerCase(), str.toUpperCase(), str.charAt(0).toLowerCase() + str.charAt(1).toUpperCase(), str.charAt(0).toUpperCase() + str.charAt(1).toLowerCase()];
}

async function getStatistics(req, res) {
    try {
        let { country } = req.query;
        let evaluatedCountries = [];

        const countryData = await Country.findAll();

        if (!Array.isArray(country)) {
            country = [country];
        }

        country.map(c => {
            const countryDetails = countryData.find(cd => cd.country_iso2.toLowerCase() === c.toLowerCase());
            if (countryDetails) {
                const countryWithSameCodbase = countryData.filter(cd => cd.codbase === countryDetails.codbase);
                countryWithSameCodbase.forEach(cwsc => evaluatedCountries.push(cwsc.country_iso2));
            }
        });

        evaluatedCountries = [...new Set(evaluatedCountries)];

        const countryIgnoreCase = ignoreCaseArray(evaluatedCountries);

        const hcps_count = await HCP.count({ where: { country_iso2: countryIgnoreCase } });

        const consents_count = await Consent.count({
            where: { '$consent_country.country_iso2$': countryIgnoreCase },
            include: { model: ConsentCountries, as: 'consent_country' },
            attributes: [
                [Sequelize.fn('DISTINCT', Sequelize.col('consents.id')) ,'id']
            ],
            group: ['consents.id']
        });

        const captured_consents_count = await HcpProfile.count({
            where: {
                country_iso2: countryIgnoreCase,
                '$hcpConsents.consent_confirmed$': true
            },
            include: [
                { model: HcpConsent, as: 'hcpConsents', required: true }
            ]
        });

        const partner_count = await Partner.count({
            where: { country_iso2: countryIgnoreCase, status: 'approved' }
        });

        const partner_vendor_count = await PartnerVendor.count({
            where: { country_iso2: countryIgnoreCase, status: 'approved' }
        })

        const business_partner_count = partner_count + partner_vendor_count;

        const statistics = {
            hcps_count,
            consents_count: consents_count.length,
            captured_consents_count: captured_consents_count,
            business_partner_count
        };

        res.json(statistics);
    } catch (err) {
        logger.error(err);
        res.status(500).send('Internal server error');
    }
}

exports.getStatistics = getStatistics;

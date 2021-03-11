const path = require('path');
const logger = require(path.join(process.cwd(), 'src/config/server/lib/winston'));
const User = require(path.join(process.cwd(), 'src/modules/platform/user/server/user.model'));
const HCP = require(path.join(process.cwd(), 'src/modules/information/hcp/server/hcp-profile.model'));
const Consent = require(path.join(process.cwd(), 'src/modules/privacy/manage-consent/server/consent.model'));
const HcpConsent = require(path.join(process.cwd(), 'src/modules/information/hcp/server/hcp-consents.model'));

async function getStatistics(req, res) {
    try {
        const users_count = await User.count();
        const hcps_count = await HCP.count();
        const consents_count = await Consent.count();
        const captured_consents_count = await HcpConsent.count();

        const statistics = {
            hcps_count,
            users_count,
            consents_count,
            captured_consents_count
        };

        res.json(statistics);
    } catch (err) {
        logger.error(err);
        res.status(500).send('Internal server error');
    }
}

exports.getStatistics = getStatistics;

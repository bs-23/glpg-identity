const path = require('path');
const XLSX = require('xlsx');

const HcpConsentsImportRecord = require(path.join(process.cwd(), 'src/modules/privacy/import-consents/server/hcp-consents-import-record.model'));
const Consent = require(path.join(process.cwd(), 'src/modules/privacy/manage-consent/server/consent.model'));
const User = require(path.join(process.cwd(), 'src/modules/platform/user/server/user.model.js'));
const logger = require(path.join(process.cwd(), 'src/config/server/lib/winston'));

async function bulkImportConsents(req, res) {
    try {
        const file = req.files[0];
        const workbook = XLSX.read(file['buffer'], { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);
        rows.splice(0, 1);
        const result =
            rows.filter(r => r['OneKey ID Individual'] && r['Opt-In Date'])
                .map(r => ({ onekey_id: r['OneKey ID Individual'], multichannel_consent_id: '12345' }));

        await HcpConsentsImportRecord.create({
            consent_id: req.body.consent_id,
            consent_locale: 'nl_NL',
            result,
            created_by: req.user.id
        });

        res.sendStatus(200);
    } catch (error) {
        logger.error(error);
        res.status(500).send('Internal server error');
    }
}

async function getImportedHcpConsents(req, res) {
    try {
        const importedHcpConsents = await HcpConsentsImportRecord.findAll({
            include: [
                {
                    model: User,
                    as: 'createdByUser',
                    attributes: ['first_name', 'last_name']
                },
                {
                    model: Consent,
                    as: 'consent',
                    attributes: ['preference']
                }
            ]
        });

        const data = importedHcpConsents.map(i => {
            i.dataValues.createdBy = `${i.createdByUser.first_name} ${i.createdByUser.last_name}`;
            delete i.dataValues.createdByUser;
            i.dataValues.consent_preference = i.consent.preference;
            delete i.dataValues.consent;
            return i.dataValues;
        });
        res.json(data);
    } catch (error) {
        logger.error(error);
        res.status(500).send('Internal server error');
    }
}


exports.bulkImportConsents = bulkImportConsents;
exports.getImportedHcpConsents = getImportedHcpConsents;

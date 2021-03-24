const path = require('path');
const XLSX = require('xlsx');

const HcpConsentsImportRecord = require(path.join(process.cwd(), 'src/modules/privacy/import-consents/server/hcp-consents-import-record.model'));
const Consent = require(path.join(process.cwd(), 'src/modules/privacy/manage-consent/server/consent.model'));
const User = require(path.join(process.cwd(), 'src/modules/platform/user/server/user.model.js'));
const logger = require(path.join(process.cwd(), 'src/config/server/lib/winston'));
const storageService = require(path.join(process.cwd(), 'src/modules/core/server/storage/storage.service'));
const File = require(path.join(process.cwd(), 'src/modules/core/server/storage/file.model'));

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

        const importRecord = await HcpConsentsImportRecord.create({
            consent_id: req.body.consent_id,
            consent_locale: req.body.locale,
            result,
            created_by: req.user.id
        });

        await uploadDucument(importRecord, file);

        res.sendStatus(200);
    } catch (error) {
        logger.error(error);
        res.status(500).send('Internal server error');
    }
}

async function uploadDucument(owner, file) {
    const bucketName = 'cdp-development';
    const uploadOptions = {
        bucket: bucketName,
        folder: `imported-hcp-consents/`,
        fileName: owner.id + '.xlsx',
        fileContent: file.buffer
    };

    const response = await storageService.upload(uploadOptions);
    await File.create({
        name: file.originalname,
        bucket_name: bucketName,
        key: response.key,
        owner_id: owner.id,
        table_name: 'hcp_consents_import_records'
    });
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

async function getDownloadUrl(req, res) {
    try {
        const file = await File.findOne({
            where: { owner_id: req.params.id }
        });

        if (!file) return res.status(404).send('The file does not exist');

        const url = storageService.getSignedUrl(file.bucket_name, file.key);

        res.json(url)
    } catch (error) {
        logger.error(error);
        res.status(500).send('Internal server error');
    }
}

exports.bulkImportConsents = bulkImportConsents;
exports.getImportedHcpConsents = getImportedHcpConsents;
exports.getDownloadUrl = getDownloadUrl;

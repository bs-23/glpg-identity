const path = require('path');
const XLSX = require('xlsx');
const { Op } = require('sequelize');
const parse = require('html-react-parser');

const HcpConsentImportRecord = require(path.join(process.cwd(), 'src/modules/privacy/import-consents/server/hcp-consent-import-record.model'));
const Consent = require(path.join(process.cwd(), 'src/modules/privacy/manage-consent/server/consent.model'));
const ConsentLocale = require(path.join(process.cwd(), 'src/modules/privacy/manage-consent/server/consent-locale.model'));
const ConsentCategory = require(path.join(process.cwd(), 'src/modules/privacy/consent-category/server/consent-category.model'));
const User = require(path.join(process.cwd(), 'src/modules/platform/user/server/user.model'));
const logger = require(path.join(process.cwd(), 'src/config/server/lib/winston'));
const storageService = require(path.join(process.cwd(), 'src/modules/core/server/storage/storage.service'));
const File = require(path.join(process.cwd(), 'src/modules/core/server/storage/file.model'));
const veevaService = require(path.join(process.cwd(), 'src/modules/information/hcp/server/services/veeva.service'));
const ExportService = require(path.join(process.cwd(), 'src/modules/core/server/export/export.service'));

async function importConsents(req, res) {
    try {
        const file = req.files[0];
        const workbook = XLSX.read(file['buffer'], { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);

        const consent = await Consent.findOne({
            where: {
                id: req.body.consent_id,
                is_active: true
            },
            attributes: ['id'],
            include: [
                {
                    model: ConsentCategory,
                    where: { id: req.body.consent_category },
                    attributes: ['veeva_content_type_id']
                },
                {
                    model: ConsentLocale,
                    where: { consent_id: req.body.consent_id, locale: req.body.consent_locale },
                    attributes: ['locale', 'rich_text', 'veeva_consent_type_id']
                }
            ]
        });

        consent.opt_type = 'single-opt-in';
        consent.consent_source = 'Website';

        const data = [];

        await Promise.all(rows.map(async row => {
            const onekey_id = row['OneKey ID Individual'];
            const email = row['Emailaddress'];
            consent.captured_date = row['Opt-In Date'];

            let multichannel_consent = null;
            const isEmailDifferent = await veevaService.isEmailDifferent(onekey_id, email.toLowerCase());

            if(!isEmailDifferent) {
                multichannel_consent = await veevaService.createMultiChannelConsent(onekey_id, email.toLowerCase(), consent);
            }

            data.push({
                onekey_id,
                email,
                captured_date: consent.captured_date,
                multichannel_consent_id: multichannel_consent ? multichannel_consent.id : null
            });
        }));

        if (data.length) {
            const importRecord = await HcpConsentImportRecord.create({
                consent_id: consent.id,
                consent_locale: req.body.consent_locale,
                data,
                created_by: req.user.id
            });

            const bucketName = 'cdp-development';

            const response = await storageService.upload({
                bucket: bucketName,
                folder: `captured-consents-for-import/`,
                fileName: importRecord.id + '.xlsx',
                fileContent: file.buffer
            });

            await File.create({
                name: file.originalname,
                bucket_name: bucketName,
                key: response.key,
                owner_id: importRecord.id,
                table_name: 'hcp_consents_import_records'
            });
        }

        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        logger.error(err);
        res.status(500).send('Internal server error');
    }
}

async function getConsentImportRecords(req, res) {
    try {
        const records = await HcpConsentImportRecord.findAll({
            include: [
                {
                    model: User,
                    as: 'createdByUser',
                    attributes: ['first_name', 'last_name']
                },
                {
                    model: Consent,
                    as: 'consent',
                    attributes: ['preference'],
                    include: [{
                        model: ConsentCategory,
                        attributes: ['title']
                    }]
                }
            ]
        });

        res.json(records);
    } catch (err) {
        logger.error(err);
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
    } catch (err) {
        logger.error(err);
        res.status(500).send('Internal server error');
    }
}

async function exportRecords(req, res) {
    try {
        const record = await HcpConsentImportRecord.findOne({
            where: { id: req.params.id },
            include: [
                {
                    model: User,
                    as: 'createdByUser',
                    attributes: ['first_name', 'last_name']
                },
                {
                    model: Consent,
                    as: 'consent',
                    attributes: ['preference'],
                    include: [{
                        model: ConsentCategory,
                        attributes: ['title']
                    }]
                }
            ]
        });

        if (!record) return res.status(404).send(`No record found.`);

        const consentLocale = await ConsentLocale.findOne({
            where: {
                consent_id: record.consent_id,
                locale: {
                    [Op.iLike]: record.consent_locale
                }
            }
        });

        const exportData = record.data.map(item => ({
            'Individual OneKeyId': item.onekey_id,
            'Email': item.email,
            'Consent Preference': record.consent.preference,
            'Consent Locale': record.consent_locale,
            'Legal Text': parse(consentLocale.rich_text).replace(/(<\/?(?:a)[^>]*>)|<[^>]+>/ig, '$1'),
            'Multichannel Consent Id': item.multichannel_consent_id,
            'Opt-In Date': item.captured_date
        }));

        const sheetName = 'Imported Consent Records';
        const fileBuffer = ExportService.exportToExcel(exportData, sheetName);

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

exports.importConsents = importConsents;
exports.getConsentImportRecords = getConsentImportRecords;
exports.getDownloadUrl = getDownloadUrl;
exports.exportRecords = exportRecords;

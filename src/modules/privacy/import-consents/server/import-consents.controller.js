const path = require('path');
const XLSX = require('xlsx');
const { Op } = require('sequelize');
const parse = require('html-react-parser');

const ConsentImportJob = require(path.join(process.cwd(), 'src/modules/privacy/import-consents/server/consent-import-job.model'));
const Consent = require(path.join(process.cwd(), 'src/modules/privacy/manage-consent/server/consent.model'));
const ConsentLocale = require(path.join(process.cwd(), 'src/modules/privacy/manage-consent/server/consent-locale.model'));
const ConsentCategory = require(path.join(process.cwd(), 'src/modules/privacy/consent-category/server/consent-category.model'));
const User = require(path.join(process.cwd(), 'src/modules/platform/user/server/user.model'));
const logger = require(path.join(process.cwd(), 'src/config/server/lib/winston'));
const storageService = require(path.join(process.cwd(), 'src/modules/core/server/storage/storage.service'));
const File = require(path.join(process.cwd(), 'src/modules/core/server/storage/file.model'));
const veevaService = require(path.join(process.cwd(), 'src/modules/information/hcp/server/services/veeva.service'));
const ExportService = require(path.join(process.cwd(), 'src/modules/core/server/export/export.service'));

async function createConsentImportJob(req, res) {
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
            attributes: ['id']
        });

        const data = [];

        rows.map(row => {
            const onekey_id = row['OneKey ID Individual'];
            const email = row['Emailaddress'];
            const captured_date = row['Opt-In Date'];

            data.push({
                onekey_id,
                email,
                opt_type: req.body.opt_type,
                consent_source: 'Website',
                captured_date: captured_date
            });
        });

        const importJob = await ConsentImportJob.create({
            consent_id: consent.id,
            consent_category: req.body.consent_category,
            consent_locale: req.body.consent_locale,
            data,
            status: data.length ? 'ready' : 'not-ready',
            created_by: req.user.id,
            updated_by: req.user.id
        });

        const bucketName = 'cdp-development';

        const response = await storageService.upload({
            bucket: bucketName,
            folder: `consent-import-jobs/`,
            fileName: importJob.id + '.xlsx',
            fileContent: file.buffer
        });

        await File.create({
            name: file.originalname,
            bucket_name: bucketName,
            key: response.key,
            owner_id: importJob.id,
            table_name: 'consent_import_jobs'
        });

        res.sendStatus(200);
    } catch (err) {
        logger.error(err);
        res.status(500).send('Internal server error');
    }
}

async function startConsentImportJob(req, res) {
    try {
        const job = await ConsentImportJob.findOne({ where: { id: req.params.id } });

        if(!job || job.status !== 'ready') return;

        const consent = await Consent.findOne({
            where: {
                id: job.consent_id,
                is_active: true
            },
            attributes: ['id'],
            include: [
                {
                    model: ConsentCategory,
                    where: { id: job.consent_category },
                    attributes: ['veeva_content_type_id']
                },
                {
                    model: ConsentLocale,
                    where: { consent_id: job.consent_id, locale: job.consent_locale },
                    attributes: ['locale', 'rich_text', 'veeva_consent_type_id']
                }
            ]
        });

        if(!consent) return;

        await Promise.all(job.data.forEach(async row => {
            const isEmailDifferent = await veevaService.isEmailDifferent(row.onekey_id, row.email.toLowerCase());

            if(!isEmailDifferent) {
                multichannel_consent = await veevaService.createMultiChannelConsent(row.onekey_id, row.email.toLowerCase(), row.opt_type, row.consent_source, consent);
            }

            row.multichannel_consent_id = multichannel_consent ? multichannel_consent.id : null;
        }));

        await job.update({ status: 'completed', data: job.data, updated_by: req.user.id });

        res.sendStatus(200);
    } catch (err) {
        logger.error(err);
        res.status(500).send('Internal server error');
    }
}

async function getConsentImportJobs(req, res) {
    try {
        const jobs = await ConsentImportJob.findAll({
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

        res.json(jobs);
    } catch (err) {
        logger.error(err);
        res.status(500).send('Internal server error');
    }
}

async function deleteConsentImportJob(req, res) {
    try {
        const job = await ConsentImportJob.findOne({
            where: { id: req.params.id }
        });

        if (!job) return res.status(404).send('No job found');

        if (job.status === 'completed') return res.status(400).send('Invalid sattus. Job already completed.');

        const file = await File.findOne({
            where: { owner_id: req.params.id }
        });

        if (file) {
            const deleteParam = {
                Bucket: 'cdp-development',
                Delete: {
                    Objects: [{ Key: file.key }]
                }
            };

            await storageService.deleteFiles(deleteParam);
        }

        await job.destroy();

        res.sendStatus(200);
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
        const record = await ConsentImportJob.findOne({
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

exports.createConsentImportJob = createConsentImportJob;
exports.startConsentImportJob = startConsentImportJob;
exports.getConsentImportJobs = getConsentImportJobs;
exports.getDownloadUrl = getDownloadUrl;
exports.exportRecords = exportRecords;
exports.deleteConsentImportJob = deleteConsentImportJob;

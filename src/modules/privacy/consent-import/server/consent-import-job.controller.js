const path = require('path');
const XLSX = require('xlsx');
const { Op } = require('sequelize');
const validator = require('validator');
const parse = require('html-react-parser');

const ConsentImportJob = require(path.join(process.cwd(), 'src/modules/privacy/consent-import/server/consent-import-job.model'));
const Consent = require(path.join(process.cwd(), 'src/modules/privacy/manage-consent/server/consent.model'));
const ConsentLocale = require(path.join(process.cwd(), 'src/modules/privacy/manage-consent/server/consent-locale.model'));
const ConsentCategory = require(path.join(process.cwd(), 'src/modules/privacy/consent-category/server/consent-category.model'));
const User = require(path.join(process.cwd(), 'src/modules/platform/user/server/user.model'));
const logger = require(path.join(process.cwd(), 'src/config/server/lib/winston'));
const storageService = require(path.join(process.cwd(), 'src/modules/core/server/storage/storage.service'));
const File = require(path.join(process.cwd(), 'src/modules/core/server/storage/file.model'));
const veevaService = require(path.join(process.cwd(), 'src/modules/information/hcp/server/services/veeva.service'));
const ExportService = require(path.join(process.cwd(), 'src/modules/core/server/export/export.service'));
const logService = require(path.join(process.cwd(), 'src/modules/core/server/audit/audit.service'));

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
                    attributes: ['rich_text', 'veeva_consent_type_id']
                }
            ]
        });

        if(!consent ||
            !consent.consent_category ||
            !consent.consent_category.veeva_content_type_id ||
            !consent.consent_locales ||
            !consent.consent_locales[0].veeva_consent_type_id ||
            !consent.consent_locales[0].rich_text) {
            return res.status(400).send('Consent not found!');
        }

        const data = [];
        let valid_file = true;

        rows.map(row => {
            const onekey_id = row['OneKey ID Individual'];
            const email = row['Emailaddress'];
            const captured_date = new Date((row['Opt-In Date'] - (25567 + 2))*86400*1000);

            if(!onekey_id || !email || !validator.isEmail(email) || !row['Opt-In Date']) {
                valid_file = false;
            } else {
                data.push({
                    onekey_id,
                    email: email.toLowerCase(),
                    opt_type: req.body.opt_type,
                    consent_source: 'VeevaCRM',
                    captured_date: captured_date
                });
            }
        });

        if(!valid_file) return res.status(400).send('File contents are not valid. Please recheck and try again.');

        const importJob = await ConsentImportJob.create({
            consent_id: consent.id,
            consent_category: req.body.consent_category,
            consent_locale: req.body.consent_locale,
            data,
            rich_text: validator.unescape(consent.consent_locales[0].rich_text),
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

        await logService.log({
            event_type: 'CREATE',
            object_id: importJob.id,
            table_name: 'consent_import_jobs',
            actor: req.user.id,
            changes: importJob.dataValues
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

        if(!job || job.status !== 'ready') return res.status(400).send('Job is not ready yet.');

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

        if(!consent) return res.status(400).send('Consent not found.');

        const data = await Promise.all(job.data.map(async row => {
            const newRow = { ...row };
            let multichannel_consent;
            const account = await veevaService.getAccountByOneKeyId(row.onekey_id);

            if(account) {
                const isEmailDifferent = await veevaService.isEmailDifferent(account, row.email);

                if (isEmailDifferent) {
                    newRow.email_is_different_in_veeva = true;
                } else {
                    multichannel_consent = await veevaService.createMultiChannelConsent(account, row.email, row.opt_type, row.consent_source, consent, row.captured_date, job.rich_text);
                }

                newRow.multichannel_consent_id = multichannel_consent ? multichannel_consent.id : null;
            } else {
                newRow.invalid_onekeyid = true;
            }

            return newRow;
        }));

        const previousJob = { ...job.dataValues };

        await job.update({ status: 'completed', data: data, updated_by: req.user.id });

        const updatesInJob = logService.difference(job.dataValues, previousJob);

        if (updatesInJob) {
            await logService.log({
                event_type: 'UPDATE',
                object_id: job.id,
                table_name: 'consent_import_jobs',
                actor: req.user.id,
                changes: updatesInJob
            });
        }

        res.json(job);
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

        const data = jobs.map(j => {
            const legalText = validator.unescape(j.rich_text);
            return {
                ...j.dataValues,
                rich_text: legalText
            }
        })

        res.json(data);
    } catch (err) {
        logger.error(err);
        res.status(500).send('Internal server error');
    }
}

async function cancelConsentImportJob(req, res) {
    try {
        const job = await ConsentImportJob.findOne({
            where: { id: req.params.id }
        });

        if (!job) return res.status(404).send('No job found!');

        if (job.status === 'completed' || job.status === 'cancelled') return res.status(400).send('Invalid request! Job is already completed or cancelled.');

        const previousJob = { ...job.dataValues };

        await job.update({ status: 'cancelled' });

        const updatesInJob = logService.difference(job.dataValues, previousJob);

        if (updatesInJob) {
            await logService.log({
                event_type: 'UPDATE',
                object_id: job.id,
                table_name: 'consent_import_jobs',
                actor: req.user.id,
                changes: updatesInJob
            });
        }

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

async function exportJobReport(req, res) {
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
            'Legal Text': parse(record.rich_text).replace(/(<\/?(?:a)[^>]*>)|<[^>]+>/ig, '$1'),
            'Multichannel Consent Id': item.multichannel_consent_id,
            'Opt Type': item.opt_type,
            'Opt-In Date': item.captured_date,
            'Remarks': item.invalid_onekeyid ? 'OneKeyId is not found.' : item.email_is_different_in_veeva ? 'Email address is different in Veeva CRM' : 'N/A'
        }));

        const sheetName = 'Consent Records';
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
exports.exportJobReport = exportJobReport;
exports.cancelConsentImportJob = cancelConsentImportJob;

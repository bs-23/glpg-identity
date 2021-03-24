const path = require('path');
const XLSX = require('xlsx');

const ImportedHcpConsent = require(path.join(process.cwd(), 'src/modules/privacy/import-consents/server/imported-hcp-consent.model'));

async function bulkImportConsents(req, res) {
    try {
        const file = req.files[0];
        const workbook = XLSX.read(file['buffer'], { type: 'buffer' });
        var first_sheet_name = workbook.SheetNames[0];

        res.sendStatus(200);
    } catch (error) {
        logger.error(error);
        res.status(500).send('Internal server error');
    }
}

async function getImportedHcpConsents(req, res) {
    try {
        const importedHcpConsents = await ImportedHcpConsent.findAll();
        res.json(importedHcpConsents);
    } catch (error) {
        logger.error(error);
        res.status(500).send('Internal server error');
    }
}


exports.bulkImportConsents = bulkImportConsents;
exports.getImportedHcpConsents = getImportedHcpConsents;

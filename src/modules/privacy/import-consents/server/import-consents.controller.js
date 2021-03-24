async function bulkImportConsents(req, res) {
    try {
        const file = req.files[0];

        const content = file['buffer'].toString();

        console.log('Consent Category: ', req.body.consent_category);
        console.log('Consent Id: ', req.body.consent_id);
        console.log('Consent File Data: ');
        console.log(content);

        res.sendStatus(200);
    } catch (err) {
        // logger.error(err);
        res.status(500).send('Internal server error');
    }
}


exports.bulkImportConsents = bulkImportConsents;

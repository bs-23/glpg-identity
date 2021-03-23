async function bulkImportConsents(req, res) {
    try {
        const file = req;

        console.log(file);

    } catch (err) {
        // logger.error(err);
        res.status(500).send('Internal server error');
    }
}


exports.bulkImportConsents = bulkImportConsents;

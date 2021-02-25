const path = require('path');
const Localization = require(path.join(process.cwd(), "src/modules/core/server/localization/localization.model"));
const logger = require(path.join(process.cwd(), 'src/config/server/lib/winston'));

async function getLocalizations(req, res) {
    try {
        const localizations = await Localization.findAll();
        res.json(localizations.map(l => l.dataValues));
    } catch (err) {
        logger.error(err);
        res.status(500).send('Internal server error');
    }
}

exports.getLocalizations = getLocalizations;

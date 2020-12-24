const path = require('path');
const FilterSettings = require(path.join(process.cwd(), "src/modules/core/server/filter/filter.model.js"));
const filterService = require(path.join(process.cwd(), 'src/modules/platform/user/server/filter.js'));

const tables = ['hcp-profiles', 'cdp-users']

async function getFilterOptions(req, res) {
    try {
        const filterOptions = await filterService.getFilterOptions(req.user);
        res.json(filterOptions);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function getUserFilters(req, res) {
    try {
        const { table } = req.query;
        if (!table || !tables.includes(table)) return res.status(400).send('Invalid table name');

        const userFilters = await FilterSettings.findAll({
            where: {
                user_id: req.user.id,
                table_name: table
            }
        });

        const data = userFilters.map(({ title, settings }) => ({ title, settings }));
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function createUserFilter(req, res) {
    try {
        const { title, settings, table } = req.body;
        if (!table || !tables.includes(table)) return res.status(400).send('Invalid table name');
        if (!settings) return res.status(400).send('Filter settings cannot be null');
        if (!title) return res.status(400).send('Filter title cannot be null');

        await FilterSettings.create({
            title,
            user_id: req.user.id,
            table_name: table,
            settings
        });

        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function updateUserFilter(req, res) {
    try {
        const id = req.params.id;

        const { title, settings } = req.body;
        if (!settings) return res.status(400).send('Filter settings cannot be null');

        const filterSettings = await FilterSettings.findOne({ where: { id } });

        if (!filterSettings) return res.status(404).send('Filter not found');

        await filterSettings.update({
            title,
            settings
        });

        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

exports.getFilterOptions = getFilterOptions;
exports.getUserFilters = getUserFilters;
exports.createUserFilter = createUserFilter;
exports.updateUserFilter = updateUserFilter;

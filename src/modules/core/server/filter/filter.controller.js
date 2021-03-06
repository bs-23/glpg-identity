const path = require('path');
const FilterSettings = require(path.join(process.cwd(), "src/modules/core/server/filter/filter.model.js"));
const filterService = require(path.join(process.cwd(), 'src/modules/platform/user/server/filter.js'));
const { Op } = require('sequelize');

const tables = ['hcp-profiles', 'crdlp-hcp-profiles', 'cdp-users']

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

        const data = userFilters.map(({ id, title, settings }) => ({ id, title, settings }));
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

        const filterWithSameName = await FilterSettings.findOne({
            where: {
                user_id: req.user.id,
                table_name: table,
                title: title.trim()
            }
        })

        if (filterWithSameName) return res.status(400).send('Filter with same name already exists.');

        const filter = await FilterSettings.create({
            title: title.trim(),
            user_id: req.user.id,
            table_name: table,
            settings
        });

        res.json(filter);
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

        const filterWithSameName = await FilterSettings.findOne({
            where: {
                id: { [Op.ne]: id },
                user_id: req.user.id,
                table_name: filterSettings.table_name,
                title: title.trim()
            }
        })

        if (filterWithSameName) return res.status(400).send('Filter with same name already exists.');

        await filterSettings.update({
            title: title.trim(),
            settings
        });

        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function getFilterSetting(req, res) {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).send('Must provide id.');

        const filter = await FilterSettings.findOne({
            where: { id },
            attributes: ['id', 'title', 'table_name', 'settings']
        });

        res.json(filter);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

exports.getUserFilters = getUserFilters;
exports.createUserFilter = createUserFilter;
exports.updateUserFilter = updateUserFilter;
exports.getFilterSetting = getFilterSetting;

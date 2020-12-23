const path = require('path');
const FilterSettings = require(path.join(process.cwd(), "src/modules/core/server/filter/filter.model.js"));
const filterService = require(path.join(process.cwd(), 'src/modules/platform/user/server/filter.js'));
const { QueryTypes, Op, where, col, fn, literal } = require('sequelize');

async function getFilterOptions(req, res) {
    try {
        const filterOptions = await filterService.getFilterOptions(req.user);

        const [currentFilter,] = await FilterSettings.findOrCreate({
            where: { user_id: req.user.id, table_name: 'cdp-users' },
            defaults: {
                option: {}
            }
        });

        const data = {
            filterOptions,
            currentFilter: currentFilter.option
        }
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function updateFilterOptions(req, res) {
    try {
        const filters = req.body;

        const currentFilter = await FilterSettings.findOne({
            where: { user_id: req.user.id, table_name: 'cdp-users' }
        });

        if (currentFilter) {
            await currentFilter.update({
                option: filters
            });
        }

        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

exports.getFilterOptions = getFilterOptions;
exports.updateFilterOptions = updateFilterOptions;

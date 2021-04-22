const path = require('path');
const { Op } = require('sequelize');

const filterService = require(path.join(process.cwd(), 'src/modules/core/server/filter/filter.service'));
const { ignoreCaseArray } = require('./user.service');

function getFilterQuery(filter, countries) {
    if (filter.fieldName === 'country') {
        const country_iso2_list_for_codbase = countries
            .filter(c => filter.value.some(f => f === c.codbase))
            .map(c => c.country_iso2);

        const countries_ignorecase_for_codbase = [].concat.apply([], country_iso2_list_for_codbase
            .map(i => ignoreCaseArray(i)));

        const countries_ignorecase_for_codbase_formatted = '{' + countries_ignorecase_for_codbase.join(", ") + '}';

        return {
            [Op.or]: [
                { '$userRole->role_ps->ps.countries$': { [Op.overlap]: countries_ignorecase_for_codbase_formatted } },
                { '$userProfile->up_ps->ps.countries$': { [Op.overlap]: countries_ignorecase_for_codbase_formatted } }
            ]
        }
    }
    return filterService.getFilterQuery(filter, "users");
}

function generateFilterOptions(currentFilter, defaultFilter, countries) {
    if (!currentFilter || !currentFilter.filters || currentFilter.filter === 0)
        return defaultFilter;

    let customFilter = { ...defaultFilter };

    const nodes = currentFilter.logic
        ? currentFilter.logic.split(" ")
        : ['1'];

    let prevOperator;
    const groupedQueries = [];
    for (let index = 0; index < nodes.length; index++) {
        const node = nodes[index];
        const prev = index > 0 ? nodes[index - 1] : null;
        const next = index < nodes.length - 1 ? nodes[index + 1] : null;

        const findFilter = (name) => {
            return currentFilter.filters.find(f => f.name === name);
        };

        if (node === "and" && prevOperator === "and") {
            const filter = findFilter(next);
            const query = getFilterQuery(filter, countries);
            const currentParent = groupedQueries[groupedQueries.length - 1];
            currentParent.values.push(query);
        } else if (node === "and") {
            const leftFilter = findFilter(prev);
            const rightFilter = findFilter(next);
            const group = {
                operator: "and",
                values: [
                    getFilterQuery(leftFilter, countries),
                    getFilterQuery(rightFilter, countries)
                ]
            };
            groupedQueries.push(group);
        } else if (node !== "or" && prev !== "and" && next !== "and") {
            const filter = findFilter(node);
            const query = getFilterQuery(filter, countries);
            groupedQueries.push(query);
        }

        prevOperator = node === "and" || node === "or" ? node : prevOperator;
    }

    if (groupedQueries.length > 1) {
        customFilter[Op.or] = groupedQueries.map(q => {
            if (q.operator === 'and') {
                return { [Op.and]: q.values };
            }
            return q;
        });
    } else {
        const query = groupedQueries[0];
        if (query.operator === 'and') {
            customFilter[Op.and] = query.values;
        } else {
            customFilter = { ...customFilter, ...query };
        }
    }

    return customFilter;
}

exports.generateFilterOptions = generateFilterOptions;

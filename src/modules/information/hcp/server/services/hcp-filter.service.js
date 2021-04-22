const path = require('path');
const { Op, where, col } = require('sequelize');

const Country = require(path.join(process.cwd(), 'src/modules/core/server/country/country.model'));
const filterService = require(path.join(process.cwd(), 'src/modules/core/server/filter/filter.service'));


function ignoreCaseArray(str) {
    return [str.toLowerCase(), str.toUpperCase(), str.charAt(0).toLowerCase() + str.charAt(1).toUpperCase(), str.charAt(0).toUpperCase() + str.charAt(1).toLowerCase()];
}

async function getAllCountries() {
    const countries = await Country.findAll();
    return countries.map(c => c.dataValues);
}

async function getUserPermittedCodbases(userPermittedCountries) {
    const allCountryList = await getAllCountries();

    const userCodBases = allCountryList.filter(c => userPermittedCountries.includes(c.country_iso2)).map(c => c.codbase.toLowerCase());
    return userCodBases;
};

function generateQueryObject(filterObj, customFilter, allCountries, user_country_iso2_list) {
    /** Country filter is specially handled as
     *  there can be multiple country under a Codbase and
     *  hcp_profiles table saves country_iso2, not codbase
     */
    if (filterObj.fieldName === 'country') {
        const country_iso2_list_for_codbase = allCountries.filter(ac => filterObj.value.some(v => ac.codbase.toLowerCase() === v.toLowerCase())).map(i => i.country_iso2);

        const selected_iso2_list_for_codbase = country_iso2_list_for_codbase.filter(i => user_country_iso2_list.includes(i));
        const ignorecase_of_selected_iso2_list_for_codbase = [].concat.apply([], selected_iso2_list_for_codbase.map(i => ignoreCaseArray(i)));

        delete customFilter.country_iso2;
        return {
            ['country_iso2']: ignorecase_of_selected_iso2_list_for_codbase.length
                ? ignorecase_of_selected_iso2_list_for_codbase
                : null
        };
    }

    if (filterObj.fieldName === 'specialty') {
        return {
            [Op.or]: [
                { specialty_1_code: filterObj.value },
                { specialty_2_code: filterObj.value },
                { specialty_3_code: filterObj.value }
            ]
        };
    }

    return filterService.getFilterQuery(filterObj);
};

async function generateFilterOptions(currentFilterSettings, userPermittedApplications, userPermittedCountries, status, table) {
    let allCountries = [];
    let defaultFilter = {};
    let user_country_iso2_list = [];

    if (table === 'hcp_profiles') {
        allCountries = await getAllCountries();

        const user_codbase_list_for_iso2 = allCountries.filter(c => userPermittedCountries.includes(c.country_iso2))
            .map(i => i.codbase);

        user_country_iso2_list = allCountries.filter(c => user_codbase_list_for_iso2.includes(c.codbase))
            .map(i => i.country_iso2);

        const ignorecase_of_country_iso2_list = [].concat.apply([], user_country_iso2_list.map(i => ignoreCaseArray(i)));

        defaultFilter = {
            application_id: userPermittedApplications.length
                ? userPermittedApplications.map(app => app.id)
                : null,
            country_iso2: ignorecase_of_country_iso2_list.length
                ? ignorecase_of_country_iso2_list
                : null
        };

        if (status) {
            defaultFilter.status = status;
        }
    }

    if (table === 'datasync_hcp_profiles') {
        const countryFilter = (currentFilterSettings.filters || []).find(f => f.fieldName === 'codbase');
        if (!countryFilter) {
            const codbases = await getUserPermittedCodbases(userPermittedCountries);
            defaultFilter = {
                [Op.or]: codbases.map(codbase => { return where(col('codbase'), 'iLIKE', codbase); })
            };
        }
    }

    if (!currentFilterSettings || !currentFilterSettings.filters || currentFilterSettings.filter === 0)
        return defaultFilter;

    let customFilter = { ...defaultFilter };

    const nodes = currentFilterSettings.logic && currentFilterSettings.filters.length > 1
        ? currentFilterSettings.logic.split(" ")
        : ['1'];

    let prevOperator;
    const groupedQueries = [];
    const findFilter = (name) => {
        return currentFilterSettings.filters.find(f => f.name === name);
    };

    // ========================

    for (let index = 0; index < nodes.length; index++) {
        const node = nodes[index];
        const prev = index > 0 ? nodes[index - 1] : null;
        const next = index < nodes.length - 1 ? nodes[index + 1] : null;

        if (node === "and" && prevOperator === "and") {
            const filter = findFilter(next);
            const query = generateQueryObject(filter, customFilter, allCountries, user_country_iso2_list);
            const currentParent = groupedQueries[groupedQueries.length - 1];
            currentParent.values.push(query);
        } else if (node === "and") {
            const leftFilter = findFilter(prev);
            const rightFilter = findFilter(next);
            const group = {
                operator: "and",
                values: [
                    generateQueryObject(leftFilter, customFilter, allCountries, user_country_iso2_list),
                    generateQueryObject(rightFilter, customFilter, allCountries, user_country_iso2_list)
                ]
            };
            groupedQueries.push(group);
        } else if (node !== "or" && prev !== "and" && next !== "and") {
            const filter = findFilter(node);
            const query = generateQueryObject(filter, customFilter, allCountries, user_country_iso2_list);
            groupedQueries.push(query);
        }

        prevOperator = node === "and" || node === "or" ? node : prevOperator;
    }

    const operatorSymbols = Object.getOwnPropertySymbols(customFilter);

    if (groupedQueries.length > 1) {
        const queryValue = groupedQueries.map(q => {
            if (q.operator === 'and') {
                return { [Op.and]: q.values };
            }
            return q;
        });
        if (operatorSymbols[0] && operatorSymbols[0].toString() === 'Symbol(or)') {
            customFilter = {
                [Op.and]: [
                    customFilter,
                    { [Op.or]: queryValue }
                ]
            };
        } else {
            customFilter[Op.or] = queryValue;
        }
    } else {
        const query = groupedQueries[0];
        if (query.operator === 'and') {
            customFilter[Op.and] = query.values;
        } else {
            customFilter = operatorSymbols[0] && operatorSymbols[0].toString() === 'Symbol(or)'
                ? {
                    [Op.and]: [
                        customFilter,
                        query
                    ]
                }
                : { ...customFilter, ...query };
        }
    }

    return customFilter;
}

exports.generateFilterOptions = generateFilterOptions;

const path = require('path');
const { Op, QueryTypes, where, fn, col } = require('sequelize');
const sequelize = require(path.join(process.cwd(), 'src/config/server/lib/sequelize'));
const { getRequestingUserPermissions } = require(path.join(process.cwd(), "src/modules/platform/user/server/permission/permissions.js"));

function getStringOperators() {
    return [
        { key: 'equal', displayText: 'Equals to' },
        // { key: 'case-insensitive-equal', displayText: 'Equals to (Case-insensitive)' },
        { key: 'contains', displayText: 'Contains' },
        { key: 'starts-with', displayText: 'Starts With' }
    ];
}

function getSelectOperators() {
    return [
        { key: 'equal', displayText: 'Equals to' }
    ];
}

function getDateOperators() {
    return [
        { key: 'equal', displayText: 'Equals to' },
        { key: 'less-than', displayText: 'Before' },
        { key: 'greater-than', displayText: 'After' }
    ]
}

function getNumberOperators() {
    return [
        { key: 'equal', displayText: 'Equals to' },
        { key: 'greater-than', displayText: 'Greater than' },
        { key: 'greater-than-or-equal', displayText: 'Greater than or equal to' },
        { key: 'less-than', displayText: 'Less than' },
        { key: 'less-than-or-equal', displayText: 'Less than or equal to' },
        { key: 'between', displayText: 'Between' },
    ]
}

async function getCountries(user) {
    try {
        const countries = await sequelize.datasyncConnector.query("SELECT * FROM ciam.vwcountry WHERE codbase_desc=countryname ORDER BY codbase_desc, countryname;", { type: QueryTypes.SELECT });

        const [, userCountries,] = await getRequestingUserPermissions(user);
        if (userCountries) {
            return countries.filter(c => userCountries.some(uc => uc === c.country_iso2));
        }

        return countries;
    } catch (err) {
        console.error(err);
    }
}

async function getFilterOptions(user) {
    const countries = (await getCountries(user))
        .map(c => ({ value: c.codbase, displayText: c.countryname }));

    const statusOptions = [
        { value: 'self_verified', displayText: 'Self Verified' },
        { value: ['self_verified', 'manually_verified'], displayText: 'All Verified' },
        { value: 'manually_verified', displayText: 'Manually Verified' },
        { value: 'consent_pending', displayText: 'Consent Pending' },
        { value: 'not_verified', displayText: 'Not Verified' },
    ];

    const filterOptions = [
        {
            fieldName: 'first_name',
            valueType: 'text',
            displayText: 'First Name',
            operators: getStringOperators()
        },
        {
            fieldName: 'last_name',
            valueType: 'text',
            displayText: 'Last Name',
            operators: getStringOperators()
        },
        {
            fieldName: 'email',
            valueType: 'text',
            displayText: 'Email',
            operators: getStringOperators()
        },
        {
            fieldName: 'country',
            valueType: 'select',
            displayText: 'Country',
            operators: getSelectOperators(),
            options: countries
        },
        {
            fieldName: 'status',
            valueType: 'select',
            displayText: 'Status',
            operators: getSelectOperators(),
            options: statusOptions
        },
        {
            fieldName: 'created_at',
            valueType: 'date',
            displayText: 'Creation Date',
            operators: getDateOperators()
        },
        {
            fieldName: 'expiry_date',
            valueType: 'date',
            displayText: 'Expiry Date',
            operators: getDateOperators()
        },
        {
            fieldName: 'created_by',
            valueType: 'text',
            displayText: 'Created By',
            operators: getStringOperators()
        }
    ];

    return filterOptions;
}

function getFilterQuery(filter) {
    let queryValue;

    if (filter.operator === 'equal') {
        queryValue = Array.isArray(filter.value)
            ? { [Op.or]: filter.value }
            : { [Op.eq]: filter.value };
    }

    if (filter.operator === 'ci-equal') {
        queryValue = Array.isArray(filter.value)
            ? { [Op.or]: filter.value.map(v => { return where(col(filter.fieldName), 'iLIKE', v); }) }
            : { [Op.iLike]: filter.value };
    }

    if (filter.operator === 'contains') {
        queryValue = { [Op.like]: `%${filter.value}%` };
    }

    if (filter.operator === 'starts-with') {
        queryValue = { [Op.like]: `${filter.value}%` }
    }

    if (filter.operator === 'less-than') {
        queryValue = { [Op.lt]: filter.value };
    }

    if (filter.operator === 'greater-than') {
        queryValue = { [Op.gt]: filter.value };
    }

    if (filter.operator === 'greater-than-or-equal') {
        queryValue = { [Op.gte]: filter.value };
    }

    if (filter.operator === 'less-than-or-equal') {
        return { [Op.lte]: filter.value };
    }

    if (filter.operator === 'between') {
        queryValue = { [Op.notBetween]: filter.value };
    }

    return { [filter.fieldName]: queryValue };
};

exports.getFilterOptions = getFilterOptions;
exports.getFilterQuery = getFilterQuery;

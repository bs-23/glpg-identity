const { Op, where, fn, col } = require('sequelize');

function escapeValues (value) {
    let escapedValues = Array.isArray(value) ? value.map(v => v.replace(/_/g, '\\_')) : value.replace(/_/g, '\\_');
    return escapedValues;
}

function getFilterQuery(filter, tableName) {
    let queryValue;

    // Case Sensitive Equal
    if (filter.operator === 'equal') {
        queryValue = Array.isArray(filter.value)
            ? { [Op.or]: filter.value }
            : { [Op.eq]: filter.value };
    }

    // Case Insensitive Equal
    if (filter.operator === 'ci-equal') {
        queryValue = Array.isArray(filter.value)
            ? { [Op.or]: filter.value.map(v => ({ [Op.iLike]: escapeValues(v) })) }
            : { [Op.iLike]: escapeValues(filter.value) };
    }

    if (filter.operator === 'date-equal') {
        queryValue = where(fn('date', col(tableName ? `${tableName}.${filter.fieldName}` : filter.fieldName)), '=', filter.value);
    }

    if (filter.operator === 'contains') {
        queryValue = Array.isArray(filter.value)
            ? { [Op.or]: filter.value.map(v => ({ [Op.iLike]: `%${escapeValues(v)}%` }))}
            : { [Op.iLike]: `%${escapeValues(filter.value)}%` };
    }

    if (filter.operator === 'starts-with') {
        queryValue = Array.isArray(filter.value)
            ? { [Op.or]: filter.value.map(v => ({ [Op.iLike]: `${escapeValues(v)}%` }))}
            : { [Op.iLike]: `${escapeValues(filter.value)}%` };
    }

    if (filter.operator === 'date-less-than') {
        queryValue = where(fn('date', col(tableName ? `${tableName}.${filter.fieldName}` : filter.fieldName)), '<', filter.value);
    }

    if (filter.operator === 'date-greater-than') {
        queryValue = where(fn('date', col(tableName ? `${tableName}.${filter.fieldName}` : filter.fieldName)), '>', filter.value);
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

exports.getFilterQuery = getFilterQuery;

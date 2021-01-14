export function getStringOperators() {
    return [
        { key: 'ci-equal', displayText: 'Equals to' },
        { key: 'contains', displayText: 'Contains' },
        { key: 'starts-with', displayText: 'Starts With' }
    ];
}

export function getSelectOperators() {
    return [
        { key: 'equal', displayText: 'Equals to' }
    ];
}

export function getDateOperators() {
    return [
        { key: 'equal', displayText: 'Equals to' },
        { key: 'less-than', displayText: 'Before' },
        { key: 'greater-than', displayText: 'After' }
    ]
}

export function getNumberOperators() {
    return [
        { key: 'equal', displayText: 'Equals to' },
        { key: 'greater-than', displayText: 'Greater than' },
        { key: 'greater-than-or-equal', displayText: 'Greater than or equal to' },
        { key: 'less-than', displayText: 'Less than' },
        { key: 'less-than-or-equal', displayText: 'Less than or equal to' },
        { key: 'between', displayText: 'Between' },
    ]
}

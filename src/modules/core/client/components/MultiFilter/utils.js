export const buildLogicAfterAddition = (filters, logic) => {
    if (!logic) return filters.join(' null ');
    return logic + ' null ' + filters.join(' null ');
}

export const buildLogicAfterRemoval = (logic, filterIndex) => {
    const nodes = logic.split(' ');
    let filters = [];
    let operators = [];

    nodes.forEach((e, idx) => {
        if (idx % 2 === 0) filters.push(e);
        else operators.push(e);
    });

    const filtersLength = filters.length;

    if (filterIndex === 0) {
        filters.shift();
        operators.shift();
    } else if (filterIndex === filtersLength) {
        filters.pop();
        operators.pop();
    } else {
        filters = filters.filter((f, ind) => ind !== filterIndex);
        operators = operators.filter((f, ind) => ind !== filterIndex);
        operators[filterIndex - 1] = 'null';
    }

    return filters.map((f, ind) => {
        if (ind === filters.length - 1) return ind+1;
        return String(ind+1) + " " + operators[ind];
    }).join(' ');
}

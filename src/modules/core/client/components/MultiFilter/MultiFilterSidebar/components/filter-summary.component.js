import React from 'react';

const FilterSummary = (props) => {
    const {
        fieldName,
        operatorName,
        values,
        index
    } = props;

    return <div className="d-flex flex-row border border-secondary bg-white rounded-sm">
        <div className="py-2 px-2 mr-2 bg-secondary d-flex align-items-center">{index}</div>
        <div className="py-2 px-2">
            <div>
                <span>{fieldName}</span>
            </div>
            <div>
                <span className="mr-3">{operatorName}</span>
                <span>{values}</span>
            </div>
        </div>
    </div>
}

export default FilterSummary;

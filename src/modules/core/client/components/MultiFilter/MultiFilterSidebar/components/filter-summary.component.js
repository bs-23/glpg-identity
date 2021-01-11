import React from 'react';

const FilterSummary = (props) => {
    const {
        fieldName,
        operatorName,
        values,
        index,
        onRemove
    } = props;

    return <div className="d-flex flex-row border border-secondary bg-white rounded-sm">
        <div className="py-2 px-2 mr-2 bg-secondary d-flex align-items-center text-white">{index+1}</div>
        <div className="py-2 px-2 w-100">
            <div className="d-flex justify-content-between">
                <span>{fieldName}</span>
                <i className="fas fa-times mr-2 text-secondary" type="button" onClick={() => onRemove(index)} />
            </div>
            <div>
                <span className="mr-3">{operatorName}</span>
                <span>{Array.isArray(values) ? values.join(', ') : values}</span>
            </div>
        </div>
    </div>
}

export default FilterSummary;
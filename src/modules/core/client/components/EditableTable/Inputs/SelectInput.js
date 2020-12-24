import React from 'react';

const SelectInput = ({ options, ...props }) => {
    return <select
        className="form-control"
        autoFocus
        {...props}
    >
        {options && options.map(({ key, value, label }) => <option key={key || value} value={value} >{label}</option>)}
    </select>
}

export default SelectInput;

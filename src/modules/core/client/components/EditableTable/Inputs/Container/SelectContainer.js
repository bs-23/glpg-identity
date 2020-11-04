import React, { useState, useEffect } from 'react';

const SelectContainer = ({ row, value, options, children }) => {
    const [selectOptions, setSelectOptions] = useState([]);

    useEffect(() => {
        const getOptions = async () => {
            if(typeof options === 'function') return Promise.resolve(options(value, row));
            return Promise.resolve(options);
        }
        getOptions().then(data => setSelectOptions(data));
    }, []);

    return children(selectOptions)
}

export default SelectContainer;

import React, { useEffect, useState } from 'react';

import { Button } from '../common';
import { Filter } from './components';

const style = {
    container: {
        position: 'absolute',
        right: '20%',
        background: 'white',
        border: '1px solid darkgreen',
        borderRadius: '5px',
        width: '20%'
    }
}

const AddFilter = (props) => {
    const { onDone, onAddMoreFilter, filters: existingFilters, filterOptions } = props;
    const [filters, setFilters] = useState([]);

    const handleAddMoreFilter = () => {
        const emptyFilter = {
            name: "Filter " + (filters.length + 1),
            field: '',
            operator: '',
            value: ''
        };
        setFilters([...filters, emptyFilter]);
    }

    const handleDone = (e) => {
        onDone && onDone(filters);
    }

    const handleChange = (e, index) => {
        const targetName = e.target.name;
        const targetValue = e.target.value;
        const updatedFilters = [...filters];
        updatedFilters[index][targetName] = targetValue;
        setFilters(updatedFilters);
    }

    useEffect(() => {
        setFilters(existingFilters);
    }, []);

    return <div style={style.container}>
        <div className="bg-light p-2">Add Filter</div>
        <div className="px-3 pb-3">
            {
                filters && filters.map((filter, index) =>
                    <Filter
                        key={filter.name}
                        name={filter.name}
                        index={index}
                        fieldValue={filter.field}
                        operatorValue={filter.operator}
                        value={filter.value}
                        filterOptions={filterOptions}
                        onChange={handleChange}
                    />
                )
            }
            <Button className="btn cdp-btn-outline-primary my-2 btn-block" label="+ add more filter" onClick={handleAddMoreFilter} />
            <Button className="btn cdp-btn-secondary btn-block text-white" label="Done" onClick={handleDone} />
        </div>
    </div>
}

export default AddFilter;

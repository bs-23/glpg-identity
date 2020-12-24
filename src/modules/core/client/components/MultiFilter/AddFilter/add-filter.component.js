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

const operators = [
    { key: 'equals', displayText: 'Equal to' },
    { key: 'greater-than', displayText: 'Greater Than' }
]

const AddFilter = (props) => {
    const { onDone, onAddMoreFilter } = props;
    const [filters, setFilters] = useState({});

    const handleAddMoreFilter = () => {
        const emptyFilter = {};
        setFilters([...filters, emptyFilter]);
    }

    useEffect(() => {

    }, [props]);

    return <div style={style.container}>
        <div className="bg-light p-2">Add Filter</div>
        <div className="p-2">
            <Filter name="Filter 01" operators={operators} operatorValue={'equals'} />
            <Filter name="Filter 02" operators={operators} operatorValue={'greater-than'} />
            <Button className="btn cdp-btn-outline-primary my-2 btn-block" label="+ add more filter" onClick={onAddMoreFilter} />
            <Button className="btn cdp-btn-secondary btn-block text-white" label="Done" onClick={onDone} />
        </div>
       
    </div>
}

export default AddFilter;

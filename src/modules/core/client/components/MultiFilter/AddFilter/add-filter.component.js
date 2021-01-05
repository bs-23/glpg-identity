import React, { useEffect, useState } from 'react';

import { Button } from '../common';
import { Filter } from './components';
import ScrollBars from 'react-scrollbar';

const AddFilter = (props) => {
    const {
        currentNumberOfFilters,
        filters: existingFilters,
        filterOptions,
        filterPresets,
        onAddMoreFilter,
        onDone
    } = props;

    const emptyFilter = {
        name: '',
        fieldName: '',
        operator: '',
        value: ''
    };

    const [filters, setFilters] = useState([emptyFilter]);
    const [isTouched, setIsTouched] = useState(false);

    // const [selectedFilter, setSelectedFilter] = useState([]);

    const handleAddMoreFilter = () => {
        const emptyFilter = {
            name: String(filters.length + 1),
            fieldName: '',
            operator: '',
            value: ''
        };
        setFilters([...filters, emptyFilter]);
    }

    const areFiltersValid = () => {
        let isValid = true;
        filters.forEach(f => {
            if(!f.fieldName.length || !f.operator.length || !f.value.length) {
                isValid = false;
            }
        })
        return isValid;
    }

    const getFilterValidationError = (filter) => {
        const validationError = {};
        if(!filter.fieldName.length) validationError.fieldName = 'Field can not be empty.';
        if(!filter.operator.length) validationError.operator = 'Field can not be empty.';
        if(!filter.value.length) validationError.value = 'Field can not be empty.';
        return validationError;
    }

    const handleDone = (e) => {
        // onDone && onDone(filters, filterPresets.find(fp => fp.id === selectedFilter));
        const isValid = areFiltersValid();
        if(!isValid) setIsTouched(true);
        else onDone && onDone(filters);
    }

    const handleChange = (propertyName, value, index) => {
        const updatedFilters = [...filters];
        updatedFilters[index][propertyName] = value;
        setFilters(updatedFilters);
    }

    // const handlePresetChange = (e) => {
    //     const presetID = e.target.value;
    //     const selectedFilters = filterPresets.find(fp => fp.id === presetID).settings.filters || [];
    //     setSelectedFilter(presetID);
    //     setFilters(selectedFilters);
    // }

    const handleRemove = (index) => {
        console.log(index)
        const filtersAfterRemoval = filters.filter((filter, ind) => ind !== index);
        setFilters(filtersAfterRemoval);
    }

    const scrollBarStyle = {
        maxHeight: '500px'
    };
    
    // useEffect(() => {
    //     setFilters(existingFilters);
    // }, []);

    return <div className="filter__sub-panel">
        <ScrollBars autoHide={false} smoothScrolling={true} style={scrollBarStyle}>
            <div className="bg-light p-2 rounded-top">Add Filter</div>
            <div className="px-3 pb-3 pt-2">
                {/* {
                filterPresets && filterPresets.length > 0 &&
                <div className="mb-2">
                    <label className="pt-2 mb-1">Select From Existing Filters</label>
                    <select className="form-control form-control-sm" name="selectedFilterPreset" onChange={handlePresetChange}>
                        <option value="">Select an option</option>
                        {
                            filterPresets.map((filter, index) =>
                                <option key={filter.id} value={filter.id}>{filter.title}</option>
                            )
                        }
                    </select>
                </div>
            } */}
                {
                    filters && filters.map((filter, index) =>
                        <Filter
                            key={filter.name}
                            name={filter.name}
                            index={index}
                            currentNumberOfFilters={currentNumberOfFilters}
                            fieldValue={filter.fieldName}
                            operatorValue={filter.operator}
                            value={filter.value}
                            filterOptions={filterOptions}
                            isTouched={isTouched}
                            validationError={getFilterValidationError(filter)}
                            onChange={handleChange}
                            onRemove={handleRemove}
                        />
                    )
                }
                <Button className="btn cdp-btn-outline-primary mt-4 btn-block" label="+ add more filter" onClick={handleAddMoreFilter} />
                <Button className="btn cdp-btn-secondary btn-block text-white" label="Done" onClick={handleDone} />
            </div>
        </ScrollBars>
        
    </div>
}

export default AddFilter;

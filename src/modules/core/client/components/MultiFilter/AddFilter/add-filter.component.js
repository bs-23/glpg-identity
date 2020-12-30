import React, { useEffect, useState } from 'react';

import { Button } from '../common';
import { Filter } from './components';

const AddFilter = (props) => {
    const { onDone, onAddMoreFilter, filters: existingFilters, filterOptions, filterPresets } = props;
    const [filters, setFilters] = useState([]);
    const [selectedFilter, setSelectedFilter] = useState([]);

    const handleAddMoreFilter = () => {
        const emptyFilter = {
            name: String(filters.length + 1),
            fieldName: '',
            operator: '',
            value: ''
        };
        setFilters([...filters, emptyFilter]);
    }

    const handleDone = (e) => {
        onDone && onDone(filters, filterPresets.find(fp => fp.id === selectedFilter));
    }

    const handleChange = (propertyName, value, index) => {
        const updatedFilters = [...filters];
        updatedFilters[index][propertyName] = value;
        setFilters(updatedFilters);
    }

    const handlePresetChange = (e) => {
        const presetID = e.target.value;
        const selectedFilters = filterPresets.find(fp => fp.id === presetID).settings.filters || [];
        setSelectedFilter(presetID);
        setFilters(selectedFilters);
    }

    const handleRemove = (index) => {
        console.log(index)
        const filtersAfterRemoval = filters.filter((filter, ind) => ind !== index);
        setFilters(filtersAfterRemoval);
    }

    // useEffect(() => {
    //     setFilters(existingFilters);
    // }, []);

    return <div className="filter__sub-panel">
        <div className="bg-light p-2 rounded-top">Add Filter</div>
        <div className="px-3 pb-3">
            {
                filterPresets && filterPresets.length &&
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
            }
            {
                filters && filters.map((filter, index) =>
                    <Filter
                        key={filter.name}
                        name={filter.name}
                        index={index}
                        fieldValue={filter.fieldName}
                        operatorValue={filter.operator}
                        value={filter.value}
                        filterOptions={filterOptions}
                        onChange={handleChange}
                        onRemove={handleRemove}
                    />
                )
            }
            <Button className="btn cdp-btn-outline-primary my-2 btn-block" label="+ add more filter" onClick={handleAddMoreFilter} />
            <Button className="btn cdp-btn-secondary btn-block text-white" label="Done" onClick={handleDone} />
        </div>
    </div>
}

export default AddFilter;

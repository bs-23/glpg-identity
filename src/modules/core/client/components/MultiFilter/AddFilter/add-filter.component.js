import React, { useState, useEffect } from 'react';

import { Button } from '../common';
import { Filter } from './components';
import ScrollBars from 'react-scrollbar';

const AddFilter = (props) => {
    const {
        currentNumberOfFilters,
        filterOptions,
        onDone
    } = props;

    const emptyFilter = {
        name: '',
        fieldName: '',
        operator: '',
        value: []
    };

    const [filters, setFilters] = useState([emptyFilter]);
    const [validationErrors, setValidationErrors] = useState([{}]);
    const [isTouched, setIsTouched] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false);

    const handleAddMoreFilter = () => {
        const emptyFilter = {
            name: String(filters.length + 1),
            fieldName: '',
            operator: '',
            value: []
        };
        setFilters([...filters, emptyFilter]);
        setValidationErrors([...validationErrors, {}]);
    }

    // const areFiltersValid = () => {
    //     let isValid = true;
    //     filters.forEach(f => {
    //         if(!f.fieldName.length || !f.operator.length || !f.value.length) {
    //             isValid = false;
    //         }
    //     })
    //     return isValid;
    // }

    const getFilterValidationError = async (filter) => {
        const validationError = {};
        const options = filterOptions.find(fo => fo.fieldName === filter.fieldName);
        const valueSchema = (options || {}).schema;

        if (!filter.fieldName.length) validationError.fieldName = 'Field can not be empty.';
        if (!filter.operator.length) validationError.operator = 'Field can not be empty.';
        if (!filter.value.length) validationError.value = 'Field can not be empty.';

        if (valueSchema) {
            try{
                await valueSchema.validate(filter.value);
            }catch(err) {
                validationError.value = err.errors[0];
            }
        }

        return validationError;
    }

    const handleDone = (e) => {
        setIsTouched(true);
        if(!isFormValid) return;
        onDone && onDone(filters);
    }

    const handleChange = (propertyName, value, index) => {
        const updatedFilters = [...filters];

        updatedFilters[index][propertyName] = value;

        if (propertyName === 'fieldName') {
            updatedFilters[index]['operator'] = '';
            updatedFilters[index]['value'] = [];
        };

        setFilters(updatedFilters);
    }

    const handleRemove = (index) => {
        const filtersAfterRemoval = filters.filter((filter, ind) => ind !== index);
        const validationErrorsAfterRemoval = validationErrors.filter((ve, ind) => ind !== index);
        setFilters(filtersAfterRemoval);
        setValidationErrors(validationErrorsAfterRemoval);
    }

    const scrollBarStyle = {
        maxHeight: '500px'
    };

    const validateForm = async () => {
        let isValid = true;
        const updatedValidationErrors = [...validationErrors];

        await Promise.all(filters.map(async (filter, index) => {
            const validationErrorMessage = await getFilterValidationError(filter);
            updatedValidationErrors[index] = validationErrorMessage;
            if(Object.keys(validationErrorMessage).length) isValid = false;
        }))

        setValidationErrors(updatedValidationErrors);
        setIsFormValid(isValid);
    }

    useEffect(() => {
        validateForm();
    }, [filters])

    return <div className="filter__sub-panel">
        <ScrollBars autoHide={false} smoothScrolling={true} style={scrollBarStyle}>
            <div className="bg-light p-2 rounded-top">Add Filter</div>
            <div className="px-3 pb-3 pt-2">
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
                            validationError={validationErrors[index]}
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

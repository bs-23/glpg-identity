import React, { useState, useEffect } from 'react';
import ScrollBars from 'react-scrollbar';
import _ from 'lodash';

import { Button } from '../common';
import { Filter } from './components';
import { buildLogicAfterAddition, buildLogicAfterRemoval } from '../utils';

const AddFilter = (props) => {
    const {
        filters: alreadyAddedFilters,
        logic: alreadyAddedLogic,
        filterOptions,
        onDone,
        onHide
    } = props;

    const emptyFilter = {
        name: '',
        fieldName: '',
        operator: '',
        value: []
    };

    const [filters, setFilters] = useState([]);
    const [logic, setLogic] = useState('');
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
        const updateLogic = buildLogicAfterAddition([String(filters.length+1)], logic);
        setLogic(updateLogic);
    }

    const getFilterValidationError = async (filter, index) => {
        const validationError = {};
        const options = filterOptions.find(fo => fo.fieldName === filter.fieldName);
        const valueSchema = (options || {}).schema;

        const isIdenticalFilter = filters.some((f, ind) => {
            const f1 = {...f};
            const f2 = {...filter};

            delete f1.name;
            delete f2.name;

            return ind !== index && _.isEqual(f1, f2);
        })

        if(isIdenticalFilter) validationError.value = 'This filter is identical to another filter in the list.';

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

        const filtersWithUpdatedNames = filters.map((filter, ind) => {
            filter.name = String(ind+1);
            return filter;
        });

        onDone && onDone(filtersWithUpdatedNames, logic);
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
        const updatedLogic = buildLogicAfterRemoval(logic, index);
        setLogic(updatedLogic);
        setFilters(filtersAfterRemoval);
        setValidationErrors(validationErrorsAfterRemoval);
    }

    const scrollBarStyle = {
        maxHeight: '498px'
    };

    const handleHide = () => {
        onHide && onHide();
    }

    const validateForm = async () => {
        let isValid = true;
        const updatedValidationErrors = [...validationErrors];

        await Promise.all(filters.map(async (filter, index) => {
            const validationErrorMessage = await getFilterValidationError(filter, index);
            updatedValidationErrors[index] = validationErrorMessage;
            if(Object.keys(validationErrorMessage).length) isValid = false;
        }))

        setValidationErrors(updatedValidationErrors);
        setIsFormValid(isValid);
    }

    useEffect(() => {
        validateForm();
    }, [filters])

    useEffect(() => {
        if(!alreadyAddedFilters.length) {
            const updatedFilters = [..._.cloneDeep(alreadyAddedFilters), emptyFilter];
            setFilters(updatedFilters);

            const updateLogic = buildLogicAfterAddition([String(updatedFilters.length)], alreadyAddedLogic);
            setLogic(updateLogic);
        }
        else {
            setFilters(_.cloneDeep(alreadyAddedFilters));
            setLogic(alreadyAddedLogic);
        }
    }, [alreadyAddedFilters, alreadyAddedLogic])

    return <div className="filter__sub-panel">
        <ScrollBars className="custom-scroll" autoHide={true} smoothScrolling={true} style={scrollBarStyle}>
            <div className="bg-light p-2 rounded-top d-flex justify-content-between border-bottom">
                <span className="font-weight-bold">Add Filter</span>
                <i className="fas fa-times mr-2 text-secondary font-weight-bold h4 mb-0" type="button" onClick={handleHide} />
            </div>
            <div className="px-3 pb-3 pt-2">
                {
                    filters && filters.map((filter, index) =>
                        <Filter
                            key={`${index}_${Math.random()}`}
                            title={index+1}
                            index={index}
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

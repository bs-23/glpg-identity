import React, { useState, useEffect, useRef } from 'react';
import ScrollBars from 'react-scrollbar';
import _ from 'lodash';

import { Button } from '../common';
import { Filter } from './components';
import { buildLogicAfterAddition, buildLogicAfterRemoval } from '../utils';

const random = window.crypto ? window.crypto.getRandomValues(new Uint32Array(2))[0] / 0x100000000 : null;
const generateRandomKey = () => `${random}_${random}`;

const AddFilter = (props) => {
    const {
        filters: alreadyAddedFilters,
        logic: alreadyAddedLogic,
        filterOptions,
        maxNumberOfFilters,
        maxNumberOfValues,
        onDone,
        onHide
    } = props;

    const createEmptyFilter = () => ({
        key: generateRandomKey(),
        name: '',
        fieldName: '',
        operator: '',
        value: []
    });

    const [filters, setFilters] = useState([]);
    const [logic, setLogic] = useState('');
    const [validationErrors, setValidationErrors] = useState([{}]);
    const [isTouched, setIsTouched] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false);

    const scrollRef = useRef();

    const handleAddMoreFilter = () => {
        const emptyFilter = createEmptyFilter();
        emptyFilter.name = String(filters.length + 1);
        const updateLogic = buildLogicAfterAddition([String(filters.length + 1)], logic);

        setFilters([...filters, emptyFilter]);
        setValidationErrors([...validationErrors, {}]);
        setLogic(updateLogic);
    }

    const getFilterValidationError = async (filter, index) => {
        const validationError = {};
        const options = filterOptions.find(fo => fo.fieldName === filter.fieldName);
        const valueSchema = (options || {}).schema;

        const isIdenticalFilter = filters.some((f, ind) => {
            if (ind === index) return false;

            const f1 = { fieldName: f.fieldName, operator: f.operator };
            const f2 = { fieldName: filter.fieldName, operator: filter.operator };

            if (!_.isEqual(f1, f2)) return false;

            const value1 = Array.isArray(f.value) ? f.value : [f.value];
            const value2 = Array.isArray(filter.value) ? filter.value : [filter.value];

            const areValuesSame = _.difference(value1, value2).concat(_.difference(value2, value1)).length === 0;

            return areValuesSame;
        });

        if (isIdenticalFilter) validationError.value = 'This filter is identical to another filter in the list.';

        if (!filter.fieldName.length) validationError.fieldName = 'Field can not be empty.';
        if (!filter.operator.length) validationError.operator = 'Field can not be empty.';
        if (!filter.value.length) validationError.value = 'Field can not be empty.';

        if (valueSchema) {
            try {
                await valueSchema.validate(filter.value);
            } catch (err) {
                validationError.value = err.errors[0];
            }
        }

        return validationError;
    }

    const handleDone = (e) => {
        setIsTouched(true);
        if (!isFormValid) return;

        const filtersWithUpdatedNames = filters.map((filter, ind) => {
            filter.name = String(ind + 1);
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
        }

        setFilters(updatedFilters);
    }

    const handleRemove = (index) => {
        const filtersAfterRemoval = filters.filter((filter, ind) => ind !== index);
        const validationErrorsAfterRemoval = validationErrors.filter((ve, ind) => ind !== index);
        const updatedLogic = buildLogicAfterRemoval(logic, index);

        setLogic(updatedLogic);
        setFilters(filtersAfterRemoval);
        setValidationErrors(validationErrorsAfterRemoval);

        if (scrollRef) {
            const scrollPosition = scrollRef.current.state.topPosition;
            const filterComponentHeight = 230;
            scrollRef.current.scrollArea.scrollYTo(scrollPosition - filterComponentHeight);
        }
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
            if (Object.keys(validationErrorMessage).length) isValid = false;
        }))

        setValidationErrors(updatedValidationErrors);
        setIsFormValid(isValid);
    }

    useEffect(() => {
        validateForm();
    }, [filters])

    useEffect(() => {
        if (!alreadyAddedFilters.length) {
            const updatedFilters = [createEmptyFilter()].map(filter => ({ ...filter, key: generateRandomKey() }));
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
        <ScrollBars ref={scrollRef} className="custom-scroll" minScrollSize={394} autoHide={true} smoothScrolling={true} style={scrollBarStyle}>
            <div className="bg-light p-2 rounded-top d-flex justify-content-between border-bottom">
                <span className="font-weight-bold">Add Filter</span>
                <i className="fas fa-times mr-2 text-secondary font-weight-bold h4 mb-0 cursor-pointer" onClick={handleHide} />
            </div>
            <div className="px-3 pb-3 pt-2">
                {
                    filters && filters.map((filter, index) => {
                        const currentFilterOption = filterOptions.find(fo => fo.fieldName === filter.fieldName);
                        const CustomFilterComponent = (currentFilterOption || {}).customFilterComponent;

                        if (CustomFilterComponent) {
                            return <CustomFilterComponent
                                key={filter.key || index}
                                title={index + 1}
                                index={index}
                                filter={filter}
                                filterOptions={filterOptions}
                                isTouched={isTouched}
                                validationError={validationErrors[index]}
                                maxNumberOfValues={maxNumberOfValues}
                                onChange={handleChange}
                                onRemove={handleRemove}
                            />
                        }

                        return <Filter
                            key={filter.key || index}
                            title={index + 1}
                            index={index}
                            filter={filter}
                            filterOptions={filterOptions}
                            isTouched={isTouched}
                            validationError={validationErrors[index]}
                            maxNumberOfValues={maxNumberOfValues}
                            onChange={handleChange}
                            onRemove={handleRemove}
                        />
                    })
                }
                {filters.length < maxNumberOfFilters && <Button className="btn cdp-btn-outline-primary mt-4 btn-block" label="+ add more filter" onClick={handleAddMoreFilter} />}
                <Button className="btn cdp-btn-secondary btn-block text-white" label="Done" onClick={handleDone} />
            </div>
        </ScrollBars>
    </div>
}

export default AddFilter;

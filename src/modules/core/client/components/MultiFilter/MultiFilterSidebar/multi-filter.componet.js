import React, { useState } from 'react';
import { Formik, Field } from 'formik';

import { Button } from '../common';
import AddFilter from '../AddFilter/add-filter.component';
import { FilterSummary, FilterLogic } from './components';

const MultiFilter = (props) => {
    const {
        onHide,
        onExecute,
        hideOnClickAway,
        options,
        filterPresets,
        selectedSetting,
        selectedSettingTitle,
        selectedSettingID,
        onFilterSelect
    } = props;

    const [show, setShow] = useState({
        addFilter: false
    });
    // const [selectedFilter, setSelectedFilter] = useState(null);

    const handleOnClick = (e) => {
        if(e.target === e.currentTarget) if(hideOnClickAway === true) onHide();
    }

    const handleAddFilterDone = (filters, formikProps, selectedFilter) => {
        const allFilters = formikProps.values.filters.concat(filters).map((filter, ind) => {
            filter.name = String(ind+1);
            return filter;
        });
        formikProps.setFieldValue('filters', allFilters);
        const logic = filterPresets && filterPresets.length
            ? filterPresets.find(fp => fp.id === selectedFilter?.id)?.settings.logic
            : '';
        formikProps.setFieldValue('logic', logic);

        if(!formikProps.values.selectedSettingID && selectedFilter) {
            formikProps.setFieldValue('selectedSettingID', selectedFilter.id);
            formikProps.setFieldValue('filterSettingName', selectedFilter.title);
        }

        setShow({ ...show, addFilter: false });
    }

    const getFieldDisplayText = (fieldName) => {
        const filter = options.find(filter => filter.fieldName === fieldName);
        return filter ? filter.displayText : '';
    }

    const getOperatorDisplayText = (fieldName, operatorName) => {
        const filter = options.find(filter => filter.fieldName === fieldName);
        if(!filter) return '';
        const operator = filter.operators.find(op => op.key === operatorName);
        return operator ? operator.displayText : '';
    }

    const handleRemoveFilter = (index, props) => {
        const allFilters = props.values.filters;
        if(allFilters) {
            const allFiltersAfterRemoval = allFilters.filter((value, ind) => ind !== index).map((filter, index) => {
                filter.name = String(index+1);
                return filter;
            });
            props.setFieldValue('filters', allFiltersAfterRemoval);
        }
    }

    const handleRemoveAll = (props) => {
        props.setFieldValue('filters', []);
        props.setFieldValue('logic', '');
        props.setFieldValue('shouldSaveFilter', false);
    }

    return <div className="filter" onClick={handleOnClick} >
        <div className="filter__panel">
            <h3 className="px-3 pt-3 cdp-text-primary filter__header">Filters</h3>
            <Formik
                onSubmit={onExecute}
                initialValues={{
                    scope: '',
                    filters: selectedSetting
                        ? selectedSetting.filters
                        : [],
                    logic: selectedSetting
                        ? selectedSetting.logic
                        : [],
                    shouldSaveFilter: false,
                    filterSettingName: selectedSettingTitle || '',
                    selectedSettingID: selectedSettingID || ''
                }}
                enableReinitialize
            >
                {(formikProps) =>
                    <React.Fragment>
                        <div className="shadow-sm p-3 d-flex filter__btn-section">
                            <Button
                                className="btn cdp-btn-secondary mr-1 btn-block text-white"
                                label="Execute"
                                onClick={formikProps.submitForm}
                                disabled={formikProps.values.filters.length === 0}
                            />
                            <Button
                                className="btn cdp-btn-outline-primary ml-1 btn-block mt-0"
                                label="Close"
                                onClick={onHide}
                            />
                        </div>
                        <div className="bg-light p-3 filter__section">
                            <div className="mb-3">
                                <label className="d-block pt-2 mb-1" for="scope">
                                    Scope
                                </label>
                                <Field
                                    className="form-control form-control-sm"
                                    id="scope"
                                    as="select"
                                    name="scope"
                                    value=""
                                >
                                    <option className="p-2" value=''> Select an Option </option>
                                </Field>
                            </div>
                            {formikProps.values.filterSettingName &&
                                <div className="cdp-text-secondary font-weight-bold mb-3">Selected Filter: {formikProps.values.filterSettingName}</div>
                            }
                            {formikProps.values.filters.map((filter, index) =>
                                <div className="mb-3" key={filter.name}>
                                    <FilterSummary
                                        fieldName={getFieldDisplayText(filter.fieldName)}
                                        operatorName={getOperatorDisplayText(filter.fieldName, filter.operator)}
                                        values={filter.value}
                                        index={index}
                                        onRemove={(index) => handleRemoveFilter(index, formikProps)}
                                    />
                                </div>
                            )}
                            {formikProps.values.filters.length > 0 &&
                                <React.Fragment>
                                    <label className="d-flex  align-items-center">
                                        <span className="switch-label text-left pr-3">Save Filter</span>
                                        <span className="switch">
                                            <input
                                                className="custom-control-input"
                                                type="checkbox"
                                                name="shouldSaveFilter"
                                                checked={formikProps.values.shouldSaveFilter}
                                                value={formikProps.values.shouldSaveFilter}
                                                onChange={(e) => formikProps.handleChange(e)}
                                            />
                                            <span className="slider round"></span>
                                        </span>
                                    </label>
                                    {formikProps.values.shouldSaveFilter &&
                                        <div className="">
                                            <label className="pt-2 mb-1">
                                                Filter Setting Name
                                            </label>
                                            <Field
                                                className="form-control form-control-sm"
                                                name="filterSettingName"
                                                // value={fieldValue}
                                                // onChange={(e) => onChange(e, index)}
                                            />
                                        </div>
                                    }
                                </React.Fragment>
                            }
                            <div className="d-flex justify-content-between mb-2">
                                <span type="button" className="cdp-text-primary" onClick={() => setShow({ ...show, addFilter: true })}>
                                    <i class="fas fa-plus"></i> Add Filter
                                </span>
                                <span onClick={() => handleRemoveAll(formikProps)}>Remove All</span>
                            </div>
                            {formikProps.values.filters.length > 1 &&
                                <div className="d-flex flex-column">
                                    <div className="d-flex justify-content-between">
                                        <span type="button" className="cdp-text-primary mb-2" onClick={() => null}>
                                            Add Filter Logic
                                        </span>
                                        <span onClick={() => null}>Clear</span>
                                    </div>
                                    <FilterLogic
                                        className="border  border-secondary rounded"
                                        logic={formikProps.values.logic}
                                    />
                                </div>
                            }
                        </div>
                        {show.addFilter &&
                            <AddFilter
                                filterPresets={filterPresets}
                                filters={formikProps.values.filters}
                                filterOptions={options}
                                onDone={(filters, selectedFilter) => handleAddFilterDone(filters, formikProps, selectedFilter)}
                            />
                        }
                    </React.Fragment>
                }
            </Formik>
        </div>
    </div>
}

export default MultiFilter;

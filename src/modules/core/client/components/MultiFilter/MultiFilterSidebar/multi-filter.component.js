import React, { useState, useRef, useImperativeHandle, useEffect } from 'react';
import { Formik, Field, ErrorMessage } from 'formik';
import _ from 'lodash';
import Dropdown from 'react-bootstrap/Dropdown';

import { Button } from '../common';
import AddFilter from '../AddFilter/add-filter.component';
import { FilterSummary, FilterLogic } from './components';
import { multiFilterSchema } from './multi-filter.schema';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { buildLogicAfterAddition, buildLogicAfterRemoval } from '../utils';

const MultiFilter = (props, ref) => {
    const {
        show: showSidePanel,
        onHide,
        onExecute,
        hideOnClickAway,
        options,
        filterPresets,
        selectedSetting,
        selectedSettingTitle,
        selectedSettingID,
        scopeOptions,
        onFilterSelect
    } = props;

    const [show, setShow] = useState({
        addFilter: false
    });
    const [selectedScope, setSelectedScopre] = useState(null);

    const formikRef = useRef();
    const formikBag = formikRef.current;

    const resetFilter = (formikProps) => {
        const {setFieldValue, setFieldTouched} = formikProps || formikBag;

        setFieldValue('isChosenFromExisting', '');
        setFieldValue('filters', []);
        setFieldValue('logic', '');
        setFieldValue('selectedSettingID', '');
        setFieldValue('selectedSettingFilters', []);
        setFieldValue('selectedSettingLogic', '');
        setFieldValue('filterSettingName', '');
        setFieldValue('scope', '');
        setFieldValue('lastAppliedFilters', []);
        setFieldValue('lastAppliedLogic', []);
        setFieldValue('saveType', 'save_as_new');
        setFieldTouched({});
    }

    const removeSelectedFilter = (formikProps) => {
        const setFieldValue = formikProps.setFieldValue;
        setFieldValue('selectedSettingID', '');
        setFieldValue('selectedSettingFilters', []);
        setFieldValue('selectedSettingLogic', '');
        setFieldValue('filterSettingName', '');
        setFieldValue('saveType', 'save_as_new');
    }

    const handleOnClick = (e) => {
        if(e.target === e.currentTarget) if(hideOnClickAway === true) onHide();
    };

    const handleAddFilterDone = (filters, formikProps) => {
        if(filters.length === 0) {
            setShow({ ...show, addFilter: false });
            return;
        };

        const allFiltersMerged = [...formikProps.values.filters, ...filters];
        let uniqueFilters = [];

        allFiltersMerged.forEach((f1) => {
            if(!uniqueFilters.some(uf => {
                delete f1.name;
                delete uf.name;
                return _.isEqual(f1, uf);
            })) uniqueFilters.push(f1);
        })

        const allUniqueFilters = uniqueFilters.map((filter, ind) => {
            filter.name = String(ind+1);
            return filter;
        });

        const lengthOfNewFiltersAdded = allUniqueFilters.length - formikProps.values.filters.length;

        const newFilterIndices = [];
        for(let i = 0; i < lengthOfNewFiltersAdded; ++i) newFilterIndices.push(String(formikProps.values.filters.length + i + 1));

        const updatedLogic = buildLogicAfterAddition(newFilterIndices, formikProps.values.logic);

        formikProps.setFieldValue('filters', allUniqueFilters);
        formikProps.setFieldValue('logic', updatedLogic);

        setShow({ ...show, addFilter: false });
    };

    const getFieldDisplayText = (fieldName) => {
        const filter = options.find(filter => filter.fieldName === fieldName);
        return filter ? filter.displayText : '';
    };

    const getOperatorDisplayText = (fieldName, operatorName) => {
        const filter = options.find(filter => filter.fieldName === fieldName);
        if(!filter) return '';
        const operator = filter.operators.find(op => op.key === operatorName);
        return operator ? operator.displayText : '';
    };

    const scopeHintPopup = (
        <Popover id="scopeHintPopup" className="shadow-lg filter__scope-tolltip">
            <Popover.Content className="px-3">
                You can select only one scope
            </Popover.Content>
        </Popover>
    );

    const hasFilterBeenModified = (formikValues) => {
        const currentSetting = {
            filters: formikValues.filters,
            logic: formikValues.logic
        }
        const selectedSetting = {
            filters: formikValues.selectedSettingFilters,
            logic: formikValues.selectedSettingLogic
        }
        return !_.isEqual(selectedSetting, currentSetting);
    }

    const handleRemoveFilter = (index, props) => {
        const allFilters = props.values.filters;
        if(allFilters) {
            const allFiltersAfterRemoval = allFilters.filter((value, ind) => ind !== index).map((filter, index) => {
                filter.name = String(index+1);
                return filter;
            });

            const updatedLogic = buildLogicAfterRemoval(props.values.logic, index);

            props.setFieldValue('filters', allFiltersAfterRemoval);
            props.setFieldValue('logic', updatedLogic);
        }
    };

    const handleRemoveAll = (props) => {
        props.setFieldValue('filters', []);
        props.setFieldValue('logic', '');
    };

    const handleExecute = (values, actions) => {
        actions.setFieldValue('lastAppliedFilters', values.filters);
        actions.setFieldValue('lastAppliedLogic', values.logic);
        if(!values.shouldSaveFilter && values.selectedSettingID && hasFilterBeenModified(values)) {
            removeSelectedFilter(actions);
            actions.setFieldValue('isChosenFromExisting', 'false');
            values.selectedSettingID = '';
            values.filterSettingName = '';
        }
        onExecute(values, actions);
        onHide();
    };

    const getSummaryValueText = (filter) => {
        const currentFilter = options.find(o => o.fieldName === filter.fieldName);
        if (!currentFilter || currentFilter.valueType !== 'select') return filter.value;
        return currentFilter.options.filter(o => filter.value.some(f => f === o.value)).map(f => f.displayText);
    }

    const handlePresetChange = (e) => {
        const selectedPresetID = e.target.value;

        if(selectedPresetID === '') {   // Removing Selected Filter
            removeSelectedFilter(formikBag);
            formikBag.setFieldValue('logic', '');
            formikBag.setFieldValue('filters', []);
            formikBag.setFieldValue('shouldSaveFilter', false);
            formikBag.setFieldValue('saveType', 'save_as_new');
            return;
        }

        const filterPreset = filterPresets.find(fp => fp.id === selectedPresetID);

        if(!filterPreset) return;

        const { filters, logic } = filterPreset.settings;

        // Setting Selected Filter
        formikBag.setFieldValue('selectedSettingID', selectedPresetID);
        formikBag.setFieldValue('selectedSettingFilters', filters);
        formikBag.setFieldValue('selectedSettingLogic', logic);
        formikBag.setFieldValue('filterSettingName', filterPreset.title);
        formikBag.setFieldValue('filters', filters);
        formikBag.setFieldValue('logic', logic);
        formikBag.setFieldValue('shouldSaveFilter', true);
        formikBag.setFieldValue('saveType', 'save_existing');
        formikBag.validateForm();
    }

    const handleChooseFromExisting = (e, formikProps) => {
        const value = e.target.value;
        resetFilter(formikProps);
        formikProps.setFieldValue('isChosenFromExisting', value);
        formikProps.setTouched({ 'filterSettingName': false });
        if(value === 'true') formikProps.setFieldValue('shouldSaveFilter', true);
        if(value === 'false') formikProps.setFieldValue('shouldSaveFilter', false);
    }

    const handleClose = () => {
        setShow({ ...show, addFilter: false });
        onHide && onHide();
    }

    useEffect(() => {
        if(formikBag) {
            formikBag.setFieldValue('isChosenFromExisting', 'true');
            formikBag.setFieldValue('filters', selectedSetting.filters);
            formikBag.setFieldValue('logic', selectedSetting.logic);
            formikBag.setFieldValue('selectedSettingID', selectedSettingID);
            formikBag.setFieldValue('selectedSettingFilters', selectedSetting.filters);
            formikBag.setFieldValue('selectedSettingLogic', selectedSetting.logic);
            formikBag.setFieldValue('filterSettingName', selectedSettingTitle);
            formikBag.setFieldValue('lastAppliedFilters', selectedSetting.filters);
            formikBag.setFieldValue('lastAppliedLogic', selectedSetting.logic);
            formikBag.setFieldValue('saveType', 'save_existing');
            if(!formikBag.touched.shouldSaveFilter) formikBag.setFieldValue('shouldSaveFilter', true);
        }
    }, [selectedSetting, selectedSettingTitle, selectedSettingID])

    useImperativeHandle(ref, () => ({
        resetFilter,
        values: formikBag && formikBag.values
    }));

    return <Formik
                innerRef={formikRef}
                onSubmit={handleExecute}
                initialValues={{
                    scope: '',
                    filters: selectedSetting
                        ? selectedSetting.filters
                        : [],
                    logic: selectedSetting
                        ? selectedSetting.logic
                        : '',
                    shouldSaveFilter: selectedSettingID ? true : false,
                    filterSettingName: selectedSettingTitle || '',
                    selectedSettingID: selectedSettingID || '',
                    selectedSettingFilters: selectedSetting
                        ? selectedSetting.filters
                        : [],
                    selectedSettingLogic: selectedSetting
                        ? selectedSetting.logic
                        : '',
                    lastAppliedFilters: selectedSetting
                        ? selectedSetting.filters
                        : [],
                    lastAppliedLogic: selectedSetting
                        ? selectedSetting.logic
                        : '',
                    isChosenFromExisting: selectedSettingID ? 'true' : 'false',
                    saveType: 'save_as_new'
                }}
                validationSchema={multiFilterSchema}
            >
        {(formikProps) =>
            showSidePanel &&
            <div className="filter" onClick={handleOnClick}>
                <div className="filter__panel">
                    <h3 className="px-3 pt-3 cdp-text-primary filter__header">Filters</h3>
                    <div className="bg-light p-3 filter__section">
                                {filterPresets && filterPresets.length > 0 && <div role="group" aria-labelledby="my-radio-group">
                                <div role="group" aria-labelledby="my-radio-group">
                                    <div class="custom-control custom-radio">
                                        <input type="radio" class="custom-control-input mr-2" id="createnew" name="isChosenFromExisting" value="false" onChange={(e) => handleChooseFromExisting(e, formikProps)} checked={formikProps.values.isChosenFromExisting === 'false'} />
                                        <label class="custom-control-label" type="button" for="createnew">Create New</label>
                                    </div>
                                    <div class="custom-control custom-radio my-2">
                                        <input type="radio" class="custom-control-input mr-2" id="chooseformexisting" name="isChosenFromExisting" value="true" onChange={(e) => handleChooseFromExisting(e, formikProps)} checked={formikProps.values.isChosenFromExisting === 'true'} />
                                        <label class="custom-control-label" type="button" for="chooseformexisting">Choose From Existing</label>
                                    </div>
                                </div>
                                </div>}
                                {scopeOptions &&
                                    <div className="mb-3">
                                        <label className="d-block mb-1" for="scope">
                                        Scope
                                        <OverlayTrigger trigger="click" rootClose placement="top" overlay={scopeHintPopup}>
                                        <i className="fas fa-info-circle ml-2 text-secondary" role="button"></i>
                                        </OverlayTrigger>
                                        </label>
                                        <Dropdown className="filter__scope-dropdown">
                                            <Dropdown.Toggle
                                                variant=""
                                                className="cdp-btn-outline-primary dropdown-toggle btn btn-block btn-sm d-flex justify-content-between dropdown-toggle">
                                                {selectedScope
                                                    ? <><span><i className={`${selectedScope.icon} mr-2 cdp-text-primary`}></i> {selectedScope.text}</span></>
                                                    : 'Select a scope'
                                                }
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                {scopeOptions.map((scope, idx) => (
                                                    <Dropdown.Item
                                                        key={'scope-' + idx}
                                                        disabled={!scope.enabled}
                                                        onClick={() => { setSelectedScopre(scope); }}>
                                                        <i className={`${scope.icon} mr-2 cdp-text-primary`}></i> {scope.text}
                                                    </Dropdown.Item>
                                                ))}
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </div>
                                }
                                {
                                    formikProps.values.isChosenFromExisting === 'true' && filterPresets && filterPresets.length > 0 &&
                                    <div className="mb-3">
                                        <label className="pt-2 mb-1">Select From Existing Filters</label>
                                        <Field as="select" className="form-control form-control-sm" name="selectedSettingID" onChange={handlePresetChange}>
                                            {/* <React.Fragment> */}
                                                <option value="">Select an option</option>
                                                {
                                                    filterPresets.map((filter, index) =>
                                                        <option key={filter.id} value={filter.id}>{filter.title}</option>
                                                    )
                                                }
                                            {/* </React.Fragment> */}
                                        </Field>
                                    </div>
                                }
                                {formikProps.values.filters.map((filter, index) =>
                                    <div className="mb-2" key={filter.name}>
                                        <FilterSummary
                                            fieldName={getFieldDisplayText(filter.fieldName)}
                                            operatorName={getOperatorDisplayText(filter.fieldName, filter.operator)}
                                            values={getSummaryValueText(filter)}
                                            index={index}
                                            onRemove={(index) => handleRemoveFilter(index, formikProps)}
                                        />
                                    </div>
                                )}

                                <div className="d-flex justify-content-between py-2 align-items-center">
                                    {show.addFilter &&
                                        <AddFilter
                                            filterPresets={filterPresets}
                                            filters={formikProps.values.filters}
                                            filterOptions={options}
                                            currentNumberOfFilters={formikProps.values.filters.length}
                                            onDone={(filters, selectedFilter) => handleAddFilterDone(filters, formikProps, selectedFilter)}
                                            onHide={() => setShow({ ...show, addFilter: false })}
                                        />
                                    }
                                    <span type="button" className="cdp-text-primary filter__add-filter" onClick={() => setShow({ ...show, addFilter: true })}>
                                        <i class="fas fa-plus"></i> Add Filter
                                    </span>
                                    {formikProps.values.filters.length > 0 &&
                                        <span className="small" type="button" onClick={() => handleRemoveAll(formikProps)}>Remove All</span>
                                    }

                                </div>
                                {(formikProps.values.filters.length > 1) &&
                                    <div className="d-flex flex-column">
                                        <div className="d-flex justify-content-between">
                                            <span type="button" className="cdp-text-primary mb-2 pt-2" onClick={() => null}>
                                                Add Filter Logic
                                            </span>
                                        </div>
                                        <FilterLogic
                                            className=""
                                            logic={formikProps.values.logic}
                                            numberOfFilters={formikProps.values.filters.length}
                                            onLogicChange={(logic) => formikProps.setFieldValue('logic', logic)}
                                        />
                                        <div className="invalid-feedback">
                                            <ErrorMessage name="logic" />
                                        </div>
                                    </div>
                                }
                                {formikProps.values.filters.length > 0 &&
                            <React.Fragment>
                                <label className="d-flex  align-items-center border-top mt-3 pt-2">
                                    <span className="switch-label text-left pr-3">Save Filter</span>
                                    <span className="switch">
                                        <input
                                            className="custom-control-input"
                                            type="checkbox"
                                            name="shouldSaveFilter"
                                            checked={formikProps.values.shouldSaveFilter}
                                            value={formikProps.values.shouldSaveFilter}
                                            onChange={(e) => {
                                                formikProps.setFieldTouched('shouldSaveFilter');
                                                formikProps.handleChange(e);
                                            }}
                                        />
                                        <span className="slider round"></span>
                                    </span>
                                </label>
                                {formikProps.values.shouldSaveFilter &&
                                    <React.Fragment>
                                        {formikProps.values.selectedSettingID && hasFilterBeenModified(formikProps.values) && <div role="group" aria-labelledby="my-radio-group">
                                            <div class="custom-control custom-radio">
                                                <input type="radio" class="custom-control-input mr-2" id="save_existing" name="saveType" value="save_existing" onChange={(e) => formikProps.handleChange(e)} checked={formikProps.values.saveType === 'save_existing'} />
                                                <label class="custom-control-label" type="button" for="save_existing">Save existing</label>
                                            </div>
                                            <div class="custom-control custom-radio my-2">
                                                <input type="radio" class="custom-control-input mr-2" id="save_as_new" name="saveType" value="save_as_new" onChange={(e) => formikProps.handleChange(e)} checked={formikProps.values.saveType === 'save_as_new'} />
                                                <label class="custom-control-label" type="button" for="save_as_new">Save as new</label>
                                            </div>
                                        </div>}
                                        <div className="">
                                            <Field
                                                className="form-control form-control-sm"
                                                name="filterSettingName"
                                                placeholder="Add filter setting name"
                                            />
                                            {/* {formikProps.touched.filterSettingName && formikProps.values.filterSettingName.length === 0 &&
                                                <div className="invalid-feedback">This field cannot be empty.</div>
                                            } */}
                                            <div className="invalid-feedback">
                                                <ErrorMessage name="filterSettingName" />
                                            </div>
                                        </div>
                                    </React.Fragment>
                                }
                            </React.Fragment>
                        }

                            </div>
                    <div className="p-3 d-flex filter__section-btn">
                        <Button
                            className="btn cdp-btn-secondary mr-1 btn-block text-white"
                            label={formikProps.values.shouldSaveFilter ? "Save & Execute" : "Execute"}
                            onClick={formikProps.submitForm}
                            disabled={formikProps.values.filters.length === 0 || !onExecute}
                        />
                        <Button
                            className="btn cdp-btn-outline-primary ml-1 btn-block mt-0 w-auto"
                            label="Close"
                            onClick={handleClose}
                        />
                    </div>
                </div>
            </div>
            }
        </Formik>
}

export default React.forwardRef(MultiFilter);

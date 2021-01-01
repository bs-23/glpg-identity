import React, { useState, useRef, useImperativeHandle } from 'react';
import { Formik, Field } from 'formik';
import _ from 'lodash';

import { Button } from '../common';
import AddFilter from '../AddFilter/add-filter.component';
import { FilterSummary, FilterLogic } from './components';

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
    // const [selectedFilter, setSelectedFilter] = useState(null);

    const formikRef = useRef();
    const formikBag = formikRef.current;

    const resetFilter = () => {
        formikBag.resetForm({
            scope: '',
            filters: [],
            logic: '',
            shouldSaveFilter: false,
            filterSettingName: '',
            selectedSettingID: ''
        });
    };

    const handleOnClick = (e) => {
        if(e.target === e.currentTarget) if(hideOnClickAway === true) onHide();
    };

    const handleAddFilterDone = (filters, formikProps, selectedFilter) => {
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

        formikProps.setFieldValue('filters', allUniqueFilters);

        // const logic = filterPresets && filterPresets.length
        //     ? filterPresets.find(fp => fp.id === selectedFilter?.id)?.settings.logic
        //     : '';
        // formikProps.setFieldValue('logic', logic);

        // if(!formikProps.values.selectedSettingID && selectedFilter) {
        //     formikProps.setFieldValue('selectedSettingID', selectedFilter.id);
        //     formikProps.setFieldValue('filterSettingName', selectedFilter.title);
        //     formikProps.setFieldValue('logic', selectedFilter.settings.logic);
        // }

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

    const handleRemoveFilter = (index, props) => {
        const allFilters = props.values.filters;
        if(allFilters) {
            const allFiltersAfterRemoval = allFilters.filter((value, ind) => ind !== index).map((filter, index) => {
                filter.name = String(index+1);
                return filter;
            });
            props.setFieldValue('filters', allFiltersAfterRemoval);
        }
    };

    const handleRemoveAll = (props) => {
        props.setFieldValue('filters', []);
        props.setFieldValue('logic', '');
        props.setFieldValue('shouldSaveFilter', false);
    };

    const handleExecute = (values, actions) => {
        actions.setFieldValue('lastAppliedFilters', values.filters);
        actions.setFieldValue('lastAppliedLogic', values.logic);
        if(!values.shouldSaveFilter && values.selectedSettingID) {
            const selectedPreset = filterPresets.find(f => f.id === values.selectedSettingID);
            if(
                (selectedSetting && !_.isEqual(selectedSetting.filters, values.filters)) ||
                (selectedPreset && !_.isEqual(selectedPreset.settings.filters, values.filters))
            ) {
                actions.setFieldValue('selectedSettingID', '');
                actions.setFieldValue('filterSettingName', '');
                actions.setFieldValue('isChosenFromExisting', 'false');
                values.selectedSettingID = '';
                values.filterSettingName = '';
            }
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

        if(selectedPresetID === '') {
            formikBag.setFieldValue('selectedSettingID', '');
            formikBag.setFieldValue('filterSettingName', '');
            formikBag.setFieldValue('filters', []);
            formikBag.setFieldValue('logic', '');
            formikBag.setFieldValue('shouldSaveFilter', false);
            return;
        }

        const filterPreset = filterPresets.find(fp => fp.id === selectedPresetID);

        if(!filterPreset) return;

        const { filters, logic } = filterPreset.settings;

        formikBag.setFieldValue('selectedSettingID', selectedPresetID);
        formikBag.setFieldValue('filterSettingName', filterPreset.title);
        formikBag.setFieldValue('filters', filters);
        formikBag.setFieldValue('logic', logic);
        formikBag.setFieldValue('shouldSaveFilter', true);
    }

    const handleChooseFromExisting = (e, formikProps) => {
        const value = e.target.value;
        formikProps.setFieldValue('isChosenFromExisting', value);
        formikProps.setFieldValue('filters', []);
        formikProps.setFieldValue('logic', '');
        formikProps.setFieldValue('selectedSettingID', '');
        formikProps.setFieldValue('filterSettingName', '');
        formikProps.setFieldValue('scope', '');
        formikProps.setFieldValue('shouldSaveFilter', true);
        formikProps.setFieldValue('lastAppliedFilters', []);
        formikProps.setFieldValue('lastAppliedLogic', []);
    }

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
                    lastAppliedFilters: selectedSetting
                        ? selectedSetting.filters
                        : [],
                    lastAppliedLogic: selectedSetting
                        ? selectedSetting.logic
                        : '',
                    isChosenFromExisting: selectedSettingID ? 'true' : 'false'
                }}
                enableReinitialize
            >
                {(formikProps) =>
                    showSidePanel &&
                    <div className="filter" onClick={handleOnClick}>
                        <div className="filter__panel">
                            <h3 className="px-3 pt-3 cdp-text-primary filter__header">Filters</h3>
                            <div className="bg-light p-3 filter__section">
                                {scopeOptions && <div className="mb-3">
                                    <label className="d-block mb-1" for="scope">
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
                                </div>}
                                <div role="group" aria-labelledby="my-radio-group">
                                    <label>
                                        <Field
                                            className="mr-2"
                                            type="radio"
                                            name="isChosenFromExisting"
                                            value="false"
                                            onChange={(e) => handleChooseFromExisting(e, formikProps)}
                                        />
                                        Create New
                                    </label>
                                    <label>
                                        <Field
                                            className="mr-2"
                                            type="radio"
                                            name="isChosenFromExisting"
                                            value="true"
                                            onChange={(e) => handleChooseFromExisting(e, formikProps)}
                                        />
                                        Choose From Existing
                                    </label>
                                </div>
                                {
                                    formikProps.values.isChosenFromExisting === 'true' && filterPresets && filterPresets.length > 0 &&
                                    <div className="mb-2">
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
                                    <div className="mb-3" key={filter.name}>
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
                                    <span type="button" className="cdp-text-primary" onClick={() => setShow({ ...show, addFilter: true })}>
                                        <i class="fas fa-plus"></i> Add Filter
                                    </span>
                                    {formikProps.values.filters.length > 0 &&
                                        <span className="small" type="button" onClick={() => handleRemoveAll(formikProps)}>Remove All</span>
                                    }
                                </div>
                                {formikProps.values.filters.length > 1 &&
                                    <div className="d-flex flex-column">
                                        <div className="d-flex justify-content-between">
                                            <span type="button" className="cdp-text-primary mb-2" onClick={() => null}>
                                                Add Filter Logic
                                            </span>
                                        </div>
                                        <FilterLogic
                                            className=""
                                            logic={formikProps.values.logic}
                                            numberOfFilters={formikProps.values.filters.length}
                                            onLogicChange={(logic) => formikProps.setFieldValue('logic', logic)}
                                        />
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
                                            onChange={(e) => formikProps.handleChange(e)}
                                        />
                                        <span className="slider round"></span>
                                    </span>
                                </label>
                                {formikProps.values.shouldSaveFilter &&
                                    <div className="">
                                        <Field
                                            className="form-control form-control-sm"
                                            name="filterSettingName"
                                            placeholder="Add filter setting name"
                                        />
                                    </div>
                                }
                            </React.Fragment>
                        }
                        {show.addFilter &&
                            <AddFilter
                                filterPresets={filterPresets}
                                filters={formikProps.values.filters}
                                filterOptions={options}
                                currentNumberOfFilters={formikProps.values.filters.length}
                                onDone={(filters, selectedFilter) => handleAddFilterDone(filters, formikProps, selectedFilter)}
                            />
                        }
                            </div>

                            <div className="p-3 d-flex filter__section-btn">
                                <Button
                                    className="btn cdp-btn-secondary mr-1 btn-block text-white"
                                    label={formikProps.values.shouldSaveFilter ? "Save and Execute" : "Execute"}
                                    onClick={formikProps.submitForm}
                                    disabled={formikProps.values.filters.length === 0}
                                />
                                <Button
                                    className="btn cdp-btn-outline-primary ml-1 btn-block mt-0"
                                    label="Close"
                                    onClick={onHide}
                                />
                            </div>
                            </div>
                    </div>
                }
            </Formik>
}

export default React.forwardRef(MultiFilter);

import React from 'react';
import { Field } from 'formik';
import Input from './input.component';
import Select from 'react-select';
import { WithContext as ReactTags } from 'react-tag-input';

const Filter = (props) => {
    const {
        name,
        index,
        value,
        fieldValue,
        operatorValue,
        filterOptions,
        currentNumberOfFilters,
        isTouched,
        validationError,
        onChange,
        onRemove
    } = props;

    const type = filterOptions.find(filter => filter.fieldName === fieldValue)?.valueType || 'text';

    const getOptions = () => {
        const filter = filterOptions.find(filter => filter.fieldName === fieldValue);
        const selectOptions = filter && filter.options ? filter.options : [];
        return selectOptions.map(s => ({ label: s.displayText, value: s.value }));
    };

    const getSelectedOptions = () => {
        const selectedOptions = (getOptions()).filter(o => (value || []).some(v => v === o.value));
        return selectedOptions;
    };

    const handleDelete = (i) => {
        const newValues = [...value];
        newValues.splice(i, 1);
        onChange('value', newValues, index);
    };

    const handleAddition = (tag) => {
        onChange('value', [...value, tag.text], index);
    };

    const handleInputBlur = (tagText) => {
        if (tagText) onChange('value', [...value, tagText], index);
    };

    const getTags = () => {
        return (value || []).map(v => ({ id: v, text: v }));
    };


    return <div className="pb-3 mb-3 border-bottom">
        <div className="d-flex justify-content-between">
            <div className="mr-2 cdp-text-secondary">Filter {currentNumberOfFilters+index+1}</div>
            <i className="fas fa-times mr-2 text-danger" onClick={() => onRemove(index)} />
        </div>
        <div>
            <label className="pt-2 mb-1 small font-weight-bold" for="field">
                Field
            </label>
            <Field
                className="form-control form-control-sm"
                id="field"
                as="select"
                name="fieldName"
                value={fieldValue}
                onChange={(e) => onChange(e.target.name, e.target.value, index)}
            >
                <option className="p-2" value=''> Select an Option </option>
                {filterOptions && filterOptions.map(filter => <option key={filter.fieldName} value={filter.fieldName} >{filter.displayText}</option>)}
            </Field>
            {isTouched && <div className="invalid-feedback">{validationError.fieldName}</div>}
        </div>
        <div>
            <label className="pt-2 mb-1 small font-weight-bold" for="operator">
                Operator
            </label>
            <Field
                className="form-control form-control-sm"
                id="operator"
                as="select"
                name="operator"
                value={operatorValue}
                onChange={(e) => onChange(e.target.name, e.target.value, index)}
            >
                <>
                    <option className="p-2" value=''> Select an Option </option>
                    {filterOptions && filterOptions.find(filter => filter.fieldName === fieldValue)?.operators?.map(item => <option key={item.key} value={item.key} >{item.displayText}</option>)}
                </>
            </Field>
            {isTouched && <div className="invalid-feedback">{validationError.operator}</div>}
        </div>
        <div>
            <label className="pt-2 mb-1 small font-weight-bold" for="value">
                Value
            </label>

            {type === 'select' &&
                <React.Fragment>
                    <Select
                        defaultValue={[]}
                        isMulti={true}
                        name={fieldValue}
                        hideSelectedOptions={false}
                        options={getOptions()}
                        className="multiselect"
                        classNamePrefix="multiselect"
                        value={getSelectedOptions()}
                        onChange={selectedOption => {
                            const value = selectedOption.map(o => o.value);
                            onChange('value', value, index);
                        }}
                    />
                    {isTouched && <div className="invalid-feedback">{validationError.value}</div>}
                </React.Fragment>
            }

            {type === 'text' &&
                <div>
                    <ReactTags
                        tags={getTags()}
                        delimiters={[13]} // key codes for Enter
                        handleDelete={handleDelete}
                        handleAddition={handleAddition}
                        handleInputBlur={handleInputBlur}
                    />
                    {isTouched && <div className="invalid-feedback">{validationError.value}</div>}
                </div>
            }

            {type !== 'text' && type !== 'select' &&
                <React.Fragment>
                    <Input
                        className="form-control form-control-sm"
                        id="value"
                        name="value"
                        value={value}
                        type={type}
                        onChange={(e) => onChange(e.target.name, [...value, e.target.value], index)}
                    />
                    {isTouched && <div className="invalid-feedback">{validationError.value}</div>}
                </React.Fragment>
            }
        </div>
    </div>
}

export default Filter;

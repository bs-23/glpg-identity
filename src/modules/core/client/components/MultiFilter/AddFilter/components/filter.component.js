import React from 'react';
import { Field } from 'formik';
import Input from './input.component';
import Select, { components } from 'react-select';

const Filter = (props) => {
    const {
        name,
        index,
        value,
        fieldValue,
        operatorValue,
        filterOptions,
        onChange,
        onRemove
    } = props;

    const type = filterOptions.find(filter => filter.fieldName === fieldValue)?.valueType;

    const getOptions = () => {
        const filter = filterOptions.find(filter => filter.fieldName === fieldValue);
        const selectOptions = filter && filter.options ? filter.options : [];
        return selectOptions.map(s => ({ label: s.displayText, value: s.value }));
    };

    const getSelectedOptions = () => {
        const selectedOptions = (getOptions()).filter(o => (value || []).some(v => v === o.value));
        return selectedOptions;
    };

    return <div className="pb-2">
        <div className="d-flex">
            <div className="d-flex w-100 mr-2"></div>
            <i className="fas fa-times mr-2" onClick={() => onRemove(index)} />
        </div>
        <div>
            <label className="pt-2 mb-1" for="field">
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
        </div>
        <div>
            <label className="pt-2 mb-1" for="operator">
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
        </div>
        <div>
            <label className="pt-2 mb-1" for="value">
                Value
            </label>
            {/* <Field
                className="form-control form-control-sm"
                id="value"
                name="value"
                value={value}
                onChange={(e) => onChange(e, index)}
            ></Field> */}
            {type === 'select'
                ? <Select
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
                : <Input
                    className="form-control form-control-sm"
                    id="value"
                    name="value"
                    value={value}
                    type={type || 'text'}
                    onChange={(e) => onChange(e.target.name, e.target.value, index)}
                />}
        </div>
    </div>
}

export default Filter;

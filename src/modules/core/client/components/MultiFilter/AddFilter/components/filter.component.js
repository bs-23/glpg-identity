import React from 'react';
import { Field } from 'formik';
import Input from './input.component';

const Filter = (props) => {
    const {
        name,
        index,
        value,
        fieldValue,
        operatorValue,
        filterOptions,
        onChange
    } = props;

    return <div className="pb-2">
        <div className="cdp-text-secondary font-weight-bold">{name}</div>
        <div>
            <label className="pt-2 mb-1" for="field">
                Field
            </label>
            <Field
                className="form-control form-control-sm"
                id="field"
                as="select"
                name="field"
                value={fieldValue}
                onChange={(e) => onChange(e, index)}
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
                onChange={(e) => onChange(e, index)}
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
            {<Input
                className="form-control form-control-sm"
                id="value"
                name="value"
                value={value}
                selectOptions={filterOptions && filterOptions.find(filter => filter.fieldName === fieldValue)?.options}
                type={filterOptions && filterOptions.find(filter => filter.fieldName === fieldValue)?.valueType}
                onChange={(e) => onChange(e, index)}
            />}
        </div>
    </div>
}

export default Filter;

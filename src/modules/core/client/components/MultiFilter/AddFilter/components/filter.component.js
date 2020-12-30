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
        onChange,
        onRemove
    } = props;

    return <div className="pb-3 mb-3 border-bottom">
        <div className="d-flex justify-content-between">
            <div className="mr-2 cdp-text-secondary">Filter {index}</div>
            <i className="fas fa-times mr-2 text-danger" onClick={() => onRemove(index)} />
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

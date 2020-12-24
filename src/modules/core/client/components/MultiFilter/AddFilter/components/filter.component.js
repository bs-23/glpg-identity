import React from 'react';
import { Field } from 'formik';

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

    return <div>
        <span>{name}</span>
        <div>
            <label className="" for="field">
                Field
            </label>
            <Field
                className=""
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
            <label className="" for="operator">
                Operator
            </label>
            <Field
                className=""
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
            <label className="" for="value">
                Value
            </label>
            <Field
                className=""
                id="value"
                name="value"
                value={value}
                onChange={(e) => onChange(e, index)}
            ></Field>
        </div>
    </div>
}

export default Filter;

import React from 'react';
import { Field } from 'formik';

const Filter = (props) => {
    const {
        name,
        fields,
        fieldValue,
        operators,
        operatorValue,
        values
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
                value=""
            >
                <option className="p-2" value=''> Select an Option </option>
                {fields && fields.map(item => <option key={item.key} value={item.key} >{item.displayText}</option>)}
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
            >
                <option className="p-2" value=''> Select an Option </option>
                {operators && operators.map(item => <option key={item.key} value={item.key} >{item.displayText}</option>)}
            </Field>
        </div>
        <div>
            <label className="pt-2 mb-1" for="value">
                Value
            </label>
            <Field
                className="form-control form-control-sm"
                id="value"
                name="value"
                value=""
            ></Field>
        </div>
    </div>
}

export default Filter;

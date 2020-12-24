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
                value=""
            >
                <option className="p-2" value=''> Select an Option </option>
                {fields && fields.map(item => <option key={item.key} value={item.key} >{item.displayText}</option>)}
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
            >
                <option className="p-2" value=''> Select an Option </option>
                {operators && operators.map(item => <option key={item.key} value={item.key} >{item.displayText}</option>)}
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
                value=""
            ></Field>
        </div>
    </div>
}

export default Filter;

import React from 'react';
import { Field } from 'formik';

export default function Input (props) {
    const {
        type,
        selectOptions,
        value,
        ...rest
    } = props;

    if(type === 'text') return <Field
        type={type}
        value={value}
        {...rest}
    />

    if(type === 'select') return <Field
        as='select'
        value={value}
        {...rest}
    >
        <option  value=""> Select an option </option>
        {selectOptions && selectOptions.map(option => <option key={option.value} value={option.value}>{option.displayText}</option>)}
    </Field>

    if(type === 'date') {
        const dateValue = typeof value === 'string'
            ? value
            : value.length > 0
                ? value[value.length-1]
                : '';

        return <Field
            type={type}
            value={dateValue}
            max={"9999-12-31"}
            {...rest}
        />
    }

    return <Field
        type="text"
        value={value}
        {...rest}
    />
}

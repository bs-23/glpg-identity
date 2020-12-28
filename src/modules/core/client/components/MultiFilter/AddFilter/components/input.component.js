import React from 'react';
import { Field } from 'formik';

export default function Input (props) {
    const {
        type,
        selectOptions,
        ...rest
        // value,
        // className,
        // name,
        // onChange
    } = props;

    if(type === 'text') return <Field
        type={type}
        {...rest}
    />

    if(type === 'select') return <Field
        as='select'
        {...rest}
    >
        <option  value=""> Select an option </option>
        {selectOptions && selectOptions.map(option => <option key={option.value} value={option.value}>{option.displayText}</option>)}
    </Field>

    return <Field
        type={type}
        {...rest}
    />
}

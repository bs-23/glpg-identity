import React from 'react';
import { Field } from 'formik';

const EmailInput = ({ options, ...props }) => {
    return <Field
        type="email"
        className="form-control"
        autoFocus
        {...props}
    />
}

export default EmailInput;

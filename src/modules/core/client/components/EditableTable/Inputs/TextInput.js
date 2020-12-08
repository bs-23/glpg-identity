import React from 'react';
import { Field } from 'formik';

const TextEditor = (props) => {
    return <Field
            className="form-control"
            autoFocus
            {...props}
        />
}

export default TextEditor;

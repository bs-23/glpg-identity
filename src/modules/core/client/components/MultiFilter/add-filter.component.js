import React from 'react';
import { Field } from 'formik';

import { Button } from './UI-Elements';

const style = {
    container: {
        position: 'absolute',
        right: '20%',
        padding: '20px',
        background: 'white',
        border: '1px solid darkgreen',
        borderRadius: '5px',
        width: '20%'
    }
}

const AddFilter = (props) => {
    const { onDone } = props;

    return <div style={style.container}>
        <span>Add Filter</span>
        <div>
            <span>Filter 01</span>
            <div>
                <label className="" for="source">
                    Field
                </label>
                <Field
                    className=""
                    id="source"
                    as="select"
                    name="source"
                    value=""
                >
                    <option className="p-2" value=''> Select an Option </option>
                </Field>
            </div>
            <div>
                <label className="" for="source">
                    Operator
                </label>
                <Field
                    className=""
                    id="source"
                    as="select"
                    name="source"
                    value=""
                >
                    <option className="p-2" value=''> Select an Option </option>
                </Field>
            </div>
            <div>
                <label className="" for="source">
                    Value
                </label>
                <Field
                    className=""
                    id="source"
                    as="select"
                    name="source"
                    value=""
                >
                    <option className="p-2" value=''> Select an Option </option>
                </Field>
            </div>
        </div>
        <Button label="Done" onClick={onDone}/>
    </div>
}

export default AddFilter;

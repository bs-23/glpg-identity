import React, { useState } from 'react';
import { Formik, Field } from 'formik';

import { Button } from './UI-Elements';
import AddFilter from './add-filter.component';

const style = {
    container: {
        position: 'absolute',
        background: '#5a5a5a4a',
        right: '0px',
        top: '0px',
        bottom: '0px',
        left: '0px',
        display: 'flex',
        justifyContent: 'flex-end'
    },
    sidebar: {
        background: 'white',
        width: '20%',
        padding: '20px'
    }
}

const MultiFilter = (props) => {
    const { onHide, onExecute } = props;

    const [show, setShow] = useState({
        addFilter: false
    })

    const handleOnClick = (e) => {
        if(e.target === e.currentTarget) onHide();
    }

    return <div style={style.container} onClick={handleOnClick} >
        <div style={style.sidebar}>
            <span>Filters</span>
            <Formik
                onSubmit={onExecute}
                initialValues={{}}
            >
                {(formikProps) =>
                    <React.Fragment>
                        <div>
                            <Button label="Execute" onClick={formikProps.submitForm} />
                            <Button label="Cancel" onClick={onHide} />
                        </div>
                        <div>
                            <div>
                                <label className="" for="scope">
                                    Scope
                                </label>
                                <Field
                                    className=""
                                    id="scope"
                                    as="select"
                                    name="scope"
                                    value=""
                                >
                                    <option className="p-2" value=''> Select an Option </option>
                                </Field>
                            </div>
                            <div>
                                <label className="" for="source">
                                    Source
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
                            <span onClick={() => setShow({ ...show, addFilter: true })}>+ Add Filter</span>
                        </div>
                        {show.addFilter && <AddFilter onDone={() => setShow({ ...show, addFilter: false })} />}
                    </React.Fragment>
                }
            </Formik>
        </div>
    </div>
}

export default MultiFilter;

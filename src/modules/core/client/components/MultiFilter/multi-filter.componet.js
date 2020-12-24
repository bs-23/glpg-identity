import React, { useState } from 'react';
import { Formik, Field } from 'formik';

import { Button } from './common';
import AddFilter from './AddFilter/add-filter.component';

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
            <h3 className="px-3 pt-3 cdp-text-primary">Filters</h3>
            <Formik
                onSubmit={onExecute}
                initialValues={{
                    scope: '',
                    source: ''
                }}
            >
                {(formikProps) =>
                    <React.Fragment>
                        <div className="shadow-sm p-3 d-flex">
                            <Button className="btn cdp-btn-secondary mr-1 btn-block text-white" label="Execute" onClick={formikProps.submitForm} />
                            <Button className="btn cdp-btn-outline-primary ml-1 btn-block mt-0" label="Cancel" onClick={onHide} />
                        </div>
                        <div className="bg-light p-3">
                            <div className="mb-3">
                                <label className="d-block" for="scope">
                                    Scope
                                </label>
                                <Field
                                    className="form-control"
                                    id="scope"
                                    as="select"
                                    name="scope"
                                    value=""
                                >
                                    <option className="p-2" value=''> Select an Option </option>
                                </Field>
                            </div>
                            <div className="mb-3">
                                <label className="d-block" for="source">
                                    Source
                                </label>
                                <Field
                                    className="form-control"
                                    id="source"
                                    as="select"
                                    name="source"
                                    value=""
                                >
                                    <option className="p-2" value=''> Select an Option </option>
                                </Field>
                            </div>
                            <span className="cdp-text-primary" onClick={() => setShow({ ...show, addFilter: true })}><i class="fas fa-plus"></i> Add Filter</span>
                        </div>
                        {show.addFilter && <AddFilter onDone={() => setShow({ ...show, addFilter: false })} />}
                    </React.Fragment>
                }
            </Formik>
        </div>
    </div>
}

export default MultiFilter;

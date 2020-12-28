import React, { useState } from 'react';
import { Formik, Field } from 'formik';

import { Button } from '../common';
import AddFilter from '../AddFilter/add-filter.component';
import { FilterSummary } from './components';

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

const filters = [
    {
        name: 'Filter 01',
        field: 'last_name',
        operator: 'equal',
        value: ''
    }
]

const filterOptions = [
    {
        "fieldName": "first_name",
        "valueType": "text",
        "displayText": "First Name",
        "operators": [
            {
                "key": "equal",
                "displayText": "Equals to"
            },
            {
                "key": "contains",
                "displayText": "Contains"
            },
            {
                "key": "starts-with",
                "displayText": "Starts With"
            }
        ]
    },
    {
        "fieldName": "last_name",
        "valueType": "text",
        "displayText": "Last Name",
        "operators": [
            {
                "key": "equal",
                "displayText": "Equals to"
            },
            {
                "key": "contains",
                "displayText": "Contains"
            },
            {
                "key": "starts-with",
                "displayText": "Starts With"
            }
        ]
    },
    {
        "fieldName": "email",
        "valueType": "text",
        "displayText": "Email",
        "operators": [
            {
                "key": "equal",
                "displayText": "Equals to"
            },
            {
                "key": "contains",
                "displayText": "Contains"
            },
            {
                "key": "starts-with",
                "displayText": "Starts With"
            }
        ]
    },
    {
        "fieldName": "countries",
        "valueType": "select",
        "displayText": "Country",
        "operators": [
            {
                "key": "equal",
                "displayText": "Equals to"
            }
        ],
        "options": [
            {
                "key": "BE",
                "displayText": "Belgium"
            },
            {
                "key": "FR",
                "displayText": "France"
            },
            {
                "key": "DE",
                "displayText": "Germany"
            },
            {
                "key": "IT",
                "displayText": "Italy"
            },
            {
                "key": "NL",
                "displayText": "Netherlands"
            },
            {
                "key": "ES",
                "displayText": "Spain"
            },
            {
                "key": "GB",
                "displayText": "United Kingdom"
            }
        ]
    },
    {
        "fieldName": "created_at",
        "valueType": "date",
        "displayText": "Creation Date",
        "operators": [
            {
                "key": "equal",
                "displayText": "Equals to"
            },
            {
                "key": "less-than",
                "displayText": "Before"
            },
            {
                "key": "greater-than",
                "displayText": "After"
            }
        ]
    },
    {
        "fieldName": "expiry_date",
        "valueType": "date",
        "displayText": "Expiry Date",
        "operators": [
            {
                "key": "equal",
                "displayText": "Equals to"
            },
            {
                "key": "less-than",
                "displayText": "Before"
            },
            {
                "key": "greater-than",
                "displayText": "After"
            }
        ]
    },
    {
        "fieldName": "created_by",
        "valueType": "text",
        "displayText": "Created By",
        "operators": [
            {
                "key": "equal",
                "displayText": "Equals to"
            },
            {
                "key": "contains",
                "displayText": "Contains"
            },
            {
                "key": "starts-with",
                "displayText": "Starts With"
            }
        ]
    }
];

const MultiFilter = (props) => {
    const { onHide, onExecute, hideOnClickAway } = props;

    const [show, setShow] = useState({
        addFilter: false
    })

    const handleOnClick = (e) => {
        if(e.target === e.currentTarget) if(hideOnClickAway === true) onHide();
    }

    const handleAddFilterDone = (filters, formikProps) => {
        formikProps.setFieldValue('filters', filters);
        setShow({ ...show, addFilter: false });
    }

    const getFieldDisplayText = (fieldName) => {
        const filter = filterOptions.find(filter => filter.fieldName === fieldName);
        return filter ? filter.displayText : '';
    }

    const getOperatorDisplayText = (fieldName, operatorName) => {
        const filter = filterOptions.find(filter => filter.fieldName === fieldName);
        if(!filter) return '';
        const operator = filter.operators.find(op => op.key === operatorName);
        return operator ? operator.displayText : '';
    }

    const handleRemoveFilter = (index, props) => {
        const allFilers = props.values.filters;
        if(allFilers) {
            props.setFieldValue('filters', allFilers.filter((value, ind) => ind !== index));
        }
    }

    return <div style={style.container} onClick={handleOnClick} >
        <div style={style.sidebar}>
            <h3 className="px-3 pt-3 cdp-text-primary">Filters</h3>
            <Formik
                onSubmit={onExecute}
                initialValues={{
                    scope: '',
                    source: '',
                    filters: filters || []
                }}
                enableReinitialize
            >
                {(formikProps) =>
                    <React.Fragment>
                        <div className="shadow-sm p-3 d-flex">
                            <Button className="btn cdp-btn-secondary mr-1 btn-block text-white" label="Execute" onClick={formikProps.submitForm} />
                            <Button className="btn cdp-btn-outline-primary ml-1 btn-block mt-0" label="Cancel" onClick={onHide} />
                        </div>
                        <div className="bg-light p-3">
                            {formikProps.values.filters.map((filter, index) =>
                                <div className="mb-3" key={filter.name}>
                                    <FilterSummary
                                        fieldName={getFieldDisplayText(filter.field)}
                                        operatorName={getOperatorDisplayText(filter.field, filter.operator)}
                                        values={filter.value}
                                        index={index}
                                        onRemove={(index) => handleRemoveFilter(index, formikProps)}
                                    />
                                </div>
                            )}
                            <div className="mb-3">
                                <label className="d-block pt-2 mb-1" for="scope">
                                    Scope
                                </label>
                                <Field
                                    className="form-control form-control-sm"
                                    id="scope"
                                    as="select"
                                    name="scope"
                                    value=""
                                >
                                    <option className="p-2" value=''> Select an Option </option>
                                </Field>
                            </div>
                            <div className="mb-3">
                                <label className="d-block pt-2 mb-1" for="source">
                                    Source
                                </label>
                                <Field
                                    className="form-control form-control-sm"
                                    id="source"
                                    as="select"
                                    name="source"
                                    value=""
                                >
                                    <option className="p-2" value=''> Select an Option </option>
                                </Field>
                            </div>
                            <span type="button" className="cdp-text-primary" onClick={() => setShow({ ...show, addFilter: true })}><i class="fas fa-plus"></i> Add Filter</span>
                        </div>
                        {show.addFilter && <AddFilter
                            filters={formikProps.values.filters}
                            filterOptions={filterOptions}
                            onDone={(filters) => handleAddFilterDone(filters, formikProps)}
                        />}
                    </React.Fragment>
                }
            </Formik>
        </div>
    </div>
}

export default MultiFilter;

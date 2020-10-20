
import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal'
import { Form, Formik, Field } from "formik";
import axios from 'axios';
import { useToasts } from 'react-toast-notifications';
import optTypes from '../opt-types.json';

const CountryConsentForm = (props) => {
    const [, setShow] = useState(false);
    const [country, setCountry] = useState(false);
    const { addToast } = useToasts();
    const handleClose = () => {
        setShow(false);
        props.changeShow(false);
    }

    useEffect(() => {
        if (props.countries && props.editable) {
            setCountry(props.countries.find(x => x.country_iso2.toLowerCase() === props.options.country_iso2.toLowerCase()));
        }

    });

    return (
        <Modal show={props.show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>{props.editable ? 'Manage opt type' : 'Assign consent to country'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {props.consents.length > 0 && props.countries.length > 0 &&
                    <div className="consent-manage p-3">
                        <Formik
                            initialValues={{
                                consent_id: props.consents[0].id,
                                country_iso2: props.editable ? country.country_iso2 : props.countries[0].country_iso2,
                                opt_type: optTypes[0].value
                            }}
                            displayName="ConsentForm"
                            onSubmit={(values, actions) => {
                                if (!props.editable) {
                                    axios.post('/api/consent/country', values).then(() => {
                                        actions.resetForm();
                                        addToast('Consent assigned successfully', {
                                            appearance: 'success',
                                            autoDismiss: true
                                        });
                                        handleClose();

                                    }).catch(error => {
                                        addToast(error.response.data, {
                                            appearance: 'error',
                                            autoDismiss: true
                                        });
                                    }).finally(function () {
                                        actions.setSubmitting(false);

                                    });
                                }
                            }}
                        >
                            {formikProps => (
                                <Form onSubmit={formikProps.handleSubmit}>
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="form-group">
                                                <label className="font-weight-bold" htmlFor="country_iso2">Select Country <span className="text-danger">*</span></label>
                                                <Field disabled={props.editable ? true : false} data-testid="country_iso2" as="select" name="country_iso2" className="form-control">
                                                    {props.countries.map(item => <option key={item.countryid} value={item.country_iso2}>{props.editable ? country.codbase_desc : item.codbase_desc}</option>)}
                                                </Field>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="form-group">
                                                <label className="font-weight-bold" htmlFor="consent_id">Select Consent <span className="text-danger">*</span></label>
                                                <Field disabled={props.editable ? true : false} data-testid="consent" as="select" name="consent_id" className="form-control">
                                                    {props.consents.map(item => <option key={item.id} value={item.id}>{props.editable ? props.options.title : item.title}</option>)}
                                                </Field>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="form-group">
                                                <label className="font-weight-bold" htmlFor="opt_type">Select Opt Type <span className="text-danger">*</span></label>
                                                <Field data-testid="opt_type" as="select" name="opt_type" className="form-control">
                                                    {
                                                        optTypes.map(optType => (
                                                            <option key={optType.value} value={optType.value}>{optType.text}</option>
                                                        ))
                                                    }
                                                </Field>
                                            </div>
                                        </div>
                                        <button type="submit" className="btn btn-primary mr-2">
                                            Save Changes
                                        </button>
                                        <button type="button" className="btn btn-secondary" onClick={handleClose}>
                                            Close
                                        </button>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </div>
                }
            </Modal.Body>
        </Modal>
    );
}

export default CountryConsentForm;

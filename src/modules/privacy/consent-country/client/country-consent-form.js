import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal'
import { Form, Formik, Field, ErrorMessage } from "formik";
import { useToasts } from 'react-toast-notifications';
import { useDispatch, useSelector } from 'react-redux';

import optTypes from '../../manage-consent/client/opt-types.json';
import { updateCountryConsent, createCountryConsent} from './consent-country.actions';
import { countryConsentSchema } from './consent-country.schema';


const CountryConsentForm = (props) => {
    const [, setShow] = useState(false);
    const [country, setCountry] = useState(false);
    const countries = useSelector(state => state.countryReducer.countries);
    const { addToast } = useToasts();
    const dispatch = useDispatch();
    const handleClose = () => {
        setShow(false);
        props.changeShow(false);
    };
    const showToast = (msg, type) => {
        addToast(msg, {
            appearance: type,
            autoDismiss: true
        });
    };

    useEffect(() => {
        if (props.editable) {
            setCountry(countries.find(x => x.country_iso2.toLowerCase() === props.options.country_iso2.toLowerCase()));
        }
    });

    return (
        <Modal centered show={props.show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title className="modal-title_small">{props.editable ? 'Manage opt type' : 'Assign consent to country'}</Modal.Title>
            </Modal.Header>

            {props.consents.length > 0 &&
                <div className="consent-manage">
                    <Formik
                        initialValues={{
                            consent_category: props.editable ? props.options.category_id: "",
                            consent_id: props.editable ? props.options.country_consent_id : "",
                            country_iso2: props.editable ? props.options.country_iso2 : "",
                            opt_type: props.editable && props.options.optType ? props.options.optType.value : ""
                        }}
                        validationSchema={countryConsentSchema}
                        displayName="ConsentForm"
                        onSubmit={(values, actions) => {
                            if (!props.editable) {
                                dispatch(createCountryConsent(values)).then(() => {
                                    actions.resetForm();
                                    showToast('Consent assigned successfully', 'success');
                                    handleClose();
                                }).catch(error => {
                                    showToast(error.response.data, 'error');
                                }).finally(function () {
                                    actions.setSubmitting(false);

                                });
                            } else {
                                dispatch(updateCountryConsent(props.options.country_consent_id, { opt_type: values.opt_type })).then(() => {
                                    actions.resetForm();
                                    showToast('Opt in changed successfully', 'success');
                                    handleClose();
                                }).catch(error => {
                                    showToast(error.response.data, 'error');
                                }).finally(function () {
                                    actions.setSubmitting(false);
                                });
                            }
                        }}
                    >
                        {formikProps => (
                            <Form onSubmit={formikProps.handleSubmit}>
                                <Modal.Body className="p-4">
                                    <div className="row">
                                    <div className="col-12">
                                        <div className="form-group">
                                            <label className="font-weight-bold" htmlFor="consent_category">Select Consent Category <span className="text-danger">*</span></label>
                                            <Field disabled={props.editable ? true : false} data-testid="consent_category" as="select" name="consent_category" className="form-control">
                                                <option key="select-consent-category" value="" disabled>--Select Consent Category--</option>
                                                {props.consentCategories.map(category=>{
                                                   return <option key={category.id} value={category.id}>{category.title}</option>
                                                })
                                                }
                                            </Field>
                                            <div className="invalid-feedback"><ErrorMessage name="consent_category" /></div>
                                        </div>
                                    </div>
                                        <div className="col-12">
                                            <div className="form-group">
                                                <label className="font-weight-bold" htmlFor="consent_id">Select Consent <span className="text-danger">*</span></label>
                                                <Field disabled={props.editable ? true : false} data-testid="consent" as="select" name="consent_id" className="form-control">
                                                    <option key="select-consent" value="" disabled>--Select Consent--</option>
                                                {props.consents.map(item => formikProps.values.consent_category === item.category_id &&
                                                    <option key={item.id} value={item.id}>{props.editable ? props.options.preference + (props.options.is_active ? '' : ' (Inactive)') : item.preference + (item.is_active ? '' : ' (Inactive)')}</option> )}
                                                </Field>
                                                <div className="invalid-feedback"><ErrorMessage name="consent_id" /></div>
                                            </div>
                                        </div>
                                    <div className="col-12">
                                        <div className="form-group">
                                            <label className="font-weight-bold" htmlFor="country_iso2">Select Country <span className="text-danger">*</span></label>
                                            <Field disabled={props.editable ? true : false} data-testid="country_iso2" as="select" name="country_iso2" className="form-control">
                                                <option key="select-country" value="" disabled>--Select Country--</option>
                                                {props.editable && props.countries.length === 0 && <option value={country.country_iso2}>{country.codbase_desc}</option>}
                                                {props.countries.map(item => <option key={item.countryid} value={item.country_iso2}>{props.editable ? country.codbase_desc : item.codbase_desc}</option>)}
                                            </Field>
                                            <div className="invalid-feedback"><ErrorMessage name="country_iso2" /></div>
                                        </div>
                                    </div>
                                        <div className="col-12">
                                            <div className="form-group">
                                                <label className="font-weight-bold" htmlFor="opt_type">Select Opt Type <span className="text-danger">*</span></label>
                                                <Field data-testid="opt_type" as="select" name="opt_type" className="form-control">
                                                    <option key="select-opt-type" value="" disabled>--Select Opt Type--</option>
                                                    {
                                                        optTypes.map(optType => (
                                                            <option key={optType.value} value={optType.value}>{optType.text}</option>
                                                        ))
                                                    }
                                                </Field>
                                                <div className="invalid-feedback"><ErrorMessage name="opt_type" /></div>
                                            </div>
                                        </div>
                                    </div>
                                </Modal.Body>
                                <Modal.Footer>
                                    <button type="submit" className="btn cdp-btn-primary mr-2 text-white shadow-sm">Save Changes</button>
                                    <button type="button" className="btn cdp-btn-secondary text-white shadow-sm" onClick={handleClose}>Close</button>
                                </Modal.Footer>
                            </Form>
                        )}
                    </Formik>
                </div>
            }
        </Modal>
    );
}

export default CountryConsentForm;

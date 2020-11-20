import React, { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal'
import { Form, Formik, Field, ErrorMessage } from "formik";
import { useToasts } from 'react-toast-notifications';
import faqSchema from './faq.schema';

const FaqForm = (props) => {
    const [, setShow] = useState(false);
    const handleClose = () => {
        setShow(false);
        props.changeShow(false);
    };
    return (
        <Modal centered show={props.show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title className="modal-title_small">{props.editable ? 'Edit FAQ' : 'Add New FAQ'}</Modal.Title>
            </Modal.Header>

            {props.serviceCategory.length > 0 && props.serviceCategory.length > 0 &&
                <div className="consent-manage">
                    <Formik
                        initialValues={{
                            question: "",
                            service_categories: "",
                            answer: ""
                        }}
                        validationSchema={faqSchema}
                        displayName="FaqForm"
                        onSubmit={(values, actions) => {
                        }}
                    >
                        {formikProps => (
                            <Form onSubmit={formikProps.handleSubmit}>
                                <Modal.Body className="p-4">
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="form-group">
                                                <label className="font-weight-bold" htmlFor="country_iso2">Select Country <span className="text-danger">*</span></label>

                                                <div className="invalid-feedback"><ErrorMessage name="country_iso2" /></div>
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
    )
}

export default FaqForm;
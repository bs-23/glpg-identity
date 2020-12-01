import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { FaqCategorySchema } from './faq.schema';
import { Form, Formik, Field, ErrorMessage, FieldArray } from "formik";
import { useToasts } from 'react-toast-notifications';
import { createFaqCategory } from './faq.actions';
import { useDispatch } from 'react-redux';


export default function faqCategoryForm(props) {
    const [, setShow] = useState(false);
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

    return (
        <Modal dialogClassName="modal-90w modal-customize" centered show={props.show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>
                    FAQ Category
                    </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Formik
                    initialValues={{
                        title: ""
                    }}
                    displayName="FaqCategoryForm"
                    enableReinitialize={true}
                    validationSchema={FaqCategorySchema}
                    onSubmit={(values, actions) => {
                        console.log(values);
                        if (props.editMode) {

                        } else {
                            dispatch(createFaqCategory(values)).then(() => {
                                actions.resetForm();
                                showToast('FAQ Category created successfully', 'success');
                                handleClose();
                            }).catch(error => {
                                showToast(error.response.data, 'error');
                            }).finally(function () {
                                actions.setSubmitting(false);
                            });

                        }
                        actions.setSubmitting(false);
                    }}
                >
                    {formikProps => (
                        <Form onSubmit={formikProps.handleSubmit}>
                            <div className="row">
                                <div className="col-12 col-sm-12">
                                    <div className="form-group">
                                        <label className="font-weight-bold" htmlFor="title">Title <span className="text-danger">*</span></label>
                                        <Field data-testid="title" className="form-control" type="text" name="title" />
                                        <div className="invalid-feedback" data-testid="titleError"><ErrorMessage name="title" /></div>
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="btn btn-block text-white cdp-btn-secondary mt-4 p-2" disabled={formikProps.isSubmitting}>Save changes</button>
                        </Form>
                    )}
                </Formik>
            </Modal.Body>
        </Modal>
    )
}

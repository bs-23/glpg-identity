import axios from "axios";
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Form, Formik, Field, FieldArray, ErrorMessage } from "formik";
import { createConsent } from "../consent.action";
import { useToasts } from "react-toast-notifications";

const ConsentForm = () => {
    const { addToast } = useToasts();
    const [categories, setCategories] = useState([]);
    const [isActive, setIsActive] = useState(true);
    const [translations, setTranslations] = useState([]);

    const getTranslations = () => (
        <React.Fragment>
            <div className="col-12 col-sm-6">
                <div className="form-group">
                    <label className="font-weight-bold"> Locale <span className="text-danger">*</span></label>
                    <Field className="form-control" type="preference" name="preference" />
                    <div className="invalid-feedback"><ErrorMessage name="preference" /></div>
                </div>
            </div>

            <div className="col-12 col-sm-6">
                <div className="form-group">
                    <label className="font-weight-bold" htmlFor="preference"> Rich Text <span className="text-danger">*</span></label>
                    <Field className="form-control" type="preference" name="preference" />
                    <div className="invalid-feedback"><ErrorMessage name="preference" /></div>
                </div>
            </div>
        </React.Fragment>
    );

    useEffect(() => {
        async function getConsentCatogories() {
            const response = await axios.get('/api/consent/category');
            setCategories(response.data);
        }
        getConsentCatogories();
    }, []);

    return (
        <main className="app__content cdp-light-bg h-100">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb rounded-0">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item"><NavLink to="/consent/">Data Privacy & Consent Management</NavLink></li>
                                <li className="breadcrumb-item"><NavLink to="/consent/list">CDP Consents List</NavLink></li>
                                <li className="breadcrumb-item active"><span>Add new Consent</span></li>
                            </ol>
                        </nav>
                    </div>
                </div>
                {categories.length > 0 &&
                    <div className="row">
                        <div className="col-12">
                            <div className="shadow-sm bg-white mb-3">
                                <h2 className="d-flex align-items-center p-3 px-sm-4 py-sm-2 page-title light">
                                    <span className="page-title__text font-weight-bold py-3">Create New Consent</span>
                                </h2>
                                <div className="add-user p-3">
                                    <Formik
                                        initialValues={{
                                            category_id: categories[0].id,
                                            legal_basis: "consent",
                                            title: "",
                                            preference: "",
                                            translations: [],
                                            is_active: isActive
                                        }}
                                        displayName="ConsentForm"
                                        onSubmit={(values, actions) => {
                                            dispatch(createConsent(values))
                                                .then(res => {
                                                    actions.resetForm();
                                                    addToast('Consent created successfully', {
                                                        appearance: 'success',
                                                        autoDismiss: true
                                                    });
                                                }).catch(err => {
                                                    const errorMessage = typeof err.response.data === 'string' ? err.response.data : err.response.statusText
                                                    addToast(errorMessage, {
                                                        appearance: 'error',
                                                        autoDismiss: true
                                                    });
                                                });

                                            actions.setSubmitting(false);
                                        }}
                                    >
                                        {formikProps => (
                                            <Form onSubmit={formikProps.handleSubmit}>
                                                <div className="row">
                                                    <div className="col-12 col-lg-8 col-xl-6">
                                                        <div className="row">
                                                            <div className="col-12 col-sm-6">
                                                                <div className="form-group">
                                                                    <label className="font-weight-bold" htmlFor="category_id">Select Category <span className="text-danger">*</span></label>
                                                                    <Field data-testid="category" as="select" name="category_id" className="form-control">
                                                                        {categories.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
                                                                    </Field>
                                                                </div>
                                                            </div>

                                                            <div className="col-12 col-sm-6">
                                                                <div className="form-group">
                                                                    <label className="font-weight-bold" htmlFor="category_id">Select Legal Basis <span className="text-danger">*</span></label>
                                                                    <Field data-testid="legal_basis" as="select" name="legal_basis" className="form-control">
                                                                        {['consent', 'contract'].map(item => <option key={item} value={item}>{item}</option>)}
                                                                    </Field>
                                                                </div>
                                                            </div>

                                                            <div className="col-12 col-sm-6">
                                                                <div className="form-group">
                                                                    <label className="font-weight-bold" htmlFor="title"> Title <span className="text-danger">*</span></label>
                                                                    <Field className="form-control" type="name" name="title" />
                                                                    <div className="invalid-feedback"><ErrorMessage name="title" /></div>
                                                                </div>
                                                            </div>

                                                            <div className="col-12 col-sm-6">
                                                                <div className="form-group">
                                                                    <label className="font-weight-bold" htmlFor="preference"> Preference <span className="text-danger">*</span></label>
                                                                    <Field className="form-control" type="preference" name="preference" />
                                                                    <div className="invalid-feedback"><ErrorMessage name="preference" /></div>
                                                                </div>
                                                            </div>

                                                            {getTranslations()}

                                                            <div className="col-12 col-sm-7">
                                                                <div className="form-group">
                                                                    <label className="d-flex justify-content-between align-items-center">
                                                                        <span> Add more translations</span>
                                                                        <span>
                                                                            <button > + </button>
                                                                        </span>
                                                                    </label>
                                                                </div>
                                                            </div>

                                                            <div className="col-12 col-sm-6">
                                                                <div className="form-group">
                                                                    <label className="d-flex justify-content-between align-items-center">
                                                                        <span className="switch-label"> Status </span>
                                                                        <span className="switch">
                                                                            <input
                                                                                name="is_active"
                                                                                type="checkbox"
                                                                                value={isActive}
                                                                                checked={isActive}
                                                                                onChange={() => setIsActive(!isActive)}
                                                                            />
                                                                            <span className="slider round"></span>
                                                                        </span>
                                                                    </label>
                                                                </div>
                                                            </div>

                                                        </div>
                                                        <button type="submit" className="btn btn-block text-white cdp-btn-secondary mt-4 p-2" >Submit</button>
                                                    </div>
                                                </div>
                                            </Form>
                                        )}
                                    </Formik>
                                </div>
                            </div>
                        </div>
                    </div>
                }
            </div>

        </main>
    );
}

export default ConsentForm;

import Modal from 'react-bootstrap/Modal';
import { NavLink } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useToasts } from 'react-toast-notifications';
import { useSelector, useDispatch } from 'react-redux';
import { Form, Formik, Field, ErrorMessage } from 'formik';
import Faq from '../../../platform/faq/client/faq.component';
import CategorySchema from './category.schema';
import Dropdown from 'react-bootstrap/Dropdown';
import { getConsentCategories, getConsentCategory, createConsentCategory, updateConsentCategory } from './category.actions';

const ConsentCategories = () => {
    const dispatch = useDispatch();
    const { addToast } = useToasts();
    const [consentCategoryId, setConsentCategoryId] = useState(undefined);
    const [showForm, setShowForm] = useState(false);
    const [showFaq, setShowFaq] = useState(false);
    const handleCloseFaq = () => setShowFaq(false);
    const handleShowFaq = () => setShowFaq(true);

    const toggleForm = (id) => {
        setConsentCategoryId(id);
        setShowForm(!!id);
    };

    const consent_category = useSelector(state => state.consentCategoryReducer.consent_category);
    const consent_categories = useSelector(state => state.consentCategoryReducer.consent_categories);

    useEffect(() => {
        dispatch(getConsentCategories());
    }, []);

    useEffect(() => {
        if (consentCategoryId) {
            dispatch(getConsentCategory(consentCategoryId));
        }
    }, [consentCategoryId]);

    return (
        <main className="app__content cdp-light-bg h-100">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0">
                        <nav className="breadcrumb justify-content-between align-items-center" aria-label="breadcrumb">
                            <ol className="rounded-0 m-0 p-0 d-none d-sm-flex">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item"><NavLink to="/consent">Data Privacy & Consent Management</NavLink></li>
                                <li className="breadcrumb-item active"><span>Consent Categories</span></li>
                            </ol>
                            <Dropdown className="dropdown-customize breadcrumb__dropdown d-block d-sm-none ml-2">
                                <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle btn d-flex align-items-center border-0">
                                    <i className="fas fa-arrow-left mr-2"></i> Back
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item className="px-2" href="/"><i className="fas fa-link mr-2"></i> Dashboard</Dropdown.Item>
                                    <Dropdown.Item className="px-2" href="/consent"><i className="fas fa-link mr-2"></i> Data Privacy & Consent Management</Dropdown.Item>
                                    <Dropdown.Item className="px-2" active><i className="fas fa-link mr-2"></i> Consent Categories</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                            <span className="ml-auto mr-3"><i onClick={handleShowFaq} className="icon icon-help breadcrumb__faq-icon cdp-text-secondary cursor-pointer"></i></span>
                        </nav>
                        <Modal show={showFaq} onHide={handleCloseFaq} size="lg" centered>
                            <Modal.Header closeButton>
                                <Modal.Title>Questions You May Have</Modal.Title>
                            </Modal.Header>
                            <Modal.Body className="faq__in-modal"><Faq topic="configure-consent-category" /></Modal.Body>
                        </Modal>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <div className="d-flex justify-content-between align-items-center py-3 cdp-table__responsive-sticky-panel">
                            <h4 className="cdp-text-primary font-weight-bold mb-0 mb-sm-0 d-flex align-items-end pr-2">Consent Categories </h4>
                            <div class="d-flex justify-content-between align-items-center">
                                <button onClick={() => setShowForm(true)} className="btn cdp-btn-secondary text-white ml-2">
                                    <i className="icon icon-plus pr-1"></i> <span className="d-none d-sm-inline-block pl-1">Create new category</span>
                                </button>
                            </div>
                        </div>

                        {consent_categories.length > 0 &&
                            <div className="table-responsive shadow-sm bg-white mb-3 cdp-table__responsive-wrapper">
                            <table className="table table-hover table-sm mb-0 cdp-table cdp-table__responsive">
                                    <thead className="cdp-bg-primary text-white cdp-table__header">
                                        <tr>
                                            <th>Title</th>
                                            <th>Slug</th>
                                            <th>Created By</th>
                                            <th>Created Date</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="cdp-table__body bg-white">
                                        {consent_categories.map((row, index) => (
                                            <tr key={index}>
                                                <td data-for="Title">{row.title}</td>
                                                <td data-for="Slug">{row.slug}</td>
                                                <td data-for="Created By">{row.createdBy || '--'}</td>
                                                <td data-for="Created Date">{(new Date(row.created_at)).toLocaleDateString('en-GB').replace(/\//g, '.')}</td>
                                                <td data-for="Action">
                                                    <button className="btn cdp-btn-link-primary p-0 mr-3" onClick={() => { toggleForm(row.id) }}>
                                                        <i className="fas fa-pen mr-2"></i>Edit
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        }

                        {consent_categories.length === 0 &&
                            <div className="row justify-content-center mt-sm-5 pt-5 mb-3">
                                <div className="col-12 col-sm-6 py-4 bg-white shadow-sm rounded text-center">
                                    <i class="icon icon-team icon-6x cdp-text-secondary"></i>
                                    <h3 className="font-weight-bold cdp-text-primary pt-4">No data found!</h3>
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>

            <Modal dialogClassName="modal-90w modal-customize" centered show={showForm} onHide={toggleForm}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        Consent category
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Formik
                        initialValues={{
                            title: consentCategoryId && consent_category ? consent_category.title : ""
                        }}
                        displayName="ConsentCategoryForm"
                        enableReinitialize={true}
                        validationSchema={CategorySchema}
                        onSubmit={(values, actions) => {
                            if (consentCategoryId) {
                                dispatch(updateConsentCategory(consentCategoryId, values)).then(function () {
                                    toggleForm(null);
                                    addToast('Consent category updated successfully', {
                                        appearance: 'success',
                                        autoDismiss: true
                                    });
                                }).catch(error => {
                                    addToast(error.response.data, {
                                        appearance: 'error',
                                        autoDismiss: true
                                    });
                                });
                            } else {
                                dispatch(createConsentCategory(values)).then(function () {
                                    toggleForm(null);
                                    actions.resetForm();
                                    addToast('Consent category created successfully', {
                                        appearance: 'success',
                                        autoDismiss: true
                                    });
                                }).catch(error => {
                                    addToast(error.response.data, {
                                        appearance: 'error',
                                        autoDismiss: true
                                    });
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
        </main>
    );
}

export default ConsentCategories;

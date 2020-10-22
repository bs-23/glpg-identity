import Modal from 'react-bootstrap/Modal';
import { NavLink } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useToasts } from 'react-toast-notifications';
import { useSelector, useDispatch } from 'react-redux';
import { Form, Formik, Field, ErrorMessage } from 'formik';

import PreferenceSchema from './preference.schema';
import { getConsentPreferences, getConsentPreference, createConsentPreference, updateConsentPreference } from './preference.actions';

const ConsentPreferences = () => {
    const dispatch = useDispatch();
    const { addToast } = useToasts();
    const [consentPreferenceId, setConsentPreferenceId] = useState(undefined);

    const handleClose = () => {
        setConsentPreferenceId(undefined);
    };

    const consent_preference = useSelector(state => state.preferenceReducer.consent_preference);
    const consent_preferences = useSelector(state => state.preferenceReducer.consent_preferences);

    useEffect(() => {
        dispatch(getConsentPreferences());
    }, []);

    useEffect(() => {
        if(consentPreferenceId) {
            dispatch(getConsentPreference(consentPreferenceId));
        }
    }, [consentPreferenceId]);

    return (
        <main className="app__content cdp-light-bg h-100">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb rounded-0">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item"><NavLink to="/consent">Data Privacy & Consent Management</NavLink></li>
                                <li className="breadcrumb-item active"><span>Consent Preferences</span></li>
                            </ol>
                        </nav>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <div className="d-sm-flex justify-content-between align-items-center mb-3 mt-4">
                            <h4 className="cdp-text-primary font-weight-bold mb-3 mb-sm-0">Consent preferences</h4>
                            <div class="d-flex justify-content-between align-items-center">
                                <button onClick={() => setConsentPreferenceId(null)} className="btn cdp-btn-secondary text-white ml-2">
                                    <i className="icon icon-plus pr-1"></i> Create new preference
                                </button>
                            </div>
                        </div>

                        { consent_preferences.length > 0 &&
                            <div className="table-responsive shadow-sm bg-white">
                                <table className="table table-hover table-sm mb-0 cdp-table">
                                    <thead className="cdp-bg-primary text-white cdp-table__header">
                                        <tr>
                                            <th>Title</th>
                                            <th>Slug</th>
                                            <th>Is Active</th>
                                            <th>Created By</th>
                                            <th>Created Date</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="cdp-table__body bg-white">
                                        {consent_preferences.map((row, index) => (
                                            <tr key={index}>
                                                <td>{row.title}</td>
                                                <td>{row.slug}</td>
                                                <td>{row.is_active ? 'Active' : 'Inactive'}</td>
                                                <td>{row.createdByUser ? `${row.createdByUser.first_name} ${row.createdByUser.last_name}` : ''}</td>
                                                <td>{(new Date(row.created_at)).toLocaleDateString('en-GB').replace(/\//g, '.')}</td>
                                                <td>
                                                    <button className="btn btn-link cdp-text-primary p-0 mr-3" onClick={() => setConsentPreferenceId(row.id)}>
                                                        <i className="fas fa-tasks mr-1"></i>Edit
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        }

                        { consent_preferences.length === 0 &&
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

            <Modal dialogClassName="modal-90w modal-customize"centered show={consentPreferenceId !== undefined} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        Consent preference
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Formik
                        initialValues={{
                            title: consentPreferenceId && consent_preference ? consent_preference.title : "",
                            is_active: consentPreferenceId && consent_preference ? consent_preference.is_active : false
                        }}
                        displayName="ConsentPreferenceForm"
                        enableReinitialize={true}
                        validationSchema={PreferenceSchema}
                        onSubmit={(values, actions) => {
                            if(consentPreferenceId) {
                                dispatch(updateConsentPreference(consentPreferenceId, values)).then(function() {
                                    addToast('Consent preference updated successfully', {
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
                                dispatch(createConsentPreference(values)).then(function() {
                                    setConsentPreferenceId(undefined);
                                    actions.resetForm();
                                    addToast('Consent preference created successfully', {
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
                                            <div className="invalid-feedback" data-testid="titleError"><ErrorMessage name="title"/></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-12 col-sm-12">
                                        <div className="form-group">
                                            TODO: Add a is_active checkbox here
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

export default ConsentPreferences;

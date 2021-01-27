import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import Dropdown from 'react-bootstrap/Dropdown';
import axios from 'axios';
import { Faq } from '../../../../platform';
import { useSelector, useDispatch } from 'react-redux';
import { useToasts } from 'react-toast-notifications';
import { Form, Formik, Field, ErrorMessage } from 'formik';
import { partnerRequestSchemaForHcos } from '../manage-requests.schema'
import { getPartnerRequests, createPartnerRequest, deletePartnerRequest, getPartnerRequest, updatePartnerRequest, sendForm} from '../manage-requests.actions';

const HcoPartnerRequests = () => {
    const dispatch = useDispatch();
    const { addToast } = useToasts();
    const [showForm, setShowForm] = useState(false);
    const [specialties, setSpecialties] = useState([]);
    const [showError, setShowError] = useState(false);
    const [partnerRequestId, setPartnerRequestId] = useState(undefined);
    const [formData, setFormData] = useState(undefined);
    const countryLanguages = [
        { language_name: 'English', language_code: 'en' },
        { language_name: 'French', language_code: 'fr' },
        { language_name: 'German', language_code: 'de' },
        { language_name: 'Dutch', language_code: 'nl' }
    ];
    const workplaceTypes = [
        { value: 'healthcare_org', label: 'Healthcare Organization' },
        { value: 'patient_org', label: 'Patient Organization' }
    ];
    const [requestToDelete, setRequestToDelete] = useState(null);

    const [showFaq, setShowFaq] = useState(false);
    const handleCloseFaq = () => setShowFaq(false);
    const handleShowFaq = () => setShowFaq(true);

    const total_requests = useSelector(state => state.manageRequestsReducer.partnerRequests);
    const requests = total_requests.filter(i => i.entity_type === 'hco');
    const request = useSelector(state => state.manageRequestsReducer.partnerRequest);

    const countries = useSelector(state => state.countryReducer.countries);

    const getCountryName = (country_iso2) => {
        if (!countries || !country_iso2) return null;
        const country = countries.find(c => c.country_iso2.toLowerCase() === country_iso2.toLowerCase());
        return country && country.countryname;
    };

    const deleteRequest = (id) => {
        dispatch(deletePartnerRequest(id)).then(() => {
            addToast('Request Deleted', {
                appearance: 'success',
                autoDismiss: true
            });
        }).catch(error => {
            addToast(error.response.data, {
                appearance: 'error',
                autoDismiss: true
            });
        });
        setRequestToDelete(null);
    }

    const toggleForm = (id) => {
        setPartnerRequestId(id);
        setShowForm(!!id);
    };

    const sendFormHandler = (data) => {
        setFormData(data);
    };

    async function loadRequests() {
        dispatch(getPartnerRequests());
    }

    async function getSpecialties() {
        const response = await axios.get(`/api/hcps/specialties`);
        setSpecialties(response.data);
    }

    useEffect(() => {
        loadRequests();
        getSpecialties();
    }, []);

    useEffect(() => {
        if (partnerRequestId) {
            dispatch(getPartnerRequest(partnerRequestId));
        }
    }, [partnerRequestId]);

    useEffect(() => {
        if (request.company_codes) {
            const codes = request.company_codes.map(company_code => ({ id: Math.random(), company_code }));
            setCompanyCodes(codes);
        }
    }, [request.company_codes]);
    useEffect(() => {
        if (formData) {
            dispatch(sendForm(formData)).then(() => {
                dispatch(updatePartnerRequest(formData.id, { ...formData, status: "pending" }));
            }).catch(() => {
                addToast('An error occured. Please try again.', {
                    appearance: 'error',
                    autoDismiss: true
                });
            });
        }
    }, [formData]);
    return (
        <main className="app__content cdp-light-bg h-100">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0">
                        <nav className="breadcrumb justify-content-between align-items-center" aria-label="breadcrumb">
                            <ol className="rounded-0 m-0 p-0 d-none d-sm-flex">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item"><NavLink to="/business-partner">Business Partner Management</NavLink></li>
                                <li className="breadcrumb-item active"><span>Business Partner Requests</span></li>
                            </ol>
                            <Dropdown className="dropdown-customize breadcrumb__dropdown d-block d-sm-none ml-2">
                                <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle btn d-flex align-items-center border-0">
                                    <i className="fas fa-arrow-left mr-2"></i> Back
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item className="px-2" href="/"><i className="fas fa-link mr-2"></i> Dashboard</Dropdown.Item>
                                    <Dropdown.Item className="px-2" href="/business-partner"><i className="fas fa-link mr-2"></i> Business Partner Management</Dropdown.Item>
                                    <Dropdown.Item className="px-2" active><i className="fas fa-link mr-2"></i> Business Partner Requests</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                            <span className="ml-auto mr-3"><i type="button" onClick={handleShowFaq} className="icon icon-help breadcrumb__faq-icon cdp-text-secondary"></i></span>
                        </nav>
                        <Modal show={showFaq} onHide={handleCloseFaq} size="lg" centered>
                            <Modal.Header closeButton>
                                <Modal.Title>Questions You May Have</Modal.Title>
                            </Modal.Header>
                            <Modal.Body className="faq__in-modal"><Faq topic="healthcare-request" /></Modal.Body>
                        </Modal>
                    </div>
                </div>

                <div className="row">
                    <div className="col-12">
                        <div className="d-sm-flex justify-content-between align-items-end mb-0 mt-3">
                            <div>
                                <h4 className="cdp-text-primary font-weight-bold mb-3 mb-sm-0">Manage HCOs Request</h4>
                                <div className="pt-3">
                                    <NavLink className="custom-tab px-3 py-3 cdp-border-primary" to="/business-partner/requests/hcps"><i className="fas fa-user-md mr-2"></i>Health Care Professionals</NavLink>
                                    <NavLink className="custom-tab px-3 py-3 cdp-border-primary" to="/business-partner/requests/hcos"><i className="fas fa-hospital mr-2"></i>Health Care Organizations</NavLink>
                                </div>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <button onClick={() => setShowForm(true)} className="btn cdp-btn-secondary text-white ml-2">
                                    <i className="icon icon-plus pr-1"></i> Add New Request
                                </button>
                            </div>
                        </div>



                        {requests && requests.length > 0 ?
                            <div className="table-responsive shadow-sm bg-white">
                                <table className="table table-hover table-sm mb-0 cdp-table">
                                    <thead className="cdp-bg-primary text-white cdp-table__header">
                                        <tr>
                                            <th>UUID</th>
                                            <th>Name</th>
                                            <th>MDR ID</th>
                                            <th>Status</th>
                                            <th>Partner Type</th>
                                            <th>Email Address</th>
                                            <th>Procurement Contact</th>
                                            <th>Country</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="cdp-table__body bg-white">
                                        {requests.map((row, index) => (
                                            <tr key={index}>
                                                <td>{row.uuid}</td>
                                                <td>{`${row.first_name} ${row.last_name}`}</td>
                                                <td>{row.mdr_id}</td>
                                                <td>{row.status}</td>
                                                <td>{row.partner_type}</td>
                                                <td>{row.email}</td>
                                                <td>{row.procurement_contact}</td>
                                                <td>{getCountryName(row.country_iso2)}</td>
                                                <td><Dropdown className="ml-auto dropdown-customize">
                                                    <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle btn-sm py-0 px-1 dropdown-toggle ">
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu>
                                                        <Dropdown.Item onClick={() => sendFormHandler(row)}> Send Form </Dropdown.Item>
                                                        <Dropdown.Item onClick={() => toggleForm(row.id)}> Edit Request </Dropdown.Item>
                                                        <Dropdown.Item className="text-danger" onClick={() => setRequestToDelete(row.id)}> Delete </Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            :
                            <div className="row justify-content-center mt-sm-5 pt-5 mb-3">
                                <div className="col-12 col-sm-6 py-5 bg-white shadow-sm rounded text-center">
                                    <i className="fas fa-hospital-alt fa-5x cdp-text-secondary"></i>
                                    <h3 className="font-weight-bold cdp-text-primary pt-4">No  Request Found for HCO</h3>
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>

            <Modal dialogClassName="modal-customize" size="lg" centered show={showForm} onHide={toggleForm}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {
                            partnerRequestId ? 'Edit HCO Request' : 'Add HCO Request'
                        }
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Formik
                        initialValues={{
                            first_name: partnerRequestId && Object.keys(request).length ? request.first_name : '',
                            last_name: partnerRequestId && Object.keys(request).length ? request.last_name : '',
                            email: partnerRequestId && Object.keys(request).length ? request.email : '',
                            mdr_id: partnerRequestId && Object.keys(request).length ? request.mdr_id : '',
                            workplace_name: partnerRequestId && Object.keys(request).length ? request.workplace_name : '',
                            workplace_type: partnerRequestId && Object.keys(request).length ? request.workplace_type : '',
                            specialty: partnerRequestId && Object.keys(request).length ? request.specialty : '',
                            country_iso2: partnerRequestId && Object.keys(request).length ? request.country_iso2 : '',
                            language: partnerRequestId && Object.keys(request).length ? request.language : '',
                            uuid: partnerRequestId && Object.keys(request).length ? request.uuid : '',
                        }}
                        displayName="PartnerRequestsForm"
                        validationSchema={partnerRequestSchemaForHcos}
                        enableReinitialize={true}
                        onSubmit={(values, actions) => {
                            values.entity_type = 'hco';

                            if (partnerRequestId) {
                                dispatch(updatePartnerRequest(partnerRequestId, values)).then(function () {
                                    toggleForm(null);
                                    addToast('Request updated successfully', {
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
                                dispatch(createPartnerRequest(values)).then(() => {
                                    toggleForm(null);
                                    actions.resetForm();
                                    addToast('New Request Added', {
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

                                    <div className="col-12 col-sm-6 col-lg-4">
                                        <div className="form-group">
                                            <label className="font-weight-bold" htmlFor="uuid">UUID <span className="text-danger">*</span></label>
                                            <Field className="form-control" type="text" name="uuid" />
                                            <div className="invalid-feedback"><ErrorMessage name="uuid" /></div>
                                        </div>
                                    </div>
                                    <div className="col-12 col-sm-6 col-lg-4">
                                        <div className="form-group">
                                            <label className="font-weight-bold" htmlFor="first_name">Contact First Name <span className="text-danger">*</span></label>
                                            <Field className="form-control" type="text" name="first_name" />
                                            <div className="invalid-feedback"><ErrorMessage name="first_name" /></div>
                                        </div>
                                    </div>
                                    <div className="col-12 col-sm-6 col-lg-4">
                                        <div className="form-group">
                                            <label className="font-weight-bold" htmlFor="last_name">Contact Last Name <span className="text-danger">*</span></label>
                                            <Field className="form-control" type="text" name="last_name" />
                                            <div className="invalid-feedback"><ErrorMessage name="last_name" /></div>
                                        </div>
                                    </div>
                                    <div className="col-12 col-sm-6 col-lg-4">
                                        <div className="form-group">
                                            <label className="font-weight-bold" htmlFor="email">Email Address <span className="text-danger">*</span></label>
                                            <Field className="form-control" type="text" name="email" />
                                            <div className="invalid-feedback"><ErrorMessage name="email" /></div>
                                        </div>
                                    </div>
                                    <div className="col-12 col-sm-6 col-lg-4">
                                        <div className="form-group">
                                            <label className="font-weight-bold" htmlFor="workplace_name">Workplace Name <span className="text-danger">*</span></label>
                                            <Field className="form-control" type="text" name="workplace_name" />
                                            <div className="invalid-feedback"><ErrorMessage name="workplace_name" /></div>
                                        </div>
                                    </div>
                                    <div className="col-12 col-sm-6 col-lg-4">
                                        <div className="form-group">
                                            <label className="font-weight-bold" htmlFor="workplace_type">Workplace Type <span className="text-danger">*</span></label>
                                            <Field data-testid="workplace_type" as="select" name="workplace_type" className="form-control">
                                                <option key="select-workplace" value="" disabled>--Select Workplace Type--</option>
                                                {workplaceTypes.map((item, typeIdx) => <option key={typeIdx} value={item.value}>{item.label}</option>)}
                                            </Field>
                                            <div className="invalid-feedback"><ErrorMessage name="workplace_type" /></div>
                                        </div>
                                    </div>
                                    <div className="col-12 col-sm-6 col-lg-4">
                                        <div className="form-group">
                                            <label className="font-weight-bold" htmlFor="specialty">Specialty <span className="text-danger">*</span></label>
                                            <Field data-testid="specialty" as="select" name="specialty" className="form-control">
                                                <option key="select-specialty" value="" disabled>--Select specialty--</option>
                                                {specialties.map((item, typeIdx) => <option key={typeIdx} value={item.codIdOnekey}>{item.codDescription}</option>)}
                                            </Field>
                                            <div className="invalid-feedback"><ErrorMessage name="specialty" /></div>
                                        </div>
                                    </div>
                                    <div className="col-12 col-sm-6 col-lg-4">
                                        <div className="form-group">
                                            <label className="font-weight-bold" htmlFor="mdr_id">MDR ID <span className="text-danger">*</span></label>
                                            <Field className="form-control" type="text" name="mdr_id" />
                                            <div className="invalid-feedback"><ErrorMessage name="mdr_id" /></div>
                                        </div>
                                    </div>


                                    <div className="col-12 col-sm-6 col-lg-4">
                                        <div className="form-group">
                                            <label className="font-weight-bold" htmlFor="country_iso2">Country <span className="text-danger">*</span></label>
                                            <Field data-testid="country_iso2" as="select" name="country_iso2" className="form-control">
                                                <option key="select-country" value="" disabled>--Select Country--</option>
                                                {countries.map(item => <option key={item.countryid} value={item.country_iso2}>{item.codbase_desc}</option>)}
                                            </Field>
                                            <div className="invalid-feedback"><ErrorMessage name="country_iso2" /></div>
                                        </div>
                                    </div>
                                    <div className="col-12 col-sm-6 col-lg-4">
                                        <div className="form-group">
                                            <label className="font-weight-bold" htmlFor="language">Language<span className="text-danger">*</span></label>
                                            <Field className="form-control lang_code" as="select" name="language" className="form-control" id="language">
                                                <option key="select-language" value="" disabled>--Select Language--</option>
                                                {countryLanguages.map((element, lang_idx) => {
                                                    const { language_name, language_code } = element;
                                                    return language_name && <option key={lang_idx} value={language_code}>{language_name}</option>
                                                })}
                                            </Field>
                                            <div className="invalid-feedback"><ErrorMessage name="language" /></div>
                                        </div>
                                    </div>
                                </div>
                                <button type="submit" disabled={showError} className="btn btn-block text-white cdp-btn-secondary mt-4 p-2" >Submit</button>
                            </Form>
                        )}
                    </Formik>
                </Modal.Body>
            </Modal>

            <Modal centered show={requestToDelete !== null} onHide={() => setRequestToDelete(null)}>
                <Modal.Header closeButton>
                    <Modal.Title className="modal-title_small">Remove Request</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {requestToDelete !== null ? (
                        <div>
                            Are you sure you want to remove the following request?
                        </div>
                    ) : null}
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn cdp-btn-outline-primary" onClick={() => setRequestToDelete(null)}>Cancel</button>
                    <button className="ml-2 btn cdp-btn-secondary text-white" onClick={() => deleteRequest(requestToDelete)}>Confirm</button>
                </Modal.Footer>
            </Modal>
        </main>
    );
};

export default HcoPartnerRequests;

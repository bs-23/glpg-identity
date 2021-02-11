import React, { useEffect, useState, useRef } from 'react';
import { NavLink, useLocation, useHistory } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import Dropdown from 'react-bootstrap/Dropdown';
import axios from 'axios';
import { Faq } from '../../../../platform';
import { useSelector, useDispatch } from 'react-redux';
import { useToasts } from 'react-toast-notifications';
import { Form, Formik, Field, ErrorMessage } from 'formik';
import { partnerRequestSchemaForHcos } from '../manage-requests.schema'
import { getPartnerRequests, createPartnerRequest, deletePartnerRequest, getPartnerRequest, updatePartnerRequest, sendForm } from '../manage-requests.actions';
import SearchHcoModal from './search-hco-modal.component';

const HcoPartnerRequests = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const history = useHistory();
    const { addToast } = useToasts();
    const formikRef = useRef();
    const formikBag = formikRef.current;

    const [selectedCountry, setSelectedCountry] = useState('');
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

    const requestData = useSelector(state => state.manageRequestsReducer.partnerRequests);
    const request = useSelector(state => state.manageRequestsReducer.partnerRequest);

    const countries = useSelector(state => state.countryReducer.countries);
    const allCountries = useSelector(state => state.countryReducer.allCountries);


    const [showSearch, setShowSearch] = useState(false);
    const [searchInput, setSearchInput] = useState(false);
    const openSearch = (values) => {
        const searchInput = {
            uuid: values.uuid,
            countryIso2: values.country_iso2,
            specialty: values.specialty
        };

        if (formikBag && formikBag.values && formikBag.values.onekey_id) {
            searchInput.onekeyId = formikBag.values.onekey_id;
        }

        setSearchInput(searchInput);
        setShowSearch(true);
    };
    const resultSelected = (selectedHco = {}) => {
        if (selectedHco.externalIdentifiers && selectedHco.externalIdentifiers.length) {
            formikBag.setFieldValue('uuid', selectedHco.externalIdentifiers[0].value);
        }

        if (selectedHco.workplaceEid) {
            formikBag.setFieldValue('onekey_id', selectedHco.workplaceEid);
        }

        if (!formikBag.values.workplace_name && selectedHco.name) {
            formikBag.setFieldValue('workplace_name', selectedHco.name);
        }

        if (!formikBag.values.country_iso2 && selectedHco.countryIso2) {
            formikBag.setFieldValue('country_iso2', selectedHco.countryIso2);
        }

        setShowSearch(false);
    }



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
            urlChange(1);
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
        const searchObj = {};
        const searchParams = location.search.slice(1).split("&");
        searchParams.forEach(element => {
            searchObj[element.split("=")[0]] = element.split("=")[1];
        });
        const query = '?entitytype=hco' + (searchObj.page ? `&page=${searchObj.page}` : '');
        dispatch(getPartnerRequests(query));
    }

    const urlChange = (pageNo) => {
        const page = pageNo ? pageNo : (params.get('page') ? params.get('page') : 1);
        const url = `?page=${page}`;
        history.push(location.pathname + url);
    };

    const pageLeft = () => {
        if (requestData.page > 1) urlChange(requestData.page - 1);
    };

    const pageRight = () => {
        if (requestData.end !== requestData.total) urlChange(requestData.page + 1);
    };

    async function getSpecialties(codbase) {
        const response = await axios.get(`/api/hcps/specialties?codbases=${codbase}`);
        setSpecialties(response.data);
    }

    useEffect(() => {
        loadRequests();
    }, [location]);

    useEffect(() => {
        if (partnerRequestId) {
            dispatch(getPartnerRequest(partnerRequestId));
        }
    }, [partnerRequestId]);

    useEffect(() => {
        if(request.country_iso2){
            const country = allCountries.find(i => i.country_iso2 === request.country_iso2);
            if(country) getSpecialties(country.codbase);
        }
    }, [partnerRequestId, request.country_iso2]);

    useEffect(() => {
        if(selectedCountry) {
            const country = allCountries.find(i => i.country_iso2 === selectedCountry);
            if(country) getSpecialties(country.codbase);
        }
    }, [selectedCountry]);

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

                        {SearchHcoModal && <SearchHcoModal show={showSearch} resultSelected={resultSelected} searchInput={searchInput}/>}

                        <Modal show={showFaq} onHide={handleCloseFaq} size="xl" centered>
                            <Modal.Header closeButton>
                                <Modal.Title>Questions You May Have</Modal.Title>
                            </Modal.Header>
                            <Modal.Body className="faq__in-modal"><Faq topic="healthcare-request" /></Modal.Body>
                        </Modal>
                    </div>
                </div>

                <div className="row">
                    <div className="col-12">
                        <div className="d-flex justify-content-between align-items-end mb-0 mt-3">
                            <div>
                                <h4 className="cdp-text-primary font-weight-bold mb-0">Manage HCOs Request</h4>
                                <div className="pt-3">
                                    <NavLink className="custom-tab px-3 py-3 cdp-border-primary font-weight-normal" to="/business-partner/requests/hcps"><i className="fas fa-user-md fa-1_5x"></i><span className="d-none d-sm-inline-block ml-2">Health Care Professionals</span></NavLink>
                                    <NavLink className="custom-tab px-3 py-3 cdp-border-primary font-weight-normal" to="/business-partner/requests/hcos"><i className="fas fa-hospital fa-1_5x"></i><span className="d-none d-sm-inline-block ml-2">Health Care Organizations</span></NavLink>
                                </div>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <button onClick={() => setShowForm(true)} className="btn cdp-btn-secondary text-white ml-2">
                                    <i className="icon icon-plus"></i> <span className="d-none d-sm-inline-block pl-1">Add New Request</span>
                                </button>
                            </div>
                        </div>



                        {requestData['partnerRequests'] && requestData['partnerRequests'].length > 0 ?
                            <div className="table-responsive shadow-sm bg-white cdp-table__responsive-wrapper mb-3">
                                <table className="table table-hover table-sm mb-0 cdp-table cdp-table__responsive">
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
                                        {requestData['partnerRequests'].map((row, index) => (
                                            <tr key={index}>
                                                <td data-for="UUID">{row.uuid}</td>
                                                <td data-for="Name">{`${row.first_name} ${row.last_name}`}</td>
                                                <td data-for="MDR ID">{row.mdr_id}</td>
                                                <td data-for="Status">{row.status}</td>
                                                <td data-for="Partner Type">{row.partner_type}</td>
                                                <td data-for="Email Address">{row.email}</td>
                                                <td data-for="Procurement Contact">{row.procurement_contact}</td>
                                                <td data-for="Country">{getCountryName(row.country_iso2)}</td>
                                                <td data-for="Action"><Dropdown className="ml-auto dropdown-customize">
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
                                {((requestData.page === 1 &&
                                    requestData.total > requestData.limit) ||
                                    (requestData.page > 1))
                                    && requestData['partnerRequests'] &&
                                    <div className="pagination justify-content-end align-items-center border-top p-3">
                                        <span className="cdp-text-primary font-weight-bold">{requestData.start + ' - ' + requestData.end}</span> <span className="text-muted pl-1 pr-2"> {' of ' + requestData.total}</span>
                                        <span className="pagination-btn" onClick={() => pageLeft()} disabled={requestData.page <= 1}><i className="icon icon-arrow-down ml-2 prev"></i></span>
                                        <span className="pagination-btn" onClick={() => pageRight()} disabled={requestData.end === requestData.total}><i className="icon icon-arrow-down ml-2 next"></i></span>
                                    </div>
                                }
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

            <Modal dialogClassName="modal-customize" size="xl" centered show={showForm} onHide={() => toggleForm(null)}>
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
                            confirm_email: partnerRequestId && Object.keys(request).length ? request.email : '',
                            mdr_id: partnerRequestId && Object.keys(request).length ? request.mdr_id : '',
                            procurement_contact: partnerRequestId && Object.keys(request).length ? request.procurement_contact : '',
                            workplace_name: partnerRequestId && Object.keys(request).length ? request.workplace_name : '',
                            workplace_type: partnerRequestId && Object.keys(request).length ? request.workplace_type : '',
                            specialty: partnerRequestId && Object.keys(request).length ? request.specialty : '',
                            country_iso2: partnerRequestId && Object.keys(request).length ? request.country_iso2 : '',
                            language: partnerRequestId && Object.keys(request).length ? request.locale.split('_')[0] : 'en',
                            uuid: partnerRequestId && Object.keys(request).length ? request.uuid : '',
                            onekey_id: partnerRequestId && Object.keys(request).length ? request.onekey_id : '',
                        }}
                        innerRef={formikRef}
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
                                    urlChange(1);
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
                                            <i title="OKLA Search" type="button" className="fas fa-search ml-2 cdp-text-primary" onClick={() => openSearch(formikProps.values)}></i>
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
                                            <label className="font-weight-bold" htmlFor="confirm_email">Confirm Email Address <span className="text-danger">*</span></label>
                                            <Field className="form-control" type="text" name="confirm_email" />
                                            <div className="invalid-feedback"><ErrorMessage name="confirm_email" /></div>
                                        </div>
                                    </div>
                                    <div className="col-12 col-sm-6 col-lg-4">
                                        <div className="form-group">
                                            <label className="font-weight-bold" htmlFor="procurement_contact">Procurement Contact <span className="text-danger">*</span></label>
                                            <Field className="form-control" type="text" name="procurement_contact" />
                                            <div className="invalid-feedback"><ErrorMessage name="procurement_contact" /></div>
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
                                            <Field
                                                data-testid="country_iso2"
                                                as="select"
                                                name="country_iso2"
                                                className="form-control"
                                                onChange={(e) => {
                                                    formikProps.setFieldValue('country_iso2', e.target.value);
                                                    setSelectedCountry(e.target.value);
                                                }}
                                            >
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

                                                {countryLanguages.map((element, lang_idx) => {
                                                    const { language_name, language_code } = element;
                                                    return language_name && <option key={lang_idx} value={language_code}>{language_name}</option>
                                                })}
                                            </Field>
                                            <div className="invalid-feedback"><ErrorMessage name="language" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row justify-content-center">
                                    <div className="col-12 col-sm-6">
                                        <button type="submit" disabled={showError} className="btn btn-block text-white cdp-btn-secondary mt-4 p-2" >Submit</button>
                                    </div>
                                </div>
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
                            Are you sure you want to remove this request?
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

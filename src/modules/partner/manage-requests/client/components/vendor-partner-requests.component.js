import React, { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Dropdown from 'react-bootstrap/Dropdown';
import { useSelector, useDispatch } from 'react-redux';
import { useToasts } from 'react-toast-notifications';
import CountryCodes from 'country-codes-list';
import { Form, Formik, Field, ErrorMessage } from 'formik';
import { NavLink } from 'react-router-dom';
import { Faq } from '../../../../platform';
import { partnerRequestSchemaForVendors } from './../manage-requests.schema';
import { getPartnerRequests, createPartnerRequest, deletePartnerRequest, getPartnerRequest, updatePartnerRequest } from '../manage-requests.actions';

const VendorPartnerRequests = () => {
    const dispatch = useDispatch();
    const { addToast } = useToasts();

    const CountryCodesObject = Object.values(CountryCodes.customList('countryCode', '{countryCode} {officialLanguageCode} {officialLanguageNameEn}'));
    const [showForm, setShowForm] = useState(false);
    const [companyCodes, setCompanyCodes] = useState([{ id: Math.random(), company_code: '' }]);
    const [showError, setShowError] = useState(false);
    const [partnerRequestId, setPartnerRequestId] = useState(undefined);

    const [countryLanguages, setCountryLanguages] = useState([]);

    const [showFaq, setShowFaq] = useState(false);
    const handleCloseFaq = () => setShowFaq(false);
    const handleShowFaq = () => setShowFaq(true);

    const total_requests = useSelector(state => state.manageRequestsReducer.partnerRequests);
    const requests = total_requests.filter(i => i.type === 'vendor');
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
    }

    const toggleForm = (id) => {
        setPartnerRequestId(id);
        setShowForm(!!id);
    };

    const handleChange = (e) => {
        const newCompanyCodes = [...companyCodes];
        const field = e.target.className.split(' ');
        const companyCode = newCompanyCodes[e.target.dataset.id];
        companyCode[field[1]] = e.target.value;
        setCompanyCodes(newCompanyCodes);
        setShowError(false);
    }

    const addNewCompanyCode = () => {
        const newCompanyCodes = [...companyCodes, { id: Math.random(), company_code: '' }];
        setCompanyCodes(newCompanyCodes);
        setShowError(false);
        setTimeout(() => {
            const lastCompanyCode = document.getElementById(`company-code-${companyCodes.length + 1}`);
            lastCompanyCode.scrollIntoView({ behavior: 'smooth' });
        }, 50);
    }

    const removeCompanyCode = (idx) => {
        if(companyCodes.length === 1) return;
        const newCompanyCodes = [...companyCodes];
        newCompanyCodes.splice(idx, 1);
        setCompanyCodes(newCompanyCodes);
    }

    const getCompanyCodeFields = () => {
        return companyCodes.map((item, idx) => {
            const companyCodeId = `company-code-${idx + 1}`;

            return (<React.Fragment key={item.id}>
                <div className="col-12 col-sm-6">
                    <label className="col-12 font-weight-bold d-flex justify-content-between align-items-center bg-light py-2 border-bottom rounded-top">
                        <i className="fas fa-minus-circle text-danger fa-2x hover-opacity ml-auto" type="button" title="Remove" onClick={() => removeCompanyCode(idx)}></i>
                    </label>
                    <div className="form-group">
                        <label className="font-weight-bold" htmlFor={companyCodeId}> {`Company Code ${idx+1}`} <span className="text-danger">*</span></label>
                        <Field className="form-control company_code" type='text' value={item.company_code} onChange={(e) => handleChange(e)} data-id={idx} name={companyCodeId} id={companyCodeId}/>
                        {showError && !item.company_code && <div class="invalid-feedback">This field must not be empty.</div>}
                    </div>
                </div>
            </React.Fragment>
            )
        });
    };

    async function loadRequests() {
        dispatch(getPartnerRequests());
    }

    useEffect(() => {
        function getLanguages() {
            const mapped_languages = {};

            const country_languages = CountryCodesObject.filter(item => {
                const [, , language_name] = item.split(' ');
                if (language_name && !mapped_languages[language_name]) {
                    mapped_languages[language_name] = true;
                    return true;
                }
                return false;
            });
            country_languages.sort((a, b) => {
                const [, , language_name1] = a.split(' ');
                const [, , language_name2] = b.split(' ');
                if (language_name1.replace(/,/g, '') < language_name2.replace(/,/g, '')) return -1;
                return 1;
            });
            setCountryLanguages(country_languages);
        }

        loadRequests();
        getLanguages();
    }, []);

    useEffect(() => {
        if (partnerRequestId) {
            dispatch(getPartnerRequest(partnerRequestId));
        }
    }, [partnerRequestId]);

    useEffect(() => {
        if(request.company_codes) {
            const codes = request.company_codes.map(company_code => ({ id: Math.random(), company_code }));
            setCompanyCodes(codes);
        }
    }, [request.company_codes])

    return (
        <main className="app__content cdp-light-bg">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb rounded-0">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item"><NavLink to="/business-partner">Business Partner Management</NavLink></li>
                                <li className="breadcrumb-item active"><span>Business Partner Requests</span></li>
                                <li className="ml-auto mr-3"><i type="button" onClick={handleShowFaq} className="icon icon-help icon-2x cdp-text-secondary"></i></li>
                            </ol>
                        </nav>
                        <Modal show={showFaq} onHide={handleCloseFaq} size="lg" centered>
                            <Modal.Header closeButton>
                                <Modal.Title>Questions You May Have</Modal.Title>
                            </Modal.Header>
                            <Modal.Body className="faq__in-modal"><Faq topic="consent-performance-report" /></Modal.Body>
                        </Modal>
                    </div>
                </div>

                <div className="row">
                    <div className="col-12">
                        <div className="d-sm-flex justify-content-between align-items-end mb-0 mt-3">
                            <div>
                                <h4 className="cdp-text-primary font-weight-bold mb-3 mb-sm-0">Overview of Business Partner Requests</h4>
                                <div className="pt-3">
                                    <NavLink className="custom-tab px-3 py-3 cdp-border-primary" to="/business-partner/requests/vendors">General Vendors</NavLink>
                                    <NavLink className="custom-tab px-3 py-3 cdp-border-primary" to="/business-partner/requests/wholesalers">Wholesalers</NavLink>
                                </div>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <button onClick={() => setShowForm(true)} className="btn cdp-btn-secondary text-white ml-2">
                                    <i className="icon icon-plus pr-1"></i> Add New Request
                                </button>
                            </div>
                        </div>



                        {requests && requests.length > 0 ?
                            <div className="table-responsive shadow-sm mb-3">
                                <table className="table table-hover table-sm mb-0 cdp-table mb-2">
                                    <thead className="cdp-table__header  cdp-bg-primary text-white">
                                        <tr>
                                            <th>First Name</th>
                                            <th>Last Name</th>
                                            <th>Purchasing Organization</th>
                                            <th>Company Code</th>
                                            <th>Email Address</th>
                                            <th>Procurement Contact</th>
                                            <th>Country</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            requests.map((row, index) =>
                                            (
                                                <tr key={index}>
                                                    <td>{row.first_name}</td>
                                                    <td>{row.last_name}</td>
                                                    <td>{row.purchasing_organization}</td>
                                                    <td>
                                                        {
                                                            row.company_codes.map((companyCode, idx) => (
                                                                <p key={idx}>{companyCode}</p>
                                                            ))
                                                        }
                                                    </td>
                                                    <td>{row.email}</td>
                                                    <td>{row.procurement_contact}</td>
                                                    <td>{getCountryName(row.country_iso2)}</td>
                                                    <td><Dropdown className="ml-auto dropdown-customize">
                                                        <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle btn-sm py-0 px-1 dropdown-toggle ">
                                                        </Dropdown.Toggle>
                                                        <Dropdown.Menu>
                                                            <Dropdown.Item> Send Form </Dropdown.Item>
                                                            <Dropdown.Item onClick={() => toggleForm(row.id)}> Edit Request </Dropdown.Item>
                                                            <Dropdown.Item onClick={() => deleteRequest(row.id) }> Delete </Dropdown.Item>
                                                        </Dropdown.Menu>
                                                    </Dropdown></td>
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </table>
                            </div>
                            :
                            <div className="row justify-content-center mt-sm-5 pt-5 mb-3">
                                <div className="col-12 col-sm-6 py-5 bg-white shadow-sm rounded text-center">
                                    <i className="icon icon-partner icon-5x  cdp-text-secondary"></i>
                                    <h3 className="font-weight-bold cdp-text-primary pt-4">No Request Found for Vendor</h3>
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>

            <Modal dialogClassName="modal-90w modal-customize" centered show={showForm}  onHide={toggleForm}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {
                            partnerRequestId ? 'Edit Request' : 'Add Request'
                        }
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Formik
                        initialValues={{
                            first_name: partnerRequestId && request ? request.first_name : '',
                            last_name: partnerRequestId && request ? request.last_name : '',
                            email: partnerRequestId && request ? request.email : '',
                            procurement_contact: partnerRequestId && request ? request.procurement_contact : '',
                            purchasing_organization: partnerRequestId && request ? request.purchasing_organization : '',
                            company_codes: [],
                            country_iso2: partnerRequestId && request ? request.country_iso2 : '',
                            language: partnerRequestId && request ? request.language : '',
                        }}
                        displayName="PartnerRequestsForm"
                        validationSchema={partnerRequestSchemaForVendors}
                        enableReinitialize={true}
                        onSubmit={(values, actions) => {
                            values.company_codes = companyCodes.map(i => i.company_code);

                            const validCompanyCodes = companyCodes.filter(item => item.company_code);
                            if (companyCodes.length !== validCompanyCodes.length) {
                                setShowError(true);
                                return;
                            }

                            values.type = 'vendor';

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
                                    <div className="col-12 col-sm-12">
                                        <div className="form-group">
                                            <label className="font-weight-bold" htmlFor="country_iso2">Country <span className="text-danger">*</span></label>
                                            <Field data-testid="country_iso2" as="select" name="country_iso2" className="form-control">
                                                <option key="select-country" value="" disabled>--Select Country--</option>
                                                {countries.map(item => <option key={item.countryid} value={item.country_iso2}>{item.codbase_desc}</option>)}
                                            </Field>
                                            <div className="invalid-feedback"><ErrorMessage name="country_iso2" /></div>
                                        </div>
                                        <div className="form-group">
                                            <label className="font-weight-bold" htmlFor="first_name">First Name <span className="text-danger">*</span></label>
                                            <Field className="form-control" type="text" name="first_name" />
                                            <div className="invalid-feedback"><ErrorMessage name="first_name" /></div>
                                        </div>
                                        <div className="form-group">
                                            <label className="font-weight-bold" htmlFor="last_name">Last Name <span className="text-danger">*</span></label>
                                            <Field className="form-control" type="text" name="last_name" />
                                            <div className="invalid-feedback"><ErrorMessage name="last_name" /></div>
                                        </div>
                                        <div className="form-group">
                                            <label className="font-weight-bold" htmlFor="email">Email Address <span className="text-danger">*</span></label>
                                            <Field className="form-control" type="text" name="email" />
                                            <div className="invalid-feedback"><ErrorMessage name="email" /></div>
                                        </div>
                                        <div className="form-group">
                                            <label className="font-weight-bold" htmlFor="procurement_contact">Procurement Contact <span className="text-danger">*</span></label>
                                            <Field className="form-control" type="text" name="procurement_contact" />
                                            <div className="invalid-feedback"><ErrorMessage name="procurement_contact" /></div>
                                        </div>

                                        <div className="form-group">
                                            <label className="font-weight-bold" htmlFor="purchasing_organization">Purchasing Organization <span className="text-danger">*</span></label>
                                            <Field className="form-control" type="text" name="purchasing_organization" />
                                            <div className="invalid-feedback"><ErrorMessage name="purchasing_organization" /></div>
                                        </div>

                                        {getCompanyCodeFields()}

                                        <div className="col-12">
                                            <div className="form-group">
                                                <label className="d-flex align-items-center cdp-text-primary hover-opacity" type="button" onClick={addNewCompanyCode}>
                                                    <i className="fas fa-plus  fa-2x mr-3" ></i>
                                                    <span className="h4 mb-0">Add Company Code</span>
                                                </label>
                                            </div>
                                        </div>

                                        <div className="col-12 col-sm-6">
                                            <div className="form-group">
                                                <label className="font-weight-bold" htmlFor="language">ISO Code Language (ISO 639-1) <span className="text-danger">*</span></label>
                                                <Field className="form-control lang_code" as="select" name="language" className="form-control" id="language">
                                                    <option key="select-language" value="" disabled>--Select Language--</option>
                                                    {countryLanguages.map(element => {
                                                        const [country_iso2, language_code, language_name] = element.split(' ');
                                                        return language_name && <option key={country_iso2} value={language_code}>{language_name.replace(/,/g, '')}</option>
                                                    })}
                                                </Field>
                                                <div className="invalid-feedback"><ErrorMessage name="language" /></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button type="submit" disabled={showError} className="btn btn-block text-white cdp-btn-secondary mt-4 p-2" >Submit</button>
                            </Form>
                        )}
                    </Formik>
                </Modal.Body>
            </Modal>
        </main >

    );
};

export default VendorPartnerRequests;

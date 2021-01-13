import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import Dropdown from 'react-bootstrap/Dropdown';
import { useSelector, useDispatch } from 'react-redux';
import { useToasts } from 'react-toast-notifications';
import { Form, Formik, Field, ErrorMessage } from 'formik';
import { partnerRequestSchema } from '../manage-requests.schema'
import { getPartnerRequests, createPartnerRequest, deletePartnerRequest, getPartnerRequest, updatePartnerRequest } from '../manage-requests.actions';

const HcpPartnerRequests = () => {
    const dispatch = useDispatch();
    const { addToast } = useToasts();
    const [showForm, setShowForm] = useState(false);
    const [companyCodes, setCompanyCodes] = useState([{ id: Math.random(), company_code: '' }]);
    const [showError, setShowError] = useState(false);
    const [partnerRequestId, setPartnerRequestId] = useState(undefined);

    const total_requests = useSelector(state => state.manageRequestsReducer.partnerRequests);
    const requests = total_requests.filter(i => i.type === 'hcp');
    const request = useSelector(state => state.manageRequestsReducer.partnerRequest);

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

    const getCompanyCodeFields = () => {
        return companyCodes.map((item, idx) => {
            const companyCodeId = `company-code-${idx + 1}`;

            return (<React.Fragment key={item.id}>
                <div className="col-12 col-sm-6">
                    <div className="form-group">
                        <label className="font-weight-bold" htmlFor={companyCodeId}> {`Company Code ${idx+1}`} <span className="text-danger">*</span></label>
                        <Field className="form-control company_code" type='text' value={item.company_code} onChange={(e) => handleChange(e)} data-id={idx} name={companyCodeId} id={companyCodeId}/>
                        {showError && !item.company_code && <div className="invalid-feedback">This field must not be empty.</div>}
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
        loadRequests();
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
        <main className="app__content cdp-light-bg h-100">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb rounded-0">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item"><NavLink to="/business-partner">Business Partner Management</NavLink></li>
                                <li className="breadcrumb-item active"><span>Business Partner Requests</span></li>
                            </ol>
                        </nav>
                    </div>
                </div>

                <div className="row">
                    <div className="col-12">
                        <div className="d-sm-flex justify-content-between align-items-center mb-3 mt-4">
                            <h4 className="cdp-text-primary font-weight-bold mb-3 mb-sm-0">Overview of Business Partner Requests</h4>
                            <div className="d-flex justify-content-between align-items-center">
                                <button onClick={() => setShowForm(true)} className="btn cdp-btn-secondary text-white ml-2">
                                    <i className="icon icon-plus pr-1"></i> Add New Request
                                </button>
                            </div>
                        </div>

                        <div>
                            <NavLink className="custom-tab px-3 py-3 cdp-border-primary" to="/business-partner/requests/hcps">HCPs</NavLink>
                            <NavLink className="custom-tab px-3 py-3 cdp-border-primary" to="/business-partner/requests/hcos">HCOs</NavLink>
                        </div>

                        {requests && requests.length > 0 ?
                            <div className="table-responsive shadow-sm bg-white">
                                <table className="table table-hover table-sm mb-0 cdp-table">
                                    <thead className="cdp-bg-primary text-white cdp-table__header">
                                        <tr>
                                            <th>Name</th>
                                            <th>Status</th>
                                            <th>Company Code</th>
                                            <th>Email Address</th>
                                            <th>Procurement Contact</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="cdp-table__body bg-white">
                                        {requests.map((row, index) => (
                                            <tr key={index}>
                                                <td>{`${row.first_name} ${row.last_name}`}</td>
                                                <td>{row.status}</td>
                                                <td>
                                                    {
                                                        row.company_codes.map((companyCode, idx) => (
                                                            <p key={idx}>{companyCode}</p>
                                                        ))
                                                    }
                                                </td>
                                                <td>{row.email}</td>
                                                <td>{row.procurement_contact}</td>
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
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            :
                            <div className="row justify-content-center mt-sm-5 pt-5 mb-3">
                                <div className="col-12 col-sm-6 py-5 bg-white shadow-sm rounded text-center">
                                    <i className="fas fa-hospital-user fa-5x cdp-text-secondary"></i>
                                    <h3 className="font-weight-bold cdp-text-primary pt-4">No  Request Found  for HCP</h3>
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
                            company_codes: [],
                        }}
                        displayName="PartnerRequestsForm"
                        validationSchema={partnerRequestSchema}
                        enableReinitialize={true}
                        onSubmit={(values, actions) => {
                            values.company_codes = companyCodes.map(i => i.company_code);

                            const validCompanyCodes = companyCodes.filter(item => item.company_code);
                            if (companyCodes.length !== validCompanyCodes.length) {
                                setShowError(true);
                                return;
                            }

                            values.type = 'hcp';

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

                                        {getCompanyCodeFields()}

                                        <div className="col-12">
                                            <div className="form-group">
                                                <label className="d-flex align-items-center cdp-text-primary hover-opacity" type="button" onClick={addNewCompanyCode}>
                                                    <i className="fas fa-plus  fa-2x mr-3" ></i>
                                                    <span className="h4 mb-0">Add Company Code</span>
                                                </label>
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
        </main>
    );
};

export default HcpPartnerRequests;

import { NavLink } from 'react-router-dom';
import Dropdown from 'react-bootstrap/Dropdown';
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { LinkContainer } from 'react-router-bootstrap';
import { Form, Formik, Field, FieldArray, ErrorMessage } from "formik";
import { useToasts } from 'react-toast-notifications';
import { getHcpProfiles, editHcpProfiles, hcpsSort } from '../hcp.actions';
import { ApprovalRejectSchema } from '../hcp.schema'
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';

export default function hcpUsers() {
    const dispatch = useDispatch();
    const [countries, setCountries] = useState([]);
    const [show, setShow] = useState(false);
    const [currentAction, setCurrentAction] = useState('')
    const [currentUser, setCurrentUser] = useState({})
    const { addToast } = useToasts();

    const hcps = useSelector(state => state.hcpReducer.hcps);

    const pageLeft = () => {
        console.log("==================================> page left");
        if (hcps.page > 1) dispatch(getHcpProfiles(hcps.page - 1, hcps.status, hcps.country_iso2));
    };

    const pageRight = () => {
        console.log("==================================> page right");
        if (hcps.end !== hcps.total) dispatch(getHcpProfiles(hcps.page + 1, hcps.status, hcps.country_iso2));
    };

    // const sortHcp = (sortType, val) => {
    //     dispatch(hcpsSort(sortType, val));
    // };

    async function getCountries() {
        const response = await axios.get('/api/countries');
        setCountries(response.data);
        // console.log("===============================> countries ", response);
    }

    const onUpdateStatus = (user) => {
        setCurrentAction('Update Status')
        setCurrentUser(user)
        setShow(true)
    }

    const onUpdateStatusSuccess = () => {
        addToast('Successfully changed user status.', {
            appearance: 'success',
            autoDismiss: true
        })
        loadHcpProfile()
    }

    const onUpdateStatusFailure = (error) => {
        const errorMessage = error.response.data.errors.length ? error.response.data.errors[0].message : 'Could not change user status.'
        addToast(errorMessage, {
            appearance: 'error',
            autoDismiss: true
        });
    }

    const loadHcpProfile = () => {
        const params = new URLSearchParams(window.location.search);
        dispatch(getHcpProfiles(
            params.get('page') ? params.get('page') : 1,
            params.get('status') ? params.get('status') : null,
            params.get('country_iso2') ? params.get('country_iso2') : null,
        ))
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        getCountries();
        dispatch(getHcpProfiles(
            params.get('page') ? params.get('page') : 1,
            params.get('status') ? params.get('status') : null,
            params.get('country_iso2') ? params.get('country_iso2') : null,
        ));

    }, []);

    return (
        <main className="app__content cdp-light-bg">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb rounded-0">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item"><NavLink to="/hcps">Information Management</NavLink></li>
                                <li className="breadcrumb-item active"><span>HCP Profiles List</span></li>
                            </ol>
                        </nav>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <div>
                            <div className="d-flex justify-content-between align-items-center mb-3 mt-4">
                                <h4 className="cdp-text-primary font-weight-bold mb-0">HCP Profiles</h4>
                                <div>
                                    {countries && hcps['countries'] &&
                                        <React.Fragment>
                                            <Dropdown className="d-inline-block show dropdown rounded pl-2 mr-2 dropdown cdp-btn-primary text-white dropdown shadow-sm">
                                                Country
                                                <Dropdown.Toggle variant="" className="ml-2 bg-white rounded-0">
                                                    {hcps.country_iso2 && (countries.find(i => i.country_iso2 === hcps.country_iso2)) ? (countries.find(i => i.country_iso2 === hcps.country_iso2)).countryname : 'All'}
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu>
                                                    <LinkContainer to={`list?page=1&status=${hcps.status}&country_iso2=null`}><Dropdown.Item className={hcps.country_iso2 === null ? 'd-none' : ''} onClick={() => dispatch(getHcpProfiles(1, hcps.status, null))}>All</Dropdown.Item></LinkContainer>
                                                    {hcps['countries'].map((country, index) => (
                                                        <LinkContainer key={index} to={`list?page=1&status=${hcps.status}&country_iso2=${country}`}><Dropdown.Item className={hcps.status === country ? 'd-none' : ''} onClick={() => dispatch(getHcpProfiles(1, hcps.status, country))}>{(countries.find(i => i.country_iso2 === country)) ? (countries.find(i => i.country_iso2 === country)).countryname : null}</Dropdown.Item></LinkContainer>
                                                    ))}
                                                </Dropdown.Menu>
                                            </Dropdown>

                                            <Dropdown className="d-inline-block show dropdown rounded pl-2 mr-2 dropdown cdp-btn-secondary text-white dropdown shadow-sm">
                                                Status
                                                <Dropdown.Toggle variant="" className="ml-2 bg-white rounded-0">
                                                    {hcps.status ? hcps.status : 'All'}
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu>
                                                    <LinkContainer to={`list?page=1&status=null&country_iso2=${hcps.country_iso2}`}><Dropdown.Item className={hcps.status === null ? 'd-none' : ''} onClick={() => dispatch(getHcpProfiles(1, null, hcps.country_iso2))}>All</Dropdown.Item></LinkContainer>
                                                    <LinkContainer to={`list?page=1&status=Approved&country_iso2=${hcps.country_iso2}`}><Dropdown.Item className={hcps.status === 'Approved' ? 'd-none' : ''} onClick={() => dispatch(getHcpProfiles(1, 'Approved', hcps.country_iso2))}>Approved</Dropdown.Item></LinkContainer>
                                                    <LinkContainer to={`list?page=1&status=Consent Pending&country_iso2=${hcps.country_iso2}`}><Dropdown.Item className={hcps.status === 'Consent Pending' ? 'd-none' : ''} onClick={() => dispatch(getHcpProfiles(1, 'Consent Pending', hcps.country_iso2))}>Consent Pending</Dropdown.Item></LinkContainer>
                                                    <LinkContainer to={`list?page=1&status=Not Verified&country_iso2=${hcps.country_iso2}`}><Dropdown.Item className={hcps.status === 'Not Verified' ? 'd-none' : ''} onClick={() => dispatch(getHcpProfiles(1, 'Not Verified', hcps.country_iso2))}>Not Verified</Dropdown.Item></LinkContainer>
                                                    <LinkContainer to={`list?page=1&status=Rejected&country_iso2=${hcps.country_iso2}`}><Dropdown.Item className={hcps.status === 'Rejected' ? 'd-none' : ''} onClick={() => dispatch(getHcpProfiles(1, 'Rejected', hcps.country_iso2))}>Rejected</Dropdown.Item></LinkContainer>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </React.Fragment>
                                    }
                                </div>

                            </div>
                            <Modal
                                show={show}
                                onHide={() => { setCurrentAction(''); setShow(false) }}
                                dialogClassName="modal-90w modal-customize"
                                aria-labelledby="example-custom-modal-styling-title"
                            >
                                <Modal.Header closeButton>
                                    <Modal.Title id="example-custom-modal-styling-title">
                                        Status Update
                                    </Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <div className="p-2">
                                        <div className="row">
                                            <div className="col">
                                                <h4 className="font-weight-bold">{`${currentUser.first_name} ${currentUser.last_name}`}</h4>
                                                <div className="mt-1">{currentUser.email}</div>
                                                <div className="mt-1">{(new Date(currentUser.created_at)).toLocaleDateString().replace(/\//g, '-')}</div>
                                            </div>
                                        </div>
                                        <Formik
                                            initialValues={{
                                                comment: '',
                                                selectedStatus: ''
                                            }}
                                            displayName="ApproveRejectForm"
                                            validationSchema={ApprovalRejectSchema}
                                            onSubmit={(values, actions) => {
                                                if (values.selectedStatus === 'approve') {
                                                    axios.put(`/api/hcp-profiles/${currentUser.id}/approve`, values)
                                                        .then(() => onUpdateStatusSuccess())
                                                        .catch(err => onUpdateStatusFailure(err))
                                                }
                                                if (values.selectedStatus === 'reject') {
                                                    axios.put(`/api/hcp-profiles/${currentUser.id}/reject`, values)
                                                        .then(() => onUpdateStatusSuccess())
                                                        .catch(err => onUpdateStatusFailure(err))
                                                }
                                                setShow(false);
                                                actions.setSubmitting(false);
                                                actions.resetForm();
                                            }}
                                        >
                                            {formikProps => (
                                                <Form onSubmit={formikProps.handleSubmit}>
                                                    <div className="row">
                                                        <div className="col-6">
                                                            <a onClick={() => formikProps.setFieldValue('selectedStatus', 'approve')} className={`btn btn-block cdp-btn-outline-primary mt-4 p-2  ${formikProps.values.selectedStatus === 'approve' ? 'selected' : ''}`} disabled={formikProps.isSubmitting || currentUser.status === 'Approved'}><i className="fas fa-check mr-1 text-success"></i> Approve User</a>
                                                        </div>
                                                        <div className="col-6">
                                                            <a onClick={() => formikProps.setFieldValue('selectedStatus', 'reject')} className={`btn btn-block cdp-btn-outline-secondary mt-4 p-2  ${formikProps.values.selectedStatus === 'reject' ? 'selected' : ''}`} disabled={formikProps.isSubmitting || currentUser.status === 'Rejected'}><i className="fas fa-times mr-1 text-danger"></i> Reject User</a>
                                                        </div>
                                                    </div>
                                                    <div className="row mt-4">
                                                        <div className="col-12 col-sm-12">
                                                            <div className="form-group">
                                                                <label className="font-weight-bold" htmlFor="comment">Comment <span className="text-danger">*</span></label>
                                                                <Field className="form-control" component="textarea" rows="4" name="comment" />
                                                                <div className="invalid-feedback"><ErrorMessage name="comment" /></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button type="submit" className="btn btn-block text-white cdp-btn-secondary mt-4 p-2" disabled={!formikProps.values.selectedStatus || formikProps.isSubmitting}>Submit</button>
                                                </Form>
                                            )}
                                        </Formik>
                                    </div>
                                </Modal.Body>

                            </Modal>
                            {hcps['users'] && hcps['users'].length > 0 &&
                                <React.Fragment>
                                    <div className="shadow-sm bg-white">
                                        <table className="table table-hover table-sm mb-0 cdp-table">
                                            <thead className="cdp-bg-primary text-white cdp-table__header">
                                                {/*<tr>
                                                <th>Email<span className="d-inline-flex flex-column ml-1"><i className="fa fa-caret-up" onClick={() => sortHcp('ASC', 'email')}></i><i className="fa fa-caret-down" onClick={() => sortHcp('DESC', 'email')}></i></span></th>
                                                <th>Date of Registration<span className="d-inline-flex flex-column ml-1"><i className="fa fa-caret-up" onClick={() => sortHcp('ASC', 'created_at')}></i><i className="fa fa-caret-down" onClick={() => sortHcp('DESC', 'created_at')}></i></span></th>
                                                <th>Name<span className="d-inline-flex flex-column ml-1"><i className="fa fa-caret-up" onClick={() => sortHcp('ASC', 'first_name')}></i><i className="fa fa-caret-down" onClick={() => sortHcp('DESC', 'first_name')}></i></span></th>
                                                <th>Status<span className="d-inline-flex flex-column ml-1"><i className="fa fa-caret-up" onClick={() => sortHcp('ASC', 'status')}></i><i className="fa fa-caret-down" onClick={() => sortHcp('DESC', 'status')}></i></span></th>
                                                <th>UUID <span className="d-inline-flex flex-column ml-1"><i className="fa fa-caret-up" onClick={() => sortHcp('ASC', 'uuid')}></i><i className="fa fa-caret-down" onClick={() => sortHcp('DESC', 'uuid')}></i></span></th>
                                                <th>Specialty<span className="d-inline-flex flex-column ml-1"><i className="fa fa-caret-up" onClick={() => sortHcp('ASC', 'specialty_name')}></i><i className="fa fa-caret-down" onClick={() => sortHcp('DESC', 'specialty_name')}></i></span></th>
                                                <th>Action</th>
                                            </tr>*/}
                                                <tr>
                                                    <th>Email</th>
                                                    <th>Date of Registration</th>
                                                    <th>First Name</th>
                                                    <th>Last Name</th>
                                                    <th>Status</th>
                                                    <th>UUID</th>
                                                    <th>Specialty</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="cdp-table__body bg-white">
                                                {hcps['users'].map((row, index) => (
                                                    <tr key={index}>
                                                        <td>{row.email}</td>
                                                        <td>{(new Date(row.created_at)).toLocaleDateString().replace(/\//g, '-')}</td>
                                                        <td>{row.first_name}</td>
                                                        <td>{row.last_name}</td>
                                                        <td>
                                                            {row.status === 'Approved' ? <span><i className="fa fa-xs fa-circle text-success pr-2"></i>Approved</span> :
                                                                row.status === 'Consent Pending' ? <span><i className="fa fa-xs fa-circle text-warning pr-2"></i>Consent Pending</span> :
                                                                    row.status === 'Not Verified' ? <span><i className="fa fa-xs fa-circle text-warning pr-2"></i>Not Verified</span> :
                                                                        row.status === 'Rejected' ? <span><i className="fa fa-xs fa-circle text-danger pr-2"></i>Rejected</span> : <span></span>
                                                            }
                                                        </td>
                                                        <td>{row.uuid}</td>
                                                        <td>{row.specialty_description}</td>
                                                        <td>
                                                            <span>
                                                                <Dropdown className="ml-auto dropdown-customize">
                                                                    <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle btn-sm">
                                                                        {currentAction ? currentAction : 'Select an action'}
                                                                    </Dropdown.Toggle>
                                                                    <Dropdown.Menu>
                                                                        <LinkContainer to="#"><Dropdown.Item>Profile</Dropdown.Item></LinkContainer>
                                                                        {/* <LinkContainer to="#"><Dropdown.Item>Edit Profile</Dropdown.Item></LinkContainer> */}

                                                                        {row.status === 'Not Verified' && <LinkContainer to="#"><Dropdown.Item onClick={() => onUpdateStatus(row)}>Update Status</Dropdown.Item></LinkContainer>}
                                                                    </Dropdown.Menu>
                                                                </Dropdown>
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {((hcps.page === 1 &&
                                            hcps.total > hcps.limit) ||
                                            (hcps.page > 1))
                                            && hcps['users'] &&
                                            <div className="pagination justify-content-end align-items-center border-top p-3">
                                                <span className="cdp-text-primary font-weight-bold">{hcps.start + ' - ' + hcps.end}</span> <span className="text-muted pl-1 pr-2"> {' of ' + hcps.total}</span>
                                                <LinkContainer to={`list?page=${hcps.page - 1}&status=${hcps.status}&country_iso2=${hcps.country_iso2}`}>
                                                    <span className="pagination-btn" data-testid='Prev' onClick={() => pageLeft()} disabled={hcps.page <= 1}><i className="icon icon-arrow-down ml-2 prev"></i></span>
                                                </LinkContainer>
                                                <LinkContainer to={`list?page=${hcps.page + 1}&status=${hcps.status}&country_iso2=${hcps.country_iso2}`}>
                                                    <span className="pagination-btn" data-testid='Next' onClick={() => pageRight()} disabled={hcps.end === hcps.total}><i className="icon icon-arrow-down ml-2 next"></i></span>
                                                </LinkContainer>
                                            </div>
                                        }
                                    </div>

                                </React.Fragment>
                            }

                            {hcps['users'] && hcps['users'].length === 0 &&
                                <>
                                    <div className="row justify-content-center mt-5 pt-5 mb-3">
                                        <div className="col-12 col-sm-6 py-4 bg-white shadow-sm rounded text-center">
                                            <i class="icon icon-team icon-6x cdp-text-secondary"></i>
                                            <h3 className="font-weight-bold cdp-text-primary pt-4">No Profile Found!</h3>
                                        </div>
                                    </div>
                                </>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </main >
    );
}

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
    const [changeToStatus, setChangeToStatus] = useState('approve')
    const [currentUser, setCurrentUser] = useState({})
    const { addToast } = useToasts();

    const hcps = useSelector(state => state.hcpReducer.hcps);

    const pageLeft = () => {
        if (hcps.page > 1) dispatch(getHcpProfiles(hcps.page - 1, hcps.status, hcps.country_iso2));
    };

    const pageRight = () => {
        if (hcps.end !== hcps.total) dispatch(getHcpProfiles(hcps.page + 1, hcps.status, hcps.country_iso2));
    };

    const sortHcp = (sortType, val) => {
        dispatch(hcpsSort(sortType, val));
    };

    async function getCountries() {
        const response = await axios.get('/api/countries');
        setCountries(response.data);
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
        <main className="app__content">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb rounded-0">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item active"><span>HCP Profiles</span></li>
                            </ol>
                        </nav>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <div>
                            <div className="d-flex justify-content-between align-items-center">
                                <h2 className="">HCP Profiles</h2>
                                <div>
                                    {hcps['countries'] &&
                                        <React.Fragment>
                                            <Dropdown className="d-inline-block show dropdown border border-secondary rounded pl-2 mr-2">
                                                Country
                                                <Dropdown.Toggle variant="secondary" className="ml-2">
                                                    {hcps.country_iso2 ? hcps.country_iso2 : 'All'}
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu>
                                                    <LinkContainer to={`list?page=1&status=${hcps.status}&country_iso2=null`}><Dropdown.Item className={hcps.country_iso2 === null ? 'd-none' : ''} onClick={() => dispatch(getHcpProfiles(1, hcps.status, null))}>All</Dropdown.Item></LinkContainer>
                                                    {countries && hcps['countries'].map((country, index) => (
                                                        <LinkContainer key={index} to={`list?page=1&status=${hcps.status}&country_iso2=${country}`}><Dropdown.Item className={hcps.status === country ? 'd-none' : ''} onClick={() => dispatch(getHcpProfiles(1, hcps.status, country))}>{(countries.find(i => i.country_iso2 === country)).countryname}</Dropdown.Item></LinkContainer>
                                                    ))}
                                                </Dropdown.Menu>
                                            </Dropdown>

                                            <Dropdown className="d-inline-block show dropdown border border-secondary rounded pl-2">
                                                Status
                                        <Dropdown.Toggle variant="secondary" className="ml-2">
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
                                            comment: ''
                                        }}
                                        displayName="ApproveRejectForm"
                                        validationSchema={ApprovalRejectSchema}
                                        onSubmit={(values, actions) => {
                                            if(changeToStatus === 'approve'){
                                                axios.put(`/api/hcp-profiles/${currentUser.id}/approve`, values)
                                                    .then(() => onUpdateStatusSuccess())
                                                    .catch(err => onUpdateStatusFailure(err))
                                            }else{
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
                                                        <button onClick={(e) => {setChangeToStatus('approve'); formikProps.handleSubmit(e)}} type="submit" className="btn btn-block text-white cdp-btn-secondary mt-4 p-2" disabled={formikProps.isSubmitting || currentUser.status === 'Approved'}>Approve User</button>
                                                    </div>
                                                    <div className="col-6">
                                                        <button onClick={(e) => {setChangeToStatus('reject'); formikProps.handleSubmit(e)}} type="submit" className="btn btn-block text-white cdp-btn-secondary mt-4 p-2" disabled={formikProps.isSubmitting || currentUser.status === 'Rejected'}>Reject User</button>
                                                    </div>
                                                </div>
                                                <div className="row mt-4">
                                                    <div className="col-12 col-sm-12">
                                                        <div className="form-group">
                                                            <label className="font-weight-bold" htmlFor="comment">Comment <span className="text-danger">*</span></label>
                                                            <Field className="form-control" type="text" name="comment" />
                                                            <div className="invalid-feedback"><ErrorMessage name="comment" /></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Form>
                                        )}
                                    </Formik>
                                </div>
                            </Modal.Body>

                            </Modal>
                            {hcps['users'] && hcps['users'].length > 0 &&
                                <React.Fragment>
                                    <table className="table">
                                        <thead className="table-secondary">
                                            <tr>
                                                <th>Email<span className="d-inline-flex flex-column ml-1"><i className="fa fa-caret-up" onClick={() => sortHcp('ASC', 'email')}></i><i className="fa fa-caret-down" onClick={() => sortHcp('DESC', 'email')}></i></span></th>
                                                <th>Date of Registration<span className="d-inline-flex flex-column ml-1"><i className="fa fa-caret-up" onClick={() => sortHcp('ASC', 'created_at')}></i><i className="fa fa-caret-down" onClick={() => sortHcp('DESC', 'created_at')}></i></span></th>
                                                <th>Name<span className="d-inline-flex flex-column ml-1"><i className="fa fa-caret-up" onClick={() => sortHcp('ASC', 'first_name')}></i><i className="fa fa-caret-down" onClick={() => sortHcp('DESC', 'first_name')}></i></span></th>
                                                <th>Status<span className="d-inline-flex flex-column ml-1"><i className="fa fa-caret-up" onClick={() => sortHcp('ASC', 'status')}></i><i className="fa fa-caret-down" onClick={() => sortHcp('DESC', 'status')}></i></span></th>
                                                <th>UUID <span className="d-inline-flex flex-column ml-1"><i className="fa fa-caret-up" onClick={() => sortHcp('ASC', 'uuid')}></i><i className="fa fa-caret-down" onClick={() => sortHcp('DESC', 'uuid')}></i></span></th>
                                                <th>Specialty<span className="d-inline-flex flex-column ml-1"><i className="fa fa-caret-up" onClick={() => sortHcp('ASC', 'specialty_name')}></i><i className="fa fa-caret-down" onClick={() => sortHcp('DESC', 'specialty_name')}></i></span></th>
                                                <th>Action</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {hcps['users'].map((row, index) => (
                                                <tr key={index}>
                                                    <td>{row.email}</td>
                                                    <td>{(new Date(row.created_at)).toLocaleDateString().replace(/\//g, '-')}</td>
                                                    <td>{row.first_name + ' ' + row.last_name}</td>
                                                    <td>
                                                        {row.status === 'Approved' ? <span><i className="fa fa-xs fa-circle text-success pr-2"></i>Approved</span> :
                                                            row.status === 'Consent Pending' ? <span><i className="fa fa-xs fa-circle text-warning pr-2"></i>Consent Pending</span> :
                                                                row.status === 'Not Verified' ? <span><i className="fa fa-xs fa-circle text-warning pr-2"></i>Not Verified</span> :
                                                                    row.status === 'Rejected' ? <span><i className="fa fa-xs fa-circle text-danger pr-2"></i>Rejected</span> : <span></span>
                                                        }
                                                    </td>
                                                    <td>{row.uuid}</td>
                                                    <td>{row.specialty_name}</td>
                                                    <td>
                                                        <span>
                                                        <Dropdown>
                                                            <Dropdown.Toggle variant="secondary" className="ml-2">
                                                                {currentAction ? currentAction : 'Select an action'}
                                                            </Dropdown.Toggle>
                                                            <Dropdown.Menu>
                                                                <div className="ml-2 p-1"> Profile </div>
                                                                <div className="ml-2 p-1"> Edit Profile </div>
                                                                {row.status === 'Not Verified' && <div className="ml-2 p-1" onClick={() => onUpdateStatus(row)}> Update Status </div>}
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
                                        < div className="pagination justify-content-end align-items-center mb-4 border-top pt-3">
                                            {hcps.start + '-' + hcps.end + ' of ' + hcps.total}
                                            <LinkContainer to={`list?page=${hcps.page - 1}&status=${hcps.status}&country_iso2=${hcps.country_iso2}`}>
                                                <button className="btn btn-sm cdp-btn-secondary text-white mx-2" onClick={() => pageLeft()} disabled={hcps.page <= 1}>Prev</button>
                                            </LinkContainer>
                                            <LinkContainer to={`list?page=${hcps.page + 1}&status=${hcps.status}&country_iso2=${hcps.country_iso2}`}>
                                                <button className="btn btn-sm cdp-btn-secondary text-white" onClick={() => pageRight()} disabled={hcps.end === hcps.total}>Next</button>
                                            </LinkContainer>
                                        </div>
                                    }
                                </React.Fragment>
                            }

                            {hcps['users'] && hcps['users'].length === 0 &&
                                <>No profiles found!</>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </main >
    );
}

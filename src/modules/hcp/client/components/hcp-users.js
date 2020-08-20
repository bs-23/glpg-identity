import { NavLink } from 'react-router-dom';
import Dropdown from 'react-bootstrap/Dropdown';
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { LinkContainer } from 'react-router-bootstrap';
import { Form, Formik, Field, ErrorMessage } from "formik";
import { useToasts } from 'react-toast-notifications';
import { getHcpProfiles, hcpsSort } from '../hcp.actions';
import { ApprovalRejectSchema } from '../hcp.schema'
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';
import _ from 'lodash'

export default function hcpUsers() {
    const dispatch = useDispatch();
    const [countries, setCountries] = useState([]);
    const [show, setShow] = useState(false);
    const [currentAction, setCurrentAction] = useState('');
    const [currentUser, setCurrentUser] = useState({});
    const { addToast } = useToasts();
    const [sort, setSort] = useState({ type: 'ASC', value: null });

    const hcps = useSelector(state => state.hcpReducer.hcps);

    const pageLeft = () => {
        if (hcps.page > 1) dispatch(getHcpProfiles(hcps.page - 1, hcps.status, hcps.codbase));
    };

    const pageRight = () => {
        if (hcps.end !== hcps.total) dispatch(getHcpProfiles(hcps.page + 1, hcps.status, hcps.codbase));
    };


    const sortHcp = (val) => {
        if (sort.value === val) {
            dispatch(hcpsSort(sort.type === 'ASC' ? 'DESC' : 'ASC', val));
            setSort({ type: sort.type === 'ASC' ? 'DESC' : 'ASC', value: val });
        } else {
            dispatch(hcpsSort('ASC', val));
            setSort({ type: 'ASC', value: val });
        }
    };

    async function getCountries() {
        const response = await axios.get('/api/countries');
        setCountries(response.data);
    }

    const onUpdateStatus = (user) => {
        axios.get(`/api/hcp-profiles/${user.id}/consents`).then((response) => {
            user.consents = response.data.data;
            setCurrentAction('Update Status');
            setCurrentUser(user);
            setShow(true);
        });
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
            params.get('page') ? params.get('page') : null,
            params.get('status') ? params.getAll('status') : null,
            params.get('codbase') ? params.get('codbase') : null
        ))
    };

    const isAllVerifiedStatus = () => {
        if(Array.isArray(hcps.status)) {
            const allVerifiedStatus = ["self_verified", "manually_verified"];
            let isSubset = true;
            allVerifiedStatus.forEach(status => { if(!hcps.status.includes(status)) isSubset = false });
            return isSubset && (hcps.status.length === 2);
        }
        return false;
    }

    const getSelectedStatus = () => {
        if(Array.isArray(hcps.status)) return isAllVerifiedStatus() ? 'All Verified' : hcps.status.map(status => _.startCase(_.toLower(status.replace('_', ' ')))).join(', ');
        return hcps.status ? _.startCase(_.toLower(hcps.status.replace('_', ' '))) : 'All';
    }

    useEffect(() => {
        getCountries();
        loadHcpProfile()
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
                                <li className="breadcrumb-item active"><span>HCP Profile List</span></li>
                            </ol>
                        </nav>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <div>
                            <div className="d-sm-flex justify-content-between align-items-center mb-3 mt-4">
                                <h4 className="cdp-text-primary font-weight-bold mb-0">HCP Profiles</h4>
                                <div className="d-flex pt-3 pt-sm-0">
                                    {countries && hcps['countries'] &&
                                        <React.Fragment>
                                            <Dropdown className="d-inline-block show dropdown rounded pl-2 mr-2 dropdown cdp-btn-primary text-white dropdown shadow-sm">
                                                Country
                                                <Dropdown.Toggle variant="" className="ml-2 bg-white rounded-0">
                                                    {hcps.codbase && (countries.find(i => i.codbase === hcps.codbase)) ? (countries.find(i => i.codbase === hcps.codbase)).codbase_desc : 'All'}
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu>
                                                    <LinkContainer to={`list${hcps.status ? `?status=${hcps.status}` : ''}`}><Dropdown.Item className={hcps.codbase === null ? 'd-none' : ''} onClick={() => dispatch(getHcpProfiles(null, hcps.status, null))}>All</Dropdown.Item></LinkContainer>
                                                    {
                                                        countries.map((item, index) => (
                                                            <LinkContainer key={index} to={`list?${hcps.status ? `status=${hcps.status}` : ''}${`${hcps.status ? '&' : ''}codbase=${item.codbase}`}`}>
                                                                <Dropdown.Item className={hcps.countries.includes(item.country_iso2) && hcps.codbase === item.codbase ? 'd-none' : ''} onClick={() => dispatch(getHcpProfiles(null, hcps.status, item.codbase))}>
                                                                    {
                                                                        hcps.countries.includes(item.country_iso2) ? item.codbase_desc : null
                                                                    }
                                                                </Dropdown.Item>
                                                            </LinkContainer>
                                                        ))

                                                    }
                                                </Dropdown.Menu>
                                            </Dropdown>

                                            <Dropdown className="d-inline-block show dropdown rounded pl-2 mr-2 dropdown cdp-btn-secondary text-white dropdown shadow-sm">
                                                Status
                                                <Dropdown.Toggle variant="" className="ml-2 bg-white rounded-0">
                                                    {getSelectedStatus()}
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu>
                                                    <LinkContainer to={`list${hcps.codbase ? `?codbase=${hcps.codbase}` : ''}`}>
                                                        <Dropdown.Item className={hcps.status === null ? 'd-none' : ''} onClick={() => dispatch(getHcpProfiles(null, null, hcps.codbase))}>All</Dropdown.Item>
                                                    </LinkContainer>
                                                    <LinkContainer to={`list?status=self_verified&status=manually_verified${hcps.codbase ? `&codbase=${hcps.codbase}` : ''}`} disabled={isAllVerifiedStatus()}>
                                                        <Dropdown.Item onClick={() => dispatch(getHcpProfiles(null, ['self_verified', 'manually_verified'], hcps.codbase))}>All Verified</Dropdown.Item>
                                                    </LinkContainer>
                                                    <LinkContainer to={`list?status=self_verified${hcps.codbase ? `&codbase=${hcps.codbase}` : ''}`}>
                                                        <Dropdown.Item className={hcps.status === 'self_verified' ? 'd-none' : 'pl-5'} onClick={() => dispatch(getHcpProfiles(null, 'self_verified', hcps.codbase))}>Self Verified</Dropdown.Item>
                                                    </LinkContainer>
                                                    <LinkContainer to={`list?status=manually_verified${hcps.codbase ? `&codbase=${hcps.codbase}` : ''}`}>
                                                        <Dropdown.Item className={hcps.status === 'manually_verified' ? 'd-none' : 'pl-5'} onClick={() => dispatch(getHcpProfiles(null, 'manually_verified', hcps.codbase))}>Manually Verified</Dropdown.Item>
                                                    </LinkContainer>
                                                    <LinkContainer to={`list?status=consent_pending${hcps.codbase ? `&codbase=${hcps.codbase}` : ''}`}>
                                                        <Dropdown.Item className={hcps.status === 'consent_pending' ? 'd-none' : ''} onClick={() => dispatch(getHcpProfiles(null, 'consent_pending', hcps.codbase))}>Consent Pending</Dropdown.Item>
                                                    </LinkContainer>
                                                    <LinkContainer to={`list?status=not_verified${hcps.codbase ? `&codbase=${hcps.codbase}` : ''}`}>
                                                        <Dropdown.Item className={hcps.status === 'not_verified' ? 'd-none' : ''} onClick={() => dispatch(getHcpProfiles(null, 'not_verified', hcps.codbase))}>Not Verified</Dropdown.Item>
                                                    </LinkContainer>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </React.Fragment>
                                    }
                                </div>

                            </div>
                            <Modal
                                show={show}
                                onHide={() => { setCurrentAction(''); setShow(false) }}
                                dialogClassName="modal-customize"
                                aria-labelledby="example-custom-modal-styling-title"
                                centered
                            >
                                <Modal.Header closeButton>
                                    <Modal.Title id="example-custom-modal-styling-title">
                                        Status Update
                                    </Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <div className="p-3">
                                        <div className="row">
                                            <div className="col">
                                                <h4 className="font-weight-bold">{`${currentUser.first_name} ${currentUser.last_name}`}</h4>
                                                <div className="mt-1">{currentUser.email}</div>
                                                <div className="mt-1">{(new Date(currentUser.created_at)).toLocaleDateString('en-GB').replace(/\//g, '.')}</div>
                                            </div>
                                        </div>
                                        <h6 className="font-weight-bold mt-3">Consents: </h6>
                                        {currentUser.consents && currentUser.consents.length && <div className="row mt-1">
                                            <div className="col">
                                                {currentUser.consents.map(consent => <div key={consent.id} >{ consent.title }</div> )}
                                            </div>
                                        </div>}
                                        <Formik
                                            initialValues={{
                                                comment: '',
                                                selectedStatus: ''
                                            }}
                                            displayName="ApproveRejectForm"
                                            validationSchema={ApprovalRejectSchema}
                                            onSubmit={(values, actions) => {
                                                if (values.selectedStatus === 'approve') {
                                                    axios.put(`/api/hcp-profiles/${currentUser.id}/approve`, { comment: '' })
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
                                                setCurrentAction('');
                                            }}
                                        >
                                            {formikProps => (
                                                <Form onSubmit={formikProps.handleSubmit}>
                                                    <div className="row">
                                                        <div className="col-6">
                                                            <a onClick={() => formikProps.setFieldValue('selectedStatus', 'approve')} className={`btn btn-block cdp-btn-outline-primary mt-4 p-2 font-weight-bold ${formikProps.values.selectedStatus === 'approve' ? 'selected' : ''}`} >Approve User</a>
                                                        </div>
                                                        <div className="col-6">
                                                            <a onClick={() => formikProps.setFieldValue('selectedStatus', 'reject')} className={`btn btn-block cdp-btn-outline-danger mt-4 p-2 font-weight-bold  ${formikProps.values.selectedStatus === 'reject' ? 'selected' : ''}`} >Reject User</a>
                                                        </div>
                                                    </div>
                                                    {formikProps.values.selectedStatus === 'reject' && <div className="row mt-4">
                                                        <div className="col-12 col-sm-12">
                                                            <div className="form-group mb-0">
                                                                <label className="font-weight-bold" htmlFor="comment">Comment <span className="text-danger">*</span></label>
                                                                <Field className="form-control" data-testid='comment' component="textarea" rows="4" name="comment" />
                                                                <div className="invalid-feedback"><ErrorMessage name="comment" /></div>
                                                            </div>
                                                        </div>
                                                    </div>}
                                                    <button type="submit" data-testid='submit' className="btn btn-block text-white cdp-btn-secondary mt-5 p-2" disabled={!formikProps.values.selectedStatus || formikProps.isSubmitting}>Save Changes</button>
                                                </Form>
                                            )}
                                        </Formik>
                                    </div>
                                </Modal.Body>

                            </Modal>
                            {hcps['users'] && hcps['users'].length > 0 &&
                                <React.Fragment>
                                    <div className="shadow-sm bg-white table-responsive">
                                        <table className="table table-hover table-sm mb-0 cdp-table">
                                            <thead className="cdp-bg-primary text-white cdp-table__header">
                                                <tr>
                                                <th><span className={sort.value === 'email' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : `cdp-table__col-sorting`} onClick={() => sortHcp('email')}>Email<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>
                                                <th><span className={sort.value === 'created_at' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : `cdp-table__col-sorting`} onClick={() => sortHcp('created_at')}>Date of Registration<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>
                                                <th><span className={sort.value === 'first_name' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : `cdp-table__col-sorting`} onClick={() => sortHcp('first_name')}>First Name<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>
                                                <th><span className={sort.value === 'last_name' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : `cdp-table__col-sorting`} onClick={() => sortHcp('last_name')}>Last Name<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>
                                                <th><span className={sort.value === 'status' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : `cdp-table__col-sorting`} onClick={() => sortHcp('status')}>Status<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>
                                                <th><span className={sort.value === 'uuid' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : `cdp-table__col-sorting`} onClick={() => sortHcp('uuid')}>UUID<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>
                                                <th><span className={sort.value === 'specialty_name' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : `cdp-table__col-sorting`} onClick={() => sortHcp('specialty_name')}>Specialty<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>
                                                <th><span className={sort.value === 'consent_type' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : `cdp-table__col-sorting`} onClick={() => sortHcp('consent_type')}>Consent Type<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="cdp-table__body bg-white">
                                                {hcps['users'].map((row, index) => (
                                                    <tr key={index}>
                                                        <td>{row.email}</td>
                                                        <td>{(new Date(row.created_at)).toLocaleDateString('en-GB').replace(/\//g, '.')}</td>
                                                        <td>{row.first_name}</td>
                                                        <td>{row.last_name}</td>
                                                        <td>
                                                        {row.status === 'self_verified' ? <span><i className="fa fa-xs fa-circle text-success pr-2"></i>Self Verified</span> :
                                                            row.status === 'manually_verified' ? <span><i className="fa fa-xs fa-circle text-success pr-2"></i>Manually Verified</span> :
                                                                row.status === 'consent_pending' ? <span><i className="fa fa-xs fa-circle text-warning pr-2"></i>Consent Pending</span> :
                                                                    row.status === 'not_verified' ? <span><i className="fa fa-xs fa-circle text-warning pr-2"></i>Not Verified</span> :
                                                                        row.status === 'rejected' ? <span><i className="fa fa-xs fa-circle text-danger pr-2"></i>Rejected</span> : <span></span>
                                                            }
                                                        </td>
                                                        <td>{row.uuid}</td>
                                                        <td>{row.specialty_description}</td>
                                                        <td>{row.consent_types}</td>
                                                        <td>
                                                            <span>
                                                                <Dropdown className="ml-auto dropdown-customize">
                                                                    <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle btn-sm">
                                                                        {currentAction ? currentAction : 'Select an action'}
                                                                    </Dropdown.Toggle>
                                                                    <Dropdown.Menu>
                                                                        <LinkContainer to="#"><Dropdown.Item>Manage Profile</Dropdown.Item></LinkContainer>
                                                                        {/* <LinkContainer to="#"><Dropdown.Item>Edit Profile</Dropdown.Item></LinkContainer> */}

                                                                        {row.status === 'not_verified' && <LinkContainer to="#"><Dropdown.Item onClick={() => onUpdateStatus(row)}>Manage Status</Dropdown.Item></LinkContainer>}
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
                                                <LinkContainer to={`list?page=${hcps.page - 1}${hcps.status ? `&status=${hcps.status}` : ''}${hcps.codbase ? `&codbase=${hcps.codbase}` : ''}`}>
                                                    <span className="pagination-btn" data-testid='Prev' onClick={() => pageLeft()} disabled={hcps.page <= 1}><i className="icon icon-arrow-down ml-2 prev"></i></span>
                                                </LinkContainer>
                                                <LinkContainer to={`list?page=${hcps.page + 1}${hcps.status ? `&status=${hcps.status}` : ''}${hcps.codbase ? `&codbase=${hcps.codbase}` : ''}`}>
                                                    <span className="pagination-btn" data-testid='Next' onClick={() => pageRight()} disabled={hcps.end === hcps.total}><i className="icon icon-arrow-down ml-2 next"></i></span>
                                                </LinkContainer>
                                            </div>
                                        }
                                    </div>

                                </React.Fragment>
                            }

                            {hcps['users'] && hcps['users'].length === 0 &&
                                <>
                                    <div className="row justify-content-center mt-sm-5 pt-5 mb-3">
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

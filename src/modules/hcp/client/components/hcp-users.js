import React, { useEffect, useState } from "react";
import { Form, Formik, Field, ErrorMessage } from 'formik';
import { NavLink, useLocation, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useToasts } from 'react-toast-notifications';
import { LinkContainer } from 'react-router-bootstrap';
import Accordion from 'react-bootstrap/Accordion';
import Dropdown from 'react-bootstrap/Dropdown';
import Modal from 'react-bootstrap/Modal';
import Card from 'react-bootstrap/Card';
import parse from 'html-react-parser';
import axios from 'axios';
import _ from 'lodash';

import { getHcpProfiles } from '../hcp.actions';
import { ApprovalRejectSchema } from '../hcp.schema';
import uuidAuthorities from '../uuid-authorities.json';
import { getAllCountries } from '../../../core/client/country/country.actions';


export default function hcpUsers() {
    const dispatch = useDispatch();
    const location = useLocation();
    const history = useHistory();
    const params = new URLSearchParams(window.location.search);

    const [show, setShow] = useState({ profileManage: false, updateStatus: false });
    const [currentUser, setCurrentUser] = useState({});
    const { addToast } = useToasts();
    const [sort, setSort] = useState({ type: 'ASC', value: null });

    const hcps = useSelector(state => state.hcpReducer.hcps);
    const countries = useSelector(state => state.countryReducer.countries);
    const allCountries = useSelector(state => state.countryReducer.allCountries);

    const pageLeft = () => {
        if (hcps.page > 1) urlChange(hcps.page - 1, hcps.codbase, hcps.status, params.get('orderBy'), true);
    };

    const pageRight = () => {
        if (hcps.end !== hcps.total) urlChange(hcps.page + 1, hcps.codbase, hcps.status, params.get('orderBy'), true);
    };

    const onUpdateStatus = (user) => {
        setCurrentUser(user);
        setShow({ ...show, updateStatus: true });
    }

    const onUpdateStatusSuccess = () => {
        addToast('Successfully changed user status.', {
            appearance: 'success',
            autoDismiss: true
        })
        loadHcpProfiles()
    }

    const onUpdateStatusFailure = (error) => {
        const errorMessage = error.response.data.errors.length ? error.response.data.errors[0].message : 'Could not change user status.'
        addToast(errorMessage, {
            appearance: 'error',
            autoDismiss: true
        });
    }

    const loadHcpProfiles = () => {
        const searchObj = {};
        const searchParams = location.search.slice(1).split("&");
        searchParams.forEach(element => {
            searchObj[element.split("=")[0]] = element.split("=")[1];
        });
        dispatch(getHcpProfiles(searchObj.page, searchObj.status, searchObj.codbase, searchObj.orderBy, searchObj.orderType));
        setSort({ type: params.get('orderType'), value: params.get('orderBy') });
    };

    const getConsentsForCurrentUser = async () => {
        const { data } = await axios.get(`/api/hcp-profiles/${currentUser.id}/consents`);
        setCurrentUser({ ...currentUser, consents: data.data });
    }

    const isAllVerifiedStatus = () => {
        if (Array.isArray(hcps.status)) {
            const allVerifiedStatus = ["self_verified", "manually_verified"];
            let isSubset = true;
            allVerifiedStatus.forEach(status => { if (!hcps.status.includes(status)) isSubset = false });
            return isSubset && (hcps.status.length === 2);
        }
        return false;
    }

    const getSelectedStatus = () => {
        if (Array.isArray(hcps.status)) return isAllVerifiedStatus() ? 'All Verified' : hcps.status.map(status => _.startCase(_.toLower(status.replace('_', ' ')))).join(', ');
        return hcps.status ? _.startCase(_.toLower(hcps.status.replace('_', ' '))) : 'All';
    }

    const onManageProfile = (user) => {
        setShow({ ...show, profileManage: true });
        setCurrentUser(user);
    }

    const getCountryName = (country_iso2) => {
        if (!allCountries || !country_iso2) return null;
        const country = allCountries.find(c => c.country_iso2.toLowerCase() === country_iso2.toLowerCase());
        return country && country.codbase_desc;
    }

    const getUuidAuthorities = (codbase) => {
        if (codbase) {
            const authorityByCountry = uuidAuthorities.filter(a => a.codbase.toLowerCase() === codbase.toLowerCase());
            return authorityByCountry;
        }

        return uuidAuthorities;
    };

    const urlChange = (pageNo, codBase, status, orderColumn, pageChange = false) => {
        if(Array.isArray(status)) status = 'self_verified,manually_verified';
        let orderType = params.get('orderType');
        const orderBy = params.get('orderBy');
        const page = pageNo ? pageNo : (params.get('page') ? params.get('page') : 1);
        const codbase = (codBase) ? codBase : params.get('codbase');
        if (!pageChange) {
            (orderBy === orderColumn) ? (orderType === 'asc' ? orderType = 'desc' : orderType = 'asc') : orderType = 'asc';
        }
        const url = `?page=${page}` + (codbase && codbase !== 'null' ? `&codbase=${codbase}` : ``) + (status && status !== 'null' ? `&status=${status}` : '') + (orderType !== 'null' && orderColumn !== 'null' && orderColumn !== null ? `&orderType=${orderType}&orderBy=${orderColumn}` : ``);
        history.push(location.pathname + url);
    };

    const openAuthorityLink = (link) => {
        if(!link) return;
        window.open(link, 'name','width=600,height=400');
    }

    useEffect(() => {
        dispatch(getAllCountries());
    }, []);

    useEffect(() => {
        loadHcpProfiles();
    }, [location]);

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
                                <div className="d-flex align-items-center justify-content-between">
                                    <h4 className="cdp-text-primary font-weight-bold mb-0 mr-sm-4 mr-1">List of HCP User</h4>
                                    <div className="">
                                        <div>
                                            {hcps.codbase ?
                                                getUuidAuthorities(hcps.codbase).map(authority =>
                                                    (
                                                        <a key={authority.link} className="mr-3" role="button" onClick={() => openAuthorityLink(authority.link)}>
                                                            <img src={authority.logo} title={authority.name + " Logo"} alt={authority.name} height={authority.heightSingle} />
                                                        </a>
                                                    )
                                                )
                                                :
                                                <Dropdown>
                                                    <Dropdown.Toggle variant="" id="dropdown-basic" className="cdp-btn-outline-primary px-sm-3 px-2">
                                                        UUID Authorities
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu className="dropdown-menu__no-hover py-0">
                                                        {
                                                            getUuidAuthorities().map(authority =>
                                                                (
                                                                    <Dropdown.Item
                                                                        key={authority.link} className="border-bottom py-2 px-3"
                                                                        onClick={() => openAuthorityLink(authority.link)}
                                                                        role="button"
                                                                        >
                                                                        <img src={authority.logo} title={authority.name + " Logo"} alt={authority.name} height={authority.height} />
                                                                    </Dropdown.Item>
                                                                )
                                                            )
                                                        }
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            }
                                        </div>
                                    </div>
                                </div>
                                <div className="d-flex pt-3 pt-sm-0">
                                    {countries && hcps['countries'] &&
                                        <React.Fragment>
                                            <Dropdown className="ml-auto dropdown-customize mr-2">
                                                <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle fixed-width btn d-flex align-items-center">
                                                    <i className="icon icon-filter mr-2 mb-n1"></i> {hcps.codbase && (countries.find(i => i.codbase === hcps.codbase)) ? (countries.find(i => i.codbase === hcps.codbase)).codbase_desc : 'Filter by Country'}
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu>
                                                    <Dropdown.Item className={hcps.codbase === null ? 'd-none' : ''} onClick={() => urlChange(1, 'null', hcps.status, params.get('orderBy'), params.get('orderType'))}>All</Dropdown.Item>
                                                    {
                                                        countries.map((item, index) => (
                                                            hcps.countries.includes(item.country_iso2) &&
                                                            <Dropdown.Item key={index} className={hcps.countries.includes(item.country_iso2) && hcps.codbase === item.codbase ? 'd-none' : ''} onClick={() => urlChange(1, item.codbase, hcps.status, params.get('orderBy'), params.get('orderType'))}>
                                                                {
                                                                    hcps.countries.includes(item.country_iso2) ? item.codbase_desc : null
                                                                }
                                                            </Dropdown.Item>
                                                        ))

                                                    }
                                                </Dropdown.Menu>
                                            </Dropdown>

                                            <Dropdown className="d-inline-block show dropdown rounded pl-2 mr-2 dropdown cdp-bg-secondary text-white dropdown shadow-sm">
                                                Status
                                                <Dropdown.Toggle variant="" className="ml-2 cdp-bg-secondary rounded-0 border-left text-white">
                                                    {getSelectedStatus()}
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu>
                                                    <Dropdown.Item className={hcps.status === null ? 'd-none' : ''} onClick={() => urlChange(1, hcps.codbase, null, params.get('orderBy'), params.get('orderType'))}>All</Dropdown.Item>
                                                    <Dropdown.Item className={isAllVerifiedStatus() ? 'd-none' : ''} onClick={() => urlChange(1, hcps.codbase, 'self_verified,manually_verified', params.get('orderBy'), params.get('orderType'))}>All Verified</Dropdown.Item>
                                                    <Dropdown.Item className={hcps.status === 'self_verified' ? 'd-none' : ''} onClick={() => urlChange(1, hcps.codbase, 'self_verified', params.get('orderBy'), params.get('orderType'))}>Self Verified</Dropdown.Item>
                                                    <Dropdown.Item className={hcps.status === 'manually_verified' ? 'd-none' : ''} onClick={() => urlChange(1, hcps.codbase, 'manually_verified', params.get('orderBy'), params.get('orderType'))}>Manually Verified</Dropdown.Item>
                                                    <Dropdown.Item className={hcps.status === 'consent_pending' ? 'd-none' : ''} onClick={() => urlChange(1, hcps.codbase, 'consent_pending', params.get('orderBy'), params.get('orderType'))}>Consent Pending</Dropdown.Item>
                                                    <Dropdown.Item className={hcps.status === 'not_verified' ? 'd-none' : ''} onClick={() => urlChange(1, hcps.codbase, 'not_verified', params.get('orderBy'), params.get('orderType'))}>Not Verified</Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </React.Fragment>
                                    }
                                </div>

                            </div>
                            <Modal
                                size="lg"
                                show={show.profileManage}
                                onShow={getConsentsForCurrentUser}
                                onHide={() => { setShow({ ...show, profileManage: false }) }}
                                dialogClassName="modal-customize mw-75"
                                aria-labelledby="example-custom-modal-styling-title"
                                centered
                            >
                                <Modal.Header closeButton>
                                    <Modal.Title id="example-custom-modal-styling-title">
                                        Profile Details
                                    </Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <div className="px-4 py-3">
                                        <div className="row">
                                            <div className="col">
                                                <h4 className="mt-1 font-weight-bold">{`${currentUser.first_name || ''} ${currentUser.last_name || ''}`}</h4>
                                                <div className="">{currentUser.specialty_description}</div>
                                            </div>
                                        </div>
                                        <div className="row mt-3">
                                            <div className="col-6">
                                                <div className="mt-1 font-weight-bold">UUID</div>
                                                <div className="">{currentUser.uuid || '--'}</div>
                                            </div>
                                            <div className="col-6">
                                                <div className="mt-1 font-weight-bold">OneKeyID</div>
                                                <div className="">{currentUser.individual_id_onekey || '--'}</div>
                                            </div>
                                        </div>
                                        <div className="row mt-3">
                                            <div className="col-6">
                                                <div className="mt-1 font-weight-bold">Email</div>
                                                <div className="">{currentUser.email || '--'}</div>
                                            </div>
                                            <div className="col-6">
                                                <div className="mt-1 font-weight-bold">Phone Number</div>
                                                <div className="">{currentUser.telephone || '--'}</div>
                                            </div>
                                        </div>
                                        <div className="row mt-3">
                                            <div className="col-6">
                                                <div className="mt-1 font-weight-bold">Country</div>
                                                <div className="">{getCountryName(currentUser.country_iso2) || '--'}</div>
                                            </div>
                                            <div className="col-6">
                                                <div className="mt-1 font-weight-bold">Date of Registration</div>
                                                <div className="">{currentUser.created_at ? (new Date(currentUser.created_at)).toLocaleDateString('en-GB').replace(/\//g, '.') : '--'}</div>
                                            </div>
                                        </div>
                                        <div className="row mt-3">
                                            <div className="col-6">
                                                <div className="mt-1 font-weight-bold">Status</div>
                                                <div className="text-capitalize">{currentUser.status ? _.startCase(_.toLower(currentUser.status.replace(/_/g, ' '))) : '--'}</div>
                                            </div>
                                            <div className="col-6">
                                                <div className="mt-1 font-weight-bold">Date of Birth</div>
                                                <div className="">{currentUser.birthdate ? currentUser.birthdate : '--'}</div>
                                            </div>
                                        </div>
                                        <div className="row mt-4">
                                            <div className="col accordion-consent rounded shadow-sm p-0">
                                                <h4 className="accordion-consent__header p-3 font-weight-bold mb-0 cdp-light-bg">Consents</h4>
                                                {currentUser.consents && currentUser.consents.length ? <Accordion>{currentUser.consents.map(consent =>
                                                    {return consent.consent_given === true ? <Card key={consent.id}>
                                                        <Accordion.Collapse eventKey={consent.id}>
                                                            <Card.Body>
                                                                <div>{parse(consent.rich_text)}</div>
                                                                <div className="pt-2"><span className="pr-1 text-dark"><i className="icon icon-check-square mr-1 small"></i>Consent Opt-Type:</span> <span className="text-capitalize">{consent.opt_type}</span></div>
                                                                {consent.consent_given && <div><span className="pr-1 text-dark"><i className="icon icon-calendar-check mr-1 small"></i>Consent given date:</span>{(new Date(consent.consent_given_time)).toLocaleDateString('en-GB').replace(/\//g, '.')}</div>}
                                                            </Card.Body>
                                                        </Accordion.Collapse>
                                                        <Accordion.Toggle as={Card.Header} eventKey={consent.id} className="p-3 d-flex align-items-baseline justify-content-between border-0" role="button">
                                                            <span className="d-flex align-items-center"><i class={`icon ${consent.consent_given ? 'icon-check-filled' : 'icon-close-circle text-danger'} cdp-text-primary mr-4 consent-check`}></i> <span className="consent-summary">{consent.preference}</span></span>
                                                            <i className="icon icon-arrow-down ml-2 accordion-consent__icon-down"></i>
                                                        </Accordion.Toggle>
                                                    </Card> : null}
                                                )}</Accordion> : <div className="m-3 alert alert-warning">The HCP has not given any consent.</div>}
                                            </div>
                                        </div>
                                    </div>
                                </Modal.Body>
                            </Modal>
                            <Modal

                                show={show.updateStatus}
                                onShow={getConsentsForCurrentUser}
                                onHide={() => { setShow({ ...show, updateStatus: false }) }}
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
                                                <div className="mt-1 pb-2">{(new Date(currentUser.created_at)).toLocaleDateString('en-GB').replace(/\//g, '.')}</div>
                                            </div>
                                        </div>
                                        <div>
                                            <h5 className="font-weight-bold my-3">Consents: </h5>
                                            <div className="row pb-3">
                                                <div className="col">
                                                    {currentUser.consents && currentUser.consents.length ?
                                                        currentUser.consents.map(consent => {return consent.consent_given && <div className="pb-1" key={consent.id} >
                                                            <i className={`icon ${consent.consent_given ? 'icon-check-filled' : 'icon-close-circle text-danger'} cdp-text-primary mr-2 small`}></i>{consent.preference}
                                                        </div>})
                                                        : <div className="alert alert-warning">The HCP has not given any consent.</div>
                                                    }
                                                </div>
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
                                                    axios.put(`/api/hcp-profiles/${currentUser.id}/approve`, { comment: '' })
                                                        .then(() => onUpdateStatusSuccess())
                                                        .catch(err => onUpdateStatusFailure(err))
                                                }
                                                if (values.selectedStatus === 'reject') {
                                                    axios.put(`/api/hcp-profiles/${currentUser.id}/reject`, values)
                                                        .then(() => onUpdateStatusSuccess())
                                                        .catch(err => onUpdateStatusFailure(err))
                                                }
                                                actions.setSubmitting(false);
                                                actions.resetForm();
                                                setShow({ ...show, updateStatus: false });
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
                                        <table className="table table-hover table-sm mb-0 cdp-table cdp-table-sm">
                                            <thead className="cdp-bg-primary text-white cdp-table__header">
                                                <tr>
                                                    <th><span className={sort.value === 'email' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : `cdp-table__col-sorting`} onClick={() => urlChange(1, hcps.codBase, hcps.status, 'email')}>Email<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>
                                                    <th><span className={sort.value === 'created_at' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : `cdp-table__col-sorting`} onClick={() => urlChange(1, hcps.codBase, hcps.status, 'created_at')}>Date of Registration<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>
                                                    <th><span className={sort.value === 'first_name' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : `cdp-table__col-sorting`} onClick={() => urlChange(1, hcps.codBase, hcps.status, 'first_name')}>First Name<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>
                                                    <th><span className={sort.value === 'last_name' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : `cdp-table__col-sorting`} onClick={() => urlChange(1, hcps.codBase, hcps.status, 'last_name')}>Last Name<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>
                                                    <th><span className={sort.value === 'status' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : `cdp-table__col-sorting`} onClick={() => urlChange(1, hcps.codBase, hcps.status, 'status')}>Status<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>
                                                    <th><span className={sort.value === 'uuid' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : `cdp-table__col-sorting`} onClick={() => urlChange(1, hcps.codBase, hcps.status, 'uuid')}>UUID<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>
                                                    <th><span >Country</span></th>
                                                    <th><span>Specialty</span></th>
                                                    <th className="consent-col">Single<br /> Opt-In</th>
                                                    <th className="consent-col">Double<br /> Opt-In</th>
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
                                                        <td className="text-nowrap">
                                                            {row.status === 'self_verified' ? <span><i className="fa fa-xs fa-circle text-success pr-2 hcp-status-icon"></i>Self Verified</span> :
                                                                row.status === 'manually_verified' ? <span><i className="fa fa-xs fa-circle text-success pr-2 hcp-status-icon"></i>Manually Verified</span> :
                                                                    row.status === 'consent_pending' ? <span><i className="fa fa-xs fa-circle text-warning pr-2 hcp-status-icon"></i>Consent Pending</span> :
                                                                        row.status === 'not_verified' ? <span><i className="fa fa-xs fa-circle text-danger pr-2 hcp-status-icon"></i>Not Verified</span> :
                                                                            row.status === 'rejected' ? <span><i className="fa fa-xs fa-circle text-danger pr-2 hcp-status-icon"></i>Rejected</span> : <span></span>
                                                            }
                                                        </td>
                                                        <td>{row.uuid}</td>
                                                        <td><span>{getCountryName(row.country_iso2)}</span></td>
                                                        <td>{row.specialty_description}</td>
                                                        <td>{row.opt_types.includes('single-opt-in') ? <i className="fas fa-check-circle cdp-text-primary font-size-15px"></i> : <i className="icon icon-close-circle text-danger consent-not-given"> </i>}</td>
                                                        <td>{row.opt_types.includes('double-opt-in') ? <i className="fas fa-check-circle cdp-text-primary font-size-15px"></i> : <i className="icon icon-close-circle text-danger consent-not-given"> </i>}</td>
                                                        <td>
                                                            <span>
                                                                <Dropdown className="ml-auto dropdown-customize">
                                                                    <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle btn-sm py-0 px-1">
                                                                    </Dropdown.Toggle>
                                                                    <Dropdown.Menu>
                                                                        <LinkContainer to="#"><Dropdown.Item onClick={() => onManageProfile(row)}>Profile</Dropdown.Item></LinkContainer>
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
                                                <span className="pagination-btn" data-testid='Prev' onClick={() => pageLeft()} disabled={hcps.page <= 1}><i className="icon icon-arrow-down ml-2 prev"></i></span>
                                                <span className="pagination-btn" data-testid='Next' onClick={() => pageRight()} disabled={hcps.end === hcps.total}><i className="icon icon-arrow-down ml-2 next"></i></span>
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

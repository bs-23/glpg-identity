import { NavLink } from 'react-router-dom';
import Dropdown from 'react-bootstrap/Dropdown';
import Modal from 'react-bootstrap/Modal';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { LinkContainer } from 'react-router-bootstrap';
import { Form, Formik, Field, ErrorMessage } from "formik";
import { useToasts } from 'react-toast-notifications';
import axios from 'axios';

import _ from 'lodash';
import parse from 'html-react-parser';
import { getConsentReport } from '../consent.action';

const ConsentPerformanceReport = () => {
    const dispatch = useDispatch();
    const [countries, setCountries] = useState([]);
    const [allCountries, setAllCountries] = useState([]);
    const [allProcessActivities, setAllProcessActivities] = useState([]);
    // const [show, setShow] = useState({ profileManage: false, updateStatus: false });
    // const [currentAction, setCurrentAction] = useState({ userId: null, action: null });
    // const [currentUser, setCurrentUser] = useState({});
    const [mark, setMark] = useState([]);
    const { addToast } = useToasts();
    const [sort, setSort] = useState({ type: 'ASC', value: null });

    const consents_report = useSelector(state => state.consentReducer.consents);

    const pageLeft = () => {
        if (consents_report.page > 1) dispatch(getConsentReport(consents_report.page - 1, consents_report.codbase, consents_report.process_activity));
    };

    const pageRight = () => {
        if (consents_report.end !== consents_report.total) dispatch(getConsentReport(consents_report.page + 1, consents_report.codbase, consents_report.process_activity));
    };

    async function getCountries() {
        const response = await axios.get('/api/countries');
        setCountries(response.data);
    }

    async function getAllCountries() {
        const response = await axios.get('/api/all_countries');
        setAllCountries(response.data);
    }

    async function getAllProcessActivities() {
        const response = await axios.get('/api/get-all-process-activities');
        setAllProcessActivities(response.data);
    }

    async function loadConsentsReport() {
        const params = new URLSearchParams(window.location.search);
        dispatch(getConsentReport(
            params.get('page') ? params.get('page') : '',
            params.get('codbase') ? params.get('codbase') : '',
            params.get('process_activity') ? params.getAll('process_activity') : ''
        ));
    }

    useEffect(() => {
        getCountries();
        getAllCountries();
        getAllProcessActivities();
        loadConsentsReport();
    }, []);

    return (
        <main className="app__content cdp-light-bg">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb rounded-0">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item"><NavLink to="/consent">Data Privacy & Consent Management</NavLink></li>
                                <li className="breadcrumb-item active"><span>Consent Performance Report</span></li>
                            </ol>
                        </nav>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <div>
                            <div className="d-sm-flex justify-content-between align-items-center mb-3 mt-4">
                                <h4 className="cdp-text-primary font-weight-bold mb-0">Consent Performance Report</h4>
                                <div className="d-flex pt-3 pt-sm-0">
                                    {countries && consents_report['countries'] &&
                                        <React.Fragment>
                                            <Dropdown className="d-inline-block show dropdown rounded pl-2 mr-2 dropdown cdp-btn-primary text-white dropdown shadow-sm">
                                                Country
                                                <Dropdown.Toggle variant="" className="ml-2 bg-white rounded-0">
                                                    {consents_report.codbase && (countries.find(i => i.codbase === consents_report.codbase)) ? (countries.find(i => i.codbase === consents_report.codbase)).codbase_desc : 'All'}
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu>
                                                    <LinkContainer to={`consent-performance-report${consents_report.process_activity ? `?process_activity=${consents_report.process_activity}` : ''}`}><Dropdown.Item className={consents_report.codbase === '' ? 'd-none' : ''} onClick={() => dispatch(getConsentReport('', '', consents_report.process_activity))}>All</Dropdown.Item></LinkContainer>
                                                    {
                                                        countries.map((item, index) => (
                                                            <LinkContainer key={index} to={`consent-performance-report?codbase=${item.codbase}${consents_report.process_activity ? `&process_activity=${consents_report.process_activity}` : ''}`}>
                                                                <Dropdown.Item className={consents_report.countries.includes(item.country_iso2) && consents_report.codbase === item.codbase ? 'd-none' : ''} onClick={() => dispatch(getConsentReport('',  item.codbase, consents_report.process_activity))}>
                                                                    {
                                                                        consents_report.countries.includes(item.country_iso2) ? item.codbase_desc : null
                                                                    }
                                                                </Dropdown.Item>
                                                            </LinkContainer>
                                                        ))
                                                    }
                                                </Dropdown.Menu>
                                            </Dropdown>

                                            <Dropdown className="d-inline-block show dropdown rounded pl-2 mr-2 dropdown cdp-btn-primary text-white dropdown shadow-sm">
                                                Process Activity
                                                <Dropdown.Toggle variant="" className="ml-2 bg-white rounded-0">
                                                    {consents_report.process_activity && (allProcessActivities.find(i => i.type === consents_report.process_activity)) ? (allProcessActivities.find(i => i.type === consents_report.process_activity)).title : 'All'}
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu>
                                                    <LinkContainer to={`consent-performance-report${consents_report.codbase ? `?codbase=${consents_report.codbase}` : ''}`}><Dropdown.Item className={consents_report.process_activity === '' ? 'd-none' : ''} onClick={() => dispatch(getConsentReport('', consents_report.codbase, ''))}>All</Dropdown.Item></LinkContainer>
                                                    {
                                                        allProcessActivities.map((item, index) => (
                                                            <LinkContainer key={index} to={`consent-performance-report?${consents_report.codbase ? `codbase=${consents_report.codbase}` : ''}${`${consents_report.codbase ? '&' : ''}process_activity=${item.type}`}`}>
                                                                <Dropdown.Item className={consents_report.process_activity === item.type ? 'd-none' : ''} onClick={() => dispatch(getConsentReport('',  consents_report.codbase, item.type))}>
                                                                    {
                                                                        item.type === consents_report.process_activity ? null : item.title
                                                                    }
                                                                </Dropdown.Item>
                                                            </LinkContainer>
                                                        ))
                                                    }
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </React.Fragment>
                                    }
                                </div>
                            </div>
                            
                            {consents_report['hcp_consents'] && consents_report['hcp_consents'].length > 0 &&
                                <React.Fragment>
                                    <div className="shadow-sm bg-white table-responsive">
                                        <table className="table table-hover table-sm mb-0 cdp-table cdp-table-sm">
                                            <thead className="cdp-bg-primary text-white cdp-table__header">
                                                <tr>
                                                    <th><span className={sort.value === 'first_name' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : `cdp-table__col-sorting`} onClick={() => sortHcp('first_name')}>First Name<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>
                                                    <th><span className={sort.value === 'last_name' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : `cdp-table__col-sorting`} onClick={() => sortHcp('last_name')}>Last Name<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>
                                                    <th><span className={sort.value === 'email' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : `cdp-table__col-sorting`} onClick={() => sortHcp('email')}>Email<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>
                                                    <th><span className={sort.value === 'consent_type' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : `cdp-table__col-sorting`} onClick={() => sortHcp('consent_type')}>Consent Type<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>
                                                    <th><span className={sort.value === 'opt' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : `cdp-table__col-sorting`} onClick={() => sortHcp('opt')}>Opt<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>
                                                    <th><span className={sort.value === 'legal_basis' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : `cdp-table__col-sorting`} onClick={() => sortHcp('legal_basis')}>Legal Basis<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>
                                                    <th><span className={sort.value === 'preferences' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : `cdp-table__col-sorting`} onClick={() => sortHcp('preferences')}>Preferences<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>
                                                    <th><span className={sort.value === 'date' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : `cdp-table__col-sorting`} onClick={() => sortHcp('date')}>Date<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="cdp-table__body bg-white">
                                                {consents_report['hcp_consents'].map((row, index) => (
                                                    <tr key={index}>
                                                        <td>{row.hcp_profile.first_name}</td>
                                                        <td>{row.hcp_profile.last_name}</td>
                                                        <td><i className="icon icon-check-filled icon-position-bit-down text-primary-color mr-2 cdp-text-primary"></i>{row.hcp_profile.email}</td>
                                                        <td>{row.type}</td>
                                                        <td>{row.opt_type}</td>
                                                        <td>{row.legal_basis}</td>
                                                        <td>{row.preferences}</td>
                                                        <td>{(new Date(row.given_date)).toLocaleDateString('en-GB').replace(/\//g, '.')}</td>
                                                        <td>
                                                            <span>
                                                                <Dropdown className="ml-auto dropdown-customize">
                                                                        <Dropdown.Toggle variant="" className="cdp-btn-outline-primary font-weight-bold-light dropdown-toggle-without-icon btn-sm py-0 px-1 ">
                                                                            <i className="icon icon-setting"></i> Action
                                                                    </Dropdown.Toggle>
                                                                    <Dropdown.Menu>
                                                                        <LinkContainer to="#"><Dropdown.Item onClick={() => onManageProfile(row)}>Profile</Dropdown.Item></LinkContainer> 
                                                                         {row.status === 'not_verified' && <LinkContainer to="#"><Dropdown.Item onClick={() => onUpdateStatus(row)}>Manage Status</Dropdown.Item></LinkContainer>}
                                                                    </Dropdown.Menu>
                                                                </Dropdown>
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {((consents_report.page === 1 &&
                                            consents_report.total > consents_report.limit) ||
                                            (consents_report.page > 1))
                                            && consents_report['hcp_consents'] &&
                                            <div className="pagination justify-content-end align-items-center border-top p-3">
                                                <span className="cdp-text-primary font-weight-bold">{consents_report.start + ' - ' + consents_report.end}</span> <span className="text-muted pl-1 pr-2"> {' of ' + consents_report.total}</span>
                                                <LinkContainer to={`list?page=${consents_report.page - 1}${consents_report.status ? `&status=${consents_report.status}` : ''}${consents_report.codbase ? `&codbase=${consents_report.codbase}` : ''}`}>
                                                    <span className="pagination-btn" data-testid='Prev' onClick={() => pageLeft()} disabled={consents_report.page <= 1}><i className="icon icon-arrow-down ml-2 prev"></i></span>
                                                </LinkContainer>
                                                <LinkContainer to={`list?page=${consents_report.page + 1}${consents_report.status ? `&status=${consents_report.status}` : ''}${consents_report.codbase ? `&codbase=${consents_report.codbase}` : ''}`}>
                                                    <span className="pagination-btn" data-testid='Next' onClick={() => pageRight()} disabled={consents_report.end === consents_report.total}><i className="icon icon-arrow-down ml-2 next"></i></span>
                                                </LinkContainer>
                                            </div>
                                        }
                                    </div>

                                </React.Fragment>
                            }

                            {consents_report['hcp_consents'] && consents_report['hcp_consents'].length === 0 &&
                                <>
                                    <div className="row justify-content-center mt-sm-5 pt-5 mb-3">
                                        <div className="col-12 col-sm-6 py-4 bg-white shadow-sm rounded text-center">
                                            <i class="icon icon-team icon-6x cdp-text-secondary"></i>
                                            <h3 className="font-weight-bold cdp-text-primary pt-4">No  Consents Found!</h3>
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


export default ConsentPerformanceReport;

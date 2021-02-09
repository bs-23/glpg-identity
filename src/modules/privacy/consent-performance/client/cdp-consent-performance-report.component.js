import { NavLink } from 'react-router-dom';
import Dropdown from 'react-bootstrap/Dropdown';
import Modal from 'react-bootstrap/Modal';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { LinkContainer } from 'react-router-bootstrap';
import axios from 'axios';
import _ from 'lodash';
import parse from 'html-react-parser';
import fileDownload from 'js-file-download';

import { getAllCountries } from '../../../core/client/country/country.actions';
import Faq from '../../../platform/faq/client/faq.component';
import { getConsentReport } from './consent-performace.actions';

const CdpConsentPerformanceReport = () => {
    const dispatch = useDispatch();
    const allOptTypes = ["single-opt-in", "double-opt-in", "opt-out"];
    const [show, setShow] = useState({ profileManage: false, updateStatus: false });
    const [, setCurrentAction] = useState({ userId: null, action: null });
    const [currentUser, setCurrentUser] = useState({});

    const consents_init_report = useSelector(state => state.consentPerformanceReducer.consents);
    const [consents_report, modify_consents_report] = useState(consents_init_report);
    const countries = useSelector(state => state.countryReducer.countries);
    const allCountries = useSelector(state => state.countryReducer.allCountries);

    const [showFaq, setShowFaq] = useState(false);
    const handleCloseFaq = () => setShowFaq(false);
    const handleShowFaq = () => setShowFaq(true);

    const pageLeft = () => {
        if (consents_report.page > 1) dispatch(getConsentReport(consents_report.page - 1, consents_report.codbase, consents_report.opt_type, consents_report.orderBy, consents_report.orderType));
    };

    const pageRight = () => {
        if (consents_report.end !== consents_report.total) dispatch(getConsentReport(consents_report.page + 1, consents_report.codbase, consents_report.opt_type, consents_report.orderBy, consents_report.orderType));
    };

    async function loadConsentsReport() {
        const params = new URLSearchParams(window.location.search);
        dispatch(getConsentReport(
            params.get('page') ? params.get('page') : '',
            params.get('codbase') ? params.get('codbase') : '',
            params.get('opt_type') ? params.getAll('opt_type') : '',
            params.get('orderBy') ? params.getAll('orderBy') : '',
            params.get('orderType') ? params.getAll('orderType') : ''
        ));
    }

    const getConsentsForCurrentUser = async () => {
        const { data } = await axios.get(`/api/hcp-profiles/${currentUser.hcp_profile.id}/consents`);
        setCurrentUser({ ...currentUser, consents: data.data });
    }

    const onManageProfile = (user) => {
        setCurrentAction({ userId: user.hcp_profile.id, action: 'Manage Profile' });
        setShow({ ...show, profileManage: true });
        setCurrentUser(user);
    }

    const getCountryName = (country_iso2) => {
        if (!allCountries || !country_iso2) return null;
        const country = allCountries.find(c => c.country_iso2.toLowerCase() === country_iso2.toLowerCase());
        return country && country.countryname;
    }

    function makeUrl(url_parameters) {
        let url = '';
        if (!Array.isArray(url_parameters)) return url;


        url_parameters.forEach(item => {
            if (item.value) {
                if (url.length) url += '&';
                if (url.length === 0) url += '?'
                url += `${item.name}=${item.value}`;
            }
        });
        return url;
    }

    function getorderType(orderBy) {
        return consents_report.orderBy !== orderBy ? 'ASC' : (consents_report.orderBy === orderBy && consents_report.orderType === 'DESC') ? 'ASC' : 'DESC';
    }

    function getUrl(orderBy) {
        return `/consent/consent-performance-report/cdp${makeUrl([
            { name: 'page', value: consents_report.page - 1 },
            { name: 'codbase', value: consents_report.codbase },
            { name: 'opt_type', value: consents_report.opt_type },
            { name: 'orderBy', value: orderBy },
            { name: 'orderType', value: getorderType(orderBy) }
        ])}`
    }

    function titleCase(str) {
        let splitStr = str.toLowerCase().split('-');
        for (let i = 0; i < splitStr.length; i++) {
            splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
        }

        return splitStr.join(' ');
    }

    function exportExcelFile() {
        axios.get('/api/export-cdp-consent-performance-report', { responseType: 'blob'}).then(res => {
            fileDownload(res.data, 'cdp-consent-report.xlsx');
        });
    }

    useEffect(() => {
        dispatch(getAllCountries());
        loadConsentsReport();
    }, []);

    useEffect(() => {
        modify_consents_report(consents_init_report);
    }, [consents_init_report]);

    return (
        <main className="app__content cdp-light-bg">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0">
                        <nav className="breadcrumb justify-content-between align-items-center" aria-label="breadcrumb">
                            <ol className="rounded-0 m-0 p-0 d-none d-sm-flex">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item"><NavLink to="/consent">Data Privacy & Consent Management</NavLink></li>
                                <li className="breadcrumb-item active"><span>Consent Performance Report</span></li>
                            </ol>
                            <Dropdown className="dropdown-customize breadcrumb__dropdown d-block d-sm-none ml-2">
                                <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle btn d-flex align-items-center border-0">
                                    <i className="fas fa-arrow-left mr-2"></i> Back
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item className="px-2" href="/"><i className="fas fa-link mr-2"></i> Dashboard</Dropdown.Item>
                                    <Dropdown.Item className="px-2" href="/consent"><i className="fas fa-link mr-2"></i> Data Privacy & Consent Management</Dropdown.Item>
                                    <Dropdown.Item className="px-2" active><i className="fas fa-link mr-2"></i> Consent Performance Report</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                            <span className="ml-auto mr-3"><i type="button" onClick={handleShowFaq} className="icon icon-help breadcrumb__faq-icon cdp-text-secondary"></i></span>
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
                        <div>
                            <div className="d-sm-flex justify-content-between align-items-end mb-0 mt-4">
                                <div>
                                    <h4 className="cdp-text-primary font-weight-bold mb-4">Consent Performance Report</h4>
                                    <div>
                                        <NavLink className="custom-tab px-3 py-3 cdp-border-primary" to="/consent/consent-performance-report/cdp">Customer Data Platform</NavLink>
                                        <NavLink className="custom-tab px-4 py-3 cdp-border-primary" to="/consent/consent-performance-report/veeva-crm"><img alt="Veeva CRM LOGO" src="/assets/logo/logo-veevacrm.svg" height="13" /></NavLink>
                                    </div>
                                </div>
                                <div className="d-flex pt-3 pt-sm-0 mb-2">
                                    <React.Fragment>
                                        <button onClick={() => exportExcelFile()}>Export Full Report</button>

                                        {countries && consents_report['countries'] &&
                                            <Dropdown className="ml-auto dropdown-customize mr-2">
                                                <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle fixed-width btn d-flex align-items-center">
                                                    <i className="icon icon-filter mr-2 mb-n1"></i> {consents_report.codbase && (countries.find(i => i.codbase === consents_report.codbase)) ? (countries.find(i => i.codbase === consents_report.codbase)).codbase_desc : 'Filter by Country'}
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu>
                                                    <LinkContainer to={`/consent/consent-performance-report/cdp${makeUrl([
                                                        { name: 'opt_type', value: consents_report.opt_type },
                                                        { name: 'orderBy', value: consents_report.orderBy },
                                                        { name: 'orderType', value: consents_report.orderType }
                                                    ])}`}>
                                                        <Dropdown.Item className={consents_report.codbase === '' ? 'd-none' : ''} onClick={() => dispatch(getConsentReport('', '', consents_report.opt_type, consents_report.orderBy, consents_report.orderType))}>All</Dropdown.Item>
                                                    </LinkContainer>
                                                    {
                                                        countries.map((item, index) => (
                                                            consents_report.countries.includes(item.country_iso2) && <LinkContainer key={index} to={`/consent/consent-performance-report/cdp${makeUrl([
                                                                { name: 'codbase', value: item.codbase },
                                                                { name: 'opt_type', value: consents_report.opt_type },
                                                                { name: 'orderBy', value: consents_report.orderBy },
                                                                { name: 'orderType', value: consents_report.orderType }
                                                            ])}`}>
                                                                <Dropdown.Item className={consents_report.countries.includes(item.country_iso2) && consents_report.codbase === item.codbase ? 'd-none' : ''} onClick={() => dispatch(getConsentReport('', item.codbase, consents_report.opt_type, consents_report.orderBy, consents_report.orderType))}>
                                                                    {

                                                                        consents_report.countries.includes(item.country_iso2) ? item.codbase_desc : null
                                                                    }
                                                                </Dropdown.Item>
                                                            </LinkContainer>
                                                        ))
                                                    }
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        }

                                        <Dropdown className="ml-auto dropdown-customize">
                                            <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle fixed-width btn d-flex align-items-center">
                                                <i className="icon icon-filter mr-2 mb-n1"></i> {consents_report.opt_type && (allOptTypes.includes(consents_report.opt_type)) ? consents_report.opt_type : 'Filter by Opt Type'}
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <LinkContainer to={`/consent/consent-performance-report/cdp${makeUrl([{ name: 'codbase', value: consents_report.codbase }, { name: 'orderBy', value: consents_report.orderBy }, { name: 'orderType', value: consents_report.orderType }])}`}>
                                                    <Dropdown.Item className={consents_report.opt_type === '' ? 'd-none' : ''} onClick={() => dispatch(getConsentReport('', consents_report.codbase, ''))}>All</Dropdown.Item>
                                                </LinkContainer>
                                                {
                                                    allOptTypes.map((item, index) => (
                                                        <LinkContainer key={index} to={`/consent/consent-performance-report/cdp${makeUrl([{ name: 'codbase', value: consents_report.codbase }, { name: 'opt_type', value: item }, { name: 'orderBy', value: consents_report.orderBy }, { name: 'orderType', value: consents_report.orderType }])}`}>
                                                            <Dropdown.Item className={consents_report.opt_type === item ? 'd-none' : ''} onClick={() => dispatch(getConsentReport('', consents_report.codbase, item, consents_report.orderBy, consents_report.orderType))}>
                                                                {
                                                                    item === consents_report.opt_type ? null : titleCase(item)
                                                                }
                                                            </Dropdown.Item>
                                                        </LinkContainer>
                                                    ))
                                                }
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </React.Fragment>
                                </div>
                            </div>


                            <Modal
                                size="lg"
                                show={show.profileManage}
                                onShow={getConsentsForCurrentUser}
                                onHide={() => { setCurrentAction({ action: null, userId: null }); setShow({ ...show, profileManage: false }) }}
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
                                    {currentUser.hcp_profile &&
                                        <div className="px-4 py-3">
                                            <div className="row">
                                                <div className="col">
                                                    <h4 className="mt-1 font-weight-bold">{`${currentUser.hcp_profile.first_name || ''} ${currentUser.hcp_profile.last_name || ''}`}</h4>
                                                    <div className="">{currentUser.hcp_profile.specialty_description}</div>
                                                </div>
                                            </div>
                                            <div className="row mt-3">
                                                <div className="col-6">
                                                    <div className="mt-1 font-weight-bold">UUID</div>
                                                    <div className="">{currentUser.hcp_profile.uuid || '--'}</div>
                                                </div>
                                                <div className="col-6">
                                                    <div className="mt-1 font-weight-bold">OneKeyID</div>
                                                    <div className="">{currentUser.hcp_profile.individual_id_onekey || '--'}</div>
                                                </div>
                                            </div>
                                            <div className="row mt-3">
                                                <div className="col-6">
                                                    <div className="mt-1 font-weight-bold">Email</div>
                                                    <div className="">{currentUser.hcp_profile.email || '--'}</div>
                                                </div>
                                                <div className="col-6">
                                                    <div className="mt-1 font-weight-bold">Phone Number</div>
                                                    <div className="">{currentUser.hcp_profile.telephone || '--'}</div>
                                                </div>
                                            </div>
                                            <div className="row mt-3">
                                                <div className="col-6">
                                                    <div className="mt-1 font-weight-bold">Country</div>
                                                    <div className="">{getCountryName(currentUser.hcp_profile.country_iso2) || '--'}</div>
                                                </div>
                                                <div className="col-6">
                                                    <div className="mt-1 font-weight-bold">Date of Registration</div>
                                                    <div className="">{currentUser.hcp_profile.created_at ? (new Date(currentUser.hcp_profile.created_at)).toLocaleDateString('en-GB').replace(/\//g, '.') : '--'}</div>
                                                </div>
                                            </div>
                                            <div className="row mt-3">
                                                <div className="col-6">
                                                    <div className="mt-1 font-weight-bold">Status</div>
                                                    <div className="text-capitalize">{currentUser.hcp_profile.status ? _.startCase(_.toLower(currentUser.hcp_profile.status.replace(/_/g, ' '))) : '--'}</div>
                                                </div>
                                            </div>
                                            <div className="row mt-4">
                                                <div className="col accordion-consent rounded shadow-sm p-0">
                                                    <h4 className="accordion-consent__header p-3 font-weight-bold mb-0 cdp-light-bg">Consents</h4>
                                                    {currentUser.consents && currentUser.consents.length ? <Accordion>{currentUser.consents.map(consent =>
                                                        <Card key={consent.id}>
                                                            <Accordion.Collapse eventKey={consent.id}>
                                                                <Card.Body>
                                                                    <div>{parse(consent.rich_text)}</div>
                                                                    <div className="pt-2"><span className="pr-1 text-dark"><i className="icon icon-check-square mr-1 small"></i>Opt Type:</span> <span className="text-capitalize">{consent.opt_type}</span></div>
                                                                    {consent.consent_given && <div><span className="pr-1 text-dark"><i className="icon icon-calendar-check mr-1 small"></i>Consent given date:</span>{(new Date(consent.consent_given_time)).toLocaleDateString('en-GB').replace(/\//g, '.')}</div>}
                                                                </Card.Body>
                                                            </Accordion.Collapse>
                                                            <Accordion.Toggle as={Card.Header} eventKey={consent.id} className="p-3 d-flex align-items-baseline justify-content-between border-0" role="button">
                                                                <span className="d-flex align-items-center"><i class={`icon ${consent.consent_given ? 'icon-check-filled' : 'icon-close-circle text-danger'} cdp-text-primary mr-4 consent-check`}></i> <span className="consent-summary">{consent.preference}</span></span>
                                                                <i className="icon icon-arrow-down ml-2 accordion-consent__icon-down"></i>
                                                            </Accordion.Toggle>
                                                        </Card>
                                                    )}</Accordion> : <div className="m-3 alert alert-warning">The HCP has not given any consent.</div>}
                                                </div>
                                            </div>
                                        </div>
                                    }
                                </Modal.Body>
                            </Modal>

                            {consents_report['hcp_consents'] && consents_report['hcp_consents'].length > 0 &&
                                <React.Fragment>
                                    <div className="shadow-sm bg-white table-responsive">
                                        <table className="table table-hover table-sm mb-0 cdp-table cdp-table-sm">
                                            <thead className="cdp-bg-primary text-white cdp-table__header">
                                                <tr>
                                                    <th>
                                                        <LinkContainer to={getUrl('first_name')}>
                                                            <span
                                                                className={consents_report.orderBy === 'first_name' ? `cdp-table__col-sorting sorted ${consents_report.orderType.toLowerCase()}` : `cdp-table__col-sorting`}
                                                                onClick={() => dispatch(getConsentReport(consents_report.page, consents_report.codbase, consents_report.opt_type, 'first_name', getorderType('first_name')))}
                                                            >
                                                                First Name
                                                            <i className="icon icon-sort cdp-table__icon-sorting"></i></span>
                                                        </LinkContainer>
                                                    </th>

                                                    <th>
                                                        <LinkContainer to={getUrl('last_name')}>
                                                            <span
                                                                className={consents_report.orderBy === 'last_name' ? `cdp-table__col-sorting sorted ${consents_report.orderType.toLowerCase()}` : `cdp-table__col-sorting`}
                                                                onClick={() => dispatch(getConsentReport(consents_report.page, consents_report.codbase, consents_report.opt_type, 'last_name', getorderType('last_name')))}
                                                            >
                                                                Last Name
                                                            <i className="icon icon-sort cdp-table__icon-sorting"></i></span>
                                                        </LinkContainer>
                                                    </th>

                                                    <th>
                                                        <LinkContainer to={getUrl('email')}>
                                                            <span
                                                                className={consents_report.orderBy === 'email' ? `cdp-table__col-sorting sorted ${consents_report.orderType.toLowerCase()}` : `cdp-table__col-sorting`}
                                                                onClick={() => dispatch(getConsentReport(consents_report.page, consents_report.codbase, consents_report.opt_type, 'email', getorderType('email')))}
                                                            >
                                                                Email
                                                            <i className="icon icon-sort cdp-table__icon-sorting"></i></span>
                                                        </LinkContainer>
                                                    </th>

                                                    <th>
                                                        <LinkContainer to={getUrl('consent_type')}>
                                                            <span
                                                                className={consents_report.orderBy === 'consent_type' ? `cdp-table__col-sorting sorted ${consents_report.orderType.toLowerCase()}` : `cdp-table__col-sorting`}
                                                                onClick={() => dispatch(getConsentReport(consents_report.page, consents_report.codbase, consents_report.opt_type, 'consent_type', getorderType('consent_type')))}
                                                            >
                                                                Consent Type
                                                            <i className="icon icon-sort cdp-table__icon-sorting"></i></span>
                                                        </LinkContainer>
                                                    </th>

                                                    <th>
                                                        <LinkContainer to={getUrl('preferences')}>
                                                            <span
                                                                className={consents_report.orderBy === 'preferences' ? `cdp-table__col-sorting sorted ${consents_report.orderType.toLowerCase()}` : `cdp-table__col-sorting`}
                                                                onClick={() => dispatch(getConsentReport(consents_report.page, consents_report.codbase, consents_report.opt_type, 'preferences', getorderType('preferences')))}
                                                            >
                                                                Preferences
                                                            <i className="icon icon-sort cdp-table__icon-sorting"></i></span>
                                                        </LinkContainer>
                                                    </th>

                                                    <th>
                                                        <LinkContainer to={getUrl('opt_type')}>
                                                            <span
                                                                className={consents_report.orderBy === 'opt_type' ? `cdp-table__col-sorting sorted ${consents_report.orderType.toLowerCase()}` : `cdp-table__col-sorting`}
                                                                onClick={() => dispatch(getConsentReport(consents_report.page, consents_report.codbase, consents_report.opt_type, 'opt_type', getorderType('opt_type')))}
                                                            >
                                                                Opt Type
                                                            <i className="icon icon-sort cdp-table__icon-sorting"></i></span>
                                                        </LinkContainer>
                                                    </th>

                                                    <th>
                                                        <LinkContainer to={getUrl('legal_basis')}>
                                                            <span
                                                                className={consents_report.orderBy === 'legal_basis' ? `cdp-table__col-sorting sorted ${consents_report.orderType.toLowerCase()}` : `cdp-table__col-sorting`}
                                                                onClick={() => dispatch(getConsentReport(consents_report.page, consents_report.codbase, consents_report.opt_type, 'legal_basis', getorderType('legal_basis')))}
                                                            >
                                                                Legal Basis
                                                            <i className="icon icon-sort cdp-table__icon-sorting"></i></span>
                                                        </LinkContainer>
                                                    </th>
                                                    <th>
                                                        <LinkContainer to={getUrl('date')}>
                                                            <span
                                                                className={consents_report.orderBy === 'date' ? `cdp-table__col-sorting sorted ${consents_report.orderType.toLowerCase()}` : `cdp-table__col-sorting`}
                                                                onClick={() => dispatch(getConsentReport(consents_report.page, consents_report.codbase, consents_report.opt_type, 'date', getorderType('date')))}
                                                            >
                                                                Date
                                                            <i className="icon icon-sort cdp-table__icon-sorting"></i></span>
                                                        </LinkContainer>
                                                    </th>

                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="cdp-table__body bg-white">
                                                {consents_report['hcp_consents'].map((row, index) => (
                                                    <tr key={index}>
                                                        <td>{row.hcp_profile.first_name}</td>
                                                        <td>{row.hcp_profile.last_name}</td>
                                                        <td>
                                                            <i className={`fas mr-2 ` + (row.hcp_profile.is_email_verified ? `fa-check-circle cdp-text-primary` : `fa-circle cdp-text-secondary`)}></i>
                                                            {row.hcp_profile.email}</td>
                                                        <td>{row.category}</td>
                                                        <td>{row.preference}</td>
                                                        <td>{titleCase(row.opt_type)}</td>
                                                        <td>{titleCase(row.legal_basis)}</td>
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

                                                {
                                                    consents_report.page <= 1 ? (<span className="pagination-btn" data-testid='Prev' disabled={consents_report.page <= 1}><i className="icon icon-arrow-down ml-2 prev"></i></span>) : <LinkContainer
                                                        to={`/consent/consent-performance-report/cdp${makeUrl([
                                                            { name: 'page', value: consents_report.page - 1 },
                                                            { name: 'codbase', value: consents_report.codbase },
                                                            { name: 'opt_type', value: consents_report.opt_type },
                                                            { name: 'orderBy', value: consents_report.orderBy },
                                                            { name: 'orderType', value: consents_report.orderType }
                                                        ])}`}
                                                    >
                                                        <span className="pagination-btn" data-testid='Prev' onClick={() => pageLeft()}><i className="icon icon-arrow-down ml-2 prev"></i></span>
                                                    </LinkContainer>
                                                }

                                                {
                                                    consents_report.end === consents_report.total ? (<span className="pagination-btn" data-testid='Next' disabled={consents_report.end === consents_report.total}><i className="icon icon-arrow-down ml-2 next"></i></span>) : <LinkContainer
                                                        to={`/consent/consent-performance-report/cdp${makeUrl([
                                                            { name: 'page', value: consents_report.page + 1 },
                                                            { name: 'codbase', value: consents_report.codbase },
                                                            { name: 'opt_type', value: consents_report.opt_type },
                                                            { name: 'orderBy', value: consents_report.orderBy },
                                                            { name: 'orderType', value: consents_report.orderType }
                                                        ])}`}
                                                    >
                                                        <span className="pagination-btn" data-testid='Next' onClick={() => pageRight()}><i className="icon icon-arrow-down ml-2 next"></i></span>
                                                    </LinkContainer>
                                                }
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


export default CdpConsentPerformanceReport;

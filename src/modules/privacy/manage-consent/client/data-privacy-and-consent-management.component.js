import React from 'react';
import { NavLink } from 'react-router-dom';
import { Faq } from '../../../platform';
import Dropdown from 'react-bootstrap/Dropdown';

const ConsentManagement = () => {
    return (
        <main className="app__content cdp-light-bg h-100">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0">
                        <nav className="breadcrumb justify-content-between align-items-center" aria-label="breadcrumb">
                            <ol className="rounded-0 m-0 p-0 d-none d-sm-flex">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item active"><span>Data Privacy & Consent Management</span></li>
                            </ol>
                            <Dropdown className="dropdown-customize breadcrumb__dropdown d-block d-sm-none ml-2">
                                <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle btn d-flex align-items-center border-0">
                                    <i className="fas fa-arrow-left mr-2"></i> Back
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item className="px-2" href="/"><i className="fas fa-link mr-2"></i> Dashboard</Dropdown.Item>
                                    <Dropdown.Item className="px-2" active><i className="fas fa-link mr-2"></i> Data Privacy & Consent Management</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </nav>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12 col-lg-8 col-xl-9 py-3">
                        <h2 className="d-flex align-items-center mb-3 px-3 page-title">
                            <i className="icon icon-data-consent-management icon-2x d-block page-title__icon"></i>
                            <span className="page-title__text font-weight-bold pl-3">Data Privacy & Consent Management</span>
                        </h2>
                        <div className="shadow-sm bg-white">
                            <div className="row">
                                <div className="col-12">
                                    <div className="list-group cdp-list-group">
                                        <NavLink to="/consent/list" className="p-3 border-bottom pb-0 mb-0 w-100 d-flex align-items-center cdp-list-group__link">
                                            <i className="icon icon-manage-profile icon-3x icon-3x cdp-list-group__icon"></i>
                                            <span>
                                                <strong className="mb-2 h4 d-block cdp-list-group__link-title">Manage New Consent</strong>
                                                <span className="d-block cdp-list-group__link-description">Create new consent name with define preferences (purpose) and manage translation.</span>
                                                <span className="d-block cdp-list-group__link-activity">within 5 - 10 minutes</span>
                                            </span>
                                        </NavLink>
                                        <NavLink to="/consent/consent-categories" className="p-3 border-bottom pb-0 mb-0 w-100 d-flex align-items-center cdp-list-group__link">
                                            <i className="icon icon-accept icon-3x cdp-list-group__icon"></i>
                                            <span>
                                                <strong className="mb-2 h4 d-block cdp-list-group__link-title">Configure Consent Category</strong>
                                                <span className="d-block cdp-list-group__link-description">Manage consent categories such as medical (scientific) or marketing (sales) consents.</span>
                                                <span className="d-block cdp-list-group__link-activity">within 5 - 10 minutes</span>
                                            </span>
                                        </NavLink>
                                        <NavLink to="/consent/manage-consents-per-country" className="p-3 border-bottom pb-0 mb-0 w-100 d-flex align-items-center cdp-list-group__link">
                                            <i className="icon icon-global icon-3x cdp-list-group__icon"></i>
                                            <span>
                                                <strong className="mb-2 h4 d-block cdp-list-group__link-title">Assign Consent to Country</strong>
                                                <span className="d-block cdp-list-group__link-description">Assign country specific consents to relevent country within local language.</span>
                                                <span className="d-block cdp-list-group__link-activity">within 15 minutes</span>
                                            </span>
                                        </NavLink>
                                        <NavLink to="#" className="p-3 border-bottom pb-0 mb-0 w-100 d-flex align-items-center cdp-list-group__link disabled">
                                            <i className="fas fa-fingerprint fa-3x cdp-list-group__icon"></i>
                                            <span>
                                                <strong className="mb-2 h4 d-block cdp-list-group__link-title">Classify Country Specific Consent with Legal Basis and Consent Type</strong>
                                                <span className="d-block cdp-list-group__link-description">Assign Consent for each country to preferences (purpose) and based on local GDPR the relevant legal obligations (wet ink - paper versus electronic signature (DocuSign), versus double-opt-in via deeplink)</span>
                                                <span className="d-block cdp-list-group__link-activity">within 2 - 5 minutes</span>
                                            </span>
                                        </NavLink>
                                        <NavLink to="/consent/consent-import-jobs" className="p-3 border-bottom pb-0 mb-0 w-100 d-flex align-items-center cdp-list-group__link">
                                            <i className="fas fa-file-upload fa-3x cdp-list-group__icon"></i>
                                            <span>
                                                <strong className="mb-2 h4 d-block cdp-list-group__link-title">Mange Consent Import Job</strong>
                                                <span className="d-block cdp-list-group__link-description">Create, start, cancel new job to import consents into VeevaCRM.</span>
                                                <span className="d-block cdp-list-group__link-activity">within 15 minutes</span>
                                            </span>
                                        </NavLink>
                                        <NavLink to="#" className="p-3 border-bottom pb-0 mb-0 w-100 d-flex align-items-center cdp-list-group__link disabled">
                                            <i className="icon icon-history icon-3x cdp-list-group__icon"></i>
                                            <span>
                                                <strong className="mb-2 h4 d-block cdp-list-group__link-title">Manage Audit Log of User Consents</strong>
                                                <span className="d-block cdp-list-group__link-description">Here you can monitor and track Consent Reports grouped by IFT-Team or individual or country.</span>
                                                <span className="d-block cdp-list-group__link-activity">within 5 - 10 minutes</span>
                                            </span>
                                        </NavLink>
                                        <NavLink to="#" className="p-3 border-bottom pb-0 mb-0 w-100 d-flex align-items-center cdp-list-group__link disabled">
                                            <i className="icon icon-letter-in icon-3x cdp-list-group__icon"></i>
                                            <span>
                                                <strong className="mb-2 h4 d-block cdp-list-group__link-title">Manage Data Privacy HCP User Requests send via email is set to dpo@glpg.com</strong>
                                                <span className="d-block cdp-list-group__link-description">Service to manage ad-hoc user specific data privacy requests of Opt-Out, Rights to be forgotten, etc. as well as configure the company central inbound data privacy distribution recipient</span>
                                                <span className="d-block cdp-list-group__link-activity">within 5 - 10 minutes</span>
                                            </span>
                                        </NavLink>
                                        <NavLink to="#" className="p-3 border-bottom pb-0 mb-0 w-100 d-flex align-items-center cdp-list-group__link disabled">
                                            <i className="icon icon-clock icon-3x cdp-list-group__icon"></i>
                                            <span>
                                                <strong className="mb-2 h4 d-block cdp-list-group__link-title">HCP Requests to Opt-Out and ad-hoc requests for historical data</strong>
                                                <span className="d-block cdp-list-group__link-description">Service to manage user specific Opt-Outs,In Short-term: provide data report to users,Manage in medium-term deactivation request from Users,Within long-term provide User specific historic data reports about the individual Manage all this.</span>
                                                <span className="d-block cdp-list-group__link-activity">within 5 - 10 minutes</span>
                                            </span>
                                        </NavLink>
                                        <NavLink to="#" className="p-3 border-bottom pb-0 mb-0 w-100 d-flex align-items-center cdp-list-group__link disabled">
                                            <i className="icon icon-balance icon-3x cdp-list-group__icon"></i>
                                            <span>
                                                <strong className="mb-2 h4 d-block cdp-list-group__link-title">Track Based on GDPR aricle 15,16,17, and 18 and 20</strong>
                                                <span className="d-block cdp-list-group__link-description">Status & monitoring to ensure user specific data deletion in Market Access,SAP into Suppiz Chain Management ,CDP into customer Data Platform.</span>
                                                <span className="d-block cdp-list-group__link-activity">within 5 - 10 minutes</span>
                                            </span>
                                        </NavLink>
                                        <NavLink to="/consent/consent-performance-report/cdp" className="p-3 border-bottom pb-0 mb-0 w-100 d-flex align-items-center cdp-list-group__link">
                                            <i className="icon icon-handshake icon-3x cdp-list-group__icon"></i>
                                            <span>
                                                <strong className="mb-2 h4 d-block cdp-list-group__link-title">Generate Data Privacy & Consent Performance Report </strong>
                                                <span className="d-block cdp-list-group__link-description">Manage User request to generate data privacy reports on individual level, Consent Performance Report of total amount of consents grouped by consent type and grouped by HCO -Health Care Organization where the HCP works.</span>
                                                <span className="d-block cdp-list-group__link-activity">within 5 - 10 minutes</span>
                                            </span>
                                        </NavLink>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-lg-4 col-xl-3 py-3 app__content-panel-right">
                        <Faq topic="data-privacy" />
                    </div>
                </div>
            </div>
        </main>
    );
}

export default ConsentManagement;

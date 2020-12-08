import React from 'react';
import { NavLink } from 'react-router-dom';
import { Faq } from '../../../platform';

const InformationManagement = () => {
    return (
        <main className="app__content cdp-light-bg h-100">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb rounded-0">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item active"><span>Information Management</span></li>
                            </ol>
                        </nav>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12 col-lg-8 col-xl-9 py-3">
                        <h2 className="d-flex align-items-center mb-3 px-3 page-title">
                            <i className="icon icon-information-management icon-2x d-block page-title__icon"></i>
                            <span className="page-title__text font-weight-bold pl-3">Information Management</span>
                        </h2>
                        <div className="shadow-sm bg-white">
                            <div className="row">
                                <div className="col-12">
                                    <div className="list-group cdp-list-group">
                                        <NavLink to="/hcps/list" className="p-3 border-bottom pb-0 mb-0 w-100 d-flex align-items-center cdp-list-group__link">
                                            <i className="icon icon-secure icon-3x icon-3x cdp-list-group__icon"></i>
                                            <span>
                                                <strong className="mb-2 h4 d-block cdp-list-group__link-title">Manage HCP Master Data</strong>
                                                <span className="d-block cdp-list-group__link-description">Checking IQVia individual datasets in relevant country</span>
                                                <span className="d-block cdp-list-group__link-activity">5 - 7 minutes</span>
                                            </span>
                                        </NavLink>
                                        <NavLink to="#" className="p-3 border-bottom pb-0 mb-0 w-100 d-flex align-items-center cdp-list-group__link disabled">
                                            <i className="icon icon-handshake icon-3x cdp-list-group__icon"></i>
                                            <span>
                                                <strong className="mb-2 h4 d-block cdp-list-group__link-title">Check the HCP Professional Engagements at HCOs</strong>
                                                <span className="d-block cdp-list-group__link-description">Assigned IQVia activities to HCPs using Role 1 and Start Activity</span>
                                                <span className="d-block cdp-list-group__link-activity">Select your Campaign list considering HCPs Job Function and starting date of activity within 5 - 10 minutes</span>
                                            </span>
                                        </NavLink>
                                        <NavLink to="#" className="p-3 border-bottom pb-0 mb-0 w-100 d-flex align-items-center cdp-list-group__link disabled">
                                            <i className="icon icon-network icon-3x cdp-list-group__icon"></i>
                                            <span>
                                                <strong className="mb-2 h4 d-block cdp-list-group__link-title">Understand IFT Team Engagements with HCPs</strong>
                                                <span className="d-block cdp-list-group__link-description">VeevaCRM interactions (Call Reports, Medical Inquiries, etc.)</span>
                                                <span className="d-block cdp-list-group__link-activity">Find insights for Omni-channel recommendations within 15 minutes per HCP</span>
                                            </span>
                                        </NavLink>
                                        <NavLink to="#" className="p-3 border-bottom pb-0 mb-0 w-100 d-flex align-items-center cdp-list-group__link disabled">
                                            <i className="icon icon-calendar icon-3x cdp-list-group__icon"></i>
                                            <span>
                                                <strong className="mb-2 h4 d-block cdp-list-group__link-title">Manage Address of a Health Care Organization</strong>
                                                <span className="d-block cdp-list-group__link-description">IQVia workplace and addresses including department, buildings</span>
                                                <span className="d-block cdp-list-group__link-activity">Do data cleaning for a HCO within 2 - 5 minutes</span>
                                            </span>
                                        </NavLink>
                                        <NavLink to="#" className="p-3 border-bottom pb-0 mb-0 w-100 d-flex align-items-center cdp-list-group__link disabled">
                                            <i className="icon icon-switch icon-3x cdp-list-group__icon"></i>
                                            <span>
                                                <strong className="mb-2 h4 d-block cdp-list-group__link-title">Understand HCP with 3rd Party master data (Market Access data, etc.) </strong>
                                                <span className="d-block cdp-list-group__link-description">Matching 3rd Party data to IQVia individual data</span>
                                                <span className="d-block cdp-list-group__link-activity">Drive Insights with enriched 3rd Party data within 10 - 15 minutes</span>
                                            </span>
                                        </NavLink>
                                        <NavLink to="#" className="p-3 border-bottom pb-0 mb-0 w-100 d-flex align-items-center cdp-list-group__link disabled">
                                            <i className="icon icon-search-globally icon-3x cdp-list-group__icon"></i>
                                            <span>
                                                <strong className="mb-2 h4 d-block cdp-list-group__link-title">Discover Missing HCPs and HCOs</strong>
                                                <span className="d-block cdp-list-group__link-description">IQVia OneKey Universe</span>
                                                <span className="d-block cdp-list-group__link-activity">Search & Find within 1 to 3 minutes to solve issue</span>
                                            </span>
                                        </NavLink>
                                        <NavLink to="#" className="p-3 border-bottom pb-0 mb-0 w-100 d-flex align-items-center cdp-list-group__link disabled">
                                            <i className="icon icon-place icon-3x cdp-list-group__icon"></i>
                                            <span>
                                                <strong className="mb-2 h4 d-block cdp-list-group__link-title">Find HCPs with their Geolocation</strong>
                                                <span className="d-block cdp-list-group__link-description">Using the address assigned to IQVia workplace</span>
                                                <span className="d-block cdp-list-group__link-activity">Make new Campaign lists via GPS areas in less than 20 min</span>
                                            </span>
                                        </NavLink>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-lg-4 col-xl-3 py-3 app__content-panel-right">
                        <Faq category="information" />
                    </div>
                </div>
            </div>
        </main>
    );
}

export default InformationManagement;

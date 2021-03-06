import React from 'react';
import { NavLink } from 'react-router-dom';
import Faq from '../../../platform/faq/client/faq.component';

const BusinessPartnerManagement = () => {
    return (
        <main className="app__content cdp-light-bg h-100">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb rounded-0">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item active"><span>Business Partner Management</span></li>
                            </ol>
                        </nav>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12 col-lg-8 col-xl-9 py-3">
                        <h2 className="d-flex align-items-center mb-4 px-3 page-title">
                            <i className="icon icon-partner icon-2x d-block page-title__icon mb-n3"></i>
                            <span className="page-title__text font-weight-bold pl-3">Business Partner Management</span>
                        </h2>
                        <div className="shadow-sm bg-white">
                            <div className="row">
                                <div className="col-12">
                                    <div className="list-group cdp-list-group">
                                        <NavLink to="#" className="p-3 border-bottom pb-0 mb-0 w-100 d-flex align-items-center cdp-list-group__link disabled">
                                            <i className="icon icon-supplier icon-3x icon-3x cdp-list-group__icon"></i>
                                            <span>
                                                <strong className="mb-2 h4 d-block cdp-list-group__link-title">Customer who also act as supplier</strong>
                                                <span className="d-block cdp-list-group__link-description">HCP and HCO suppliers</span>
                                                <span className="d-block cdp-list-group__link-activity">withing 5 - 10 minutes</span>
                                            </span>
                                        </NavLink>
                                        <NavLink to="#" className="p-3 border-bottom pb-0 mb-0 w-100 d-flex align-items-center cdp-list-group__link disabled">
                                            <i className="icon icon-information-management icon-3x icon-3x cdp-list-group__icon"></i>
                                            <span>
                                                <strong className="mb-2 h4 d-block cdp-list-group__link-title">Customer Management to submit to ERP System (x)</strong>
                                                <span className="d-block cdp-list-group__link-description">Review requests to create business partners in SAP</span>
                                                <span className="d-block cdp-list-group__link-activity">within 5 - 10 minutes</span>
                                            </span>
                                        </NavLink>
                                        <NavLink to="#" className="p-3 border-bottom pb-0 mb-0 w-100 d-flex align-items-center cdp-list-group__link disabled">
                                            <i className="icon icon-list-edit icon-3x icon-3x cdp-list-group__icon"></i>
                                            <span>
                                                <strong className="mb-2 h4 d-block cdp-list-group__link-title">Manage Output for Change, Update or Delete to export data</strong>
                                                <span className="d-block cdp-list-group__link-description">Business Partner Performance Reports Show performance report such as how many business partners grouped by suppliers or customers have been created within a specific time scale.</span>
                                                <span className="d-block cdp-list-group__link-activity">within 5 - 10 minutes</span>
                                            </span>
                                        </NavLink>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-lg-4 col-xl-3 py-3">
                        <Faq />
                    </div>
                </div>
            </div>
        </main>
    );
};

export default BusinessPartnerManagement;

import React from 'react';
import { NavLink } from 'react-router-dom';
import { Faq } from '../../../../platform';
import Dropdown from 'react-bootstrap/Dropdown';

const BusinessPartnerManagement = () => {
    return (
        <main className="app__content cdp-light-bg h-100">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0">
                        <nav className="breadcrumb justify-content-between align-items-center" aria-label="breadcrumb">
                            <ol className="rounded-0 m-0 p-0 d-none d-sm-flex">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item active"><span>Business Partner Management</span></li>
                            </ol>
                            <Dropdown className="dropdown-customize breadcrumb__dropdown d-block d-sm-none ml-2">
                                <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle btn d-flex align-items-center border-0">
                                    <i className="fas fa-arrow-left mr-2"></i> Back
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item className="px-2" href="/"><i className="fas fa-link mr-2"></i> Dashboard</Dropdown.Item>
                                    <Dropdown.Item className="px-2" active><i className="fas fa-link mr-2"></i> Business Partner Management</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
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
                                        <NavLink to="/business-partner/requests/vendors" className="p-3 border-bottom pb-0 mb-0 w-100 d-flex align-items-center cdp-list-group__link">
                                            <i className="icon icon-bpm icon-3x icon-3x cdp-list-group__icon"></i>
                                            <span>
                                                <strong className="mb-2 h4 d-block cdp-list-group__link-title">Manage Vendor Request</strong>
                                                <span className="d-block cdp-list-group__link-description">Manage Wholesalers and vendors with all initial required Master Data Information objects such as Company Code, Procurement contact person etc.</span>
                                                <span className="d-block cdp-list-group__link-activity">withing 5 - 10 minutes</span>
                                            </span>
                                        </NavLink>
                                        <NavLink to="/business-partner/requests/hcps" className="p-3 border-bottom pb-0 mb-0 w-100 d-flex align-items-center cdp-list-group__link">
                                            <i className="icon icon-manage-profile icon-3x icon-3x cdp-list-group__icon"></i>
                                            <span>
                                                <strong className="mb-2 h4 d-block cdp-list-group__link-title">Manage Healthcare Entity Request</strong>
                                                <span className="d-block cdp-list-group__link-description">Manage HCOs & HCPs with all initial required Master Data Information objects such as Company Code, Procurement contact person etc.</span>
                                                <span className="d-block cdp-list-group__link-activity">within 5 - 10 minutes</span>
                                            </span>
                                        </NavLink>
                                        {/*<NavLink to="#" className="p-3 border-bottom pb-0 mb-0 w-100 d-flex align-items-center cdp-list-group__link disabled">
                                            <i className="icon icon-supplier icon-3x icon-3x cdp-list-group__icon"></i>
                                            <span>
                                                <strong className="mb-2 h4 d-block cdp-list-group__link-title">Customer who also acts as Supplier</strong>
                                                <span className="d-block cdp-list-group__link-description">Create SAP Business Partner Request for customers who are either HCPs or HCOs.</span>
                                                <span className="d-block cdp-list-group__link-activity">within 5 - 10 minutes</span>
                                            </span>
                                        </NavLink>*/}
                                        <NavLink to="/business-partner/partner-management/hcps" className="p-3 border-bottom pb-0 mb-0 w-100 d-flex align-items-center cdp-list-group__link">
                                            <i className="icon icon-information-management icon-3x icon-3x cdp-list-group__icon"></i>
                                            <span>
                                                <strong className="mb-2 h4 d-block cdp-list-group__link-title">Business Partner Management to submit to ERP System (x)</strong>
                                                <span className="d-block cdp-list-group__link-description">Review request to create Business Partners in SAP.</span>
                                                <span className="d-block cdp-list-group__link-activity">within 5 - 10 minutes</span>
                                            </span>
                                        </NavLink>
                                        <NavLink to="#" className="p-3 border-bottom pb-0 mb-0 w-100 d-flex align-items-center cdp-list-group__link disabled">
                                            <i className="icon icon-list-edit icon-3x icon-3x cdp-list-group__icon"></i>
                                            <span>
                                                <strong className="mb-2 h4 d-block cdp-list-group__link-title">Manage Output for Change, Update or Delete to export data</strong>
                                                <span className="d-block cdp-list-group__link-description">Business Partern Performance Report Show performance reports such as how many business partners grouped by suppliers or customers have been created within a specific time scale.</span>
                                                <span className="d-block cdp-list-group__link-activity">within 5 - 10 minutes</span>
                                            </span>
                                        </NavLink>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-lg-4 col-xl-3 py-3 app__content-panel-right">
                        <Faq topic="business-partner-management" />
                    </div>
                </div>
            </div>
        </main>
    );
};

export default BusinessPartnerManagement;

import React from 'react';
import { NavLink } from 'react-router-dom';
import Dropdown from 'react-bootstrap/Dropdown';
import Faq from '../../../faq/client/faq.component';

const UserManagement = () => {
    return (
        <main className="app__content cdp-light-bg h-100">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0">
                        <nav className="breadcrumb justify-content-between align-items-center" aria-label="breadcrumb">
                            <ol className="rounded-0 m-0 p-0 d-none d-sm-flex">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item active"><span>Management of Customer Data platform</span></li>
                            </ol>
                            <Dropdown className="dropdown-customize breadcrumb__dropdown d-block d-sm-none ml-2">
                                <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle btn d-flex align-items-center border-0">
                                    <i className="fas fa-arrow-left mr-2"></i> Back
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item className="px-2" href="/"><i className="fas fa-link mr-2"></i> Dashboard</Dropdown.Item>
                                    <Dropdown.Item className="px-2" active><i className="fas fa-link mr-2"></i> Management of Customer Data platformt</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </nav>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12 col-lg-8 col-xl-9 py-3">
                        <h2 className="d-flex align-items-center mb-3 px-3 page-title">
                            <i className="icon icon-customer-data-platform icon-2x d-block page-title__icon"></i>
                            <span className="page-title__text font-weight-bold pl-3">Management of Customer Data Platform</span>
                        </h2>
                        <div className="shadow-sm bg-white">
                            <div className="row">
                                <div className="col-12">
                                    <div className="list-group cdp-list-group">
                                        <NavLink to="/platform/users" className="p-3 border-bottom pb-0 mb-0 w-100 d-flex align-items-center cdp-list-group__link">
                                            <i className="icon icon-user-setting icon-3x icon-3x cdp-list-group__icon"></i>
                                            <span>
                                                <strong className="mb-2 h4 d-block cdp-list-group__link-title">User & Access Management</strong>
                                                <span className="d-block cdp-list-group__link-description">Manage CDP users</span>
                                                <span className="d-block cdp-list-group__link-activity">5 minutes</span>
                                            </span>
                                        </NavLink>
                                        <NavLink to="platform/profiles" className="p-3 border-bottom pb-0 mb-0 w-100 d-flex align-items-center cdp-list-group__link">
                                            <i className="icon icon-user-heart icon-3x icon-3x cdp-list-group__icon"></i>
                                            <span>
                                                <strong className="mb-2 h4 d-block cdp-list-group__link-title">Manage Profiles</strong>
                                                <span className="d-block cdp-list-group__link-description">Manage user profiles</span>
                                                <span className="d-block cdp-list-group__link-activity">5 - 7 minutes</span>
                                            </span>
                                        </NavLink>
                                        <NavLink to="platform/roles" className="p-3 border-bottom pb-0 mb-0 w-100 d-flex align-items-center cdp-list-group__link">
                                            <i className="icon icon-key icon-3x icon-3x cdp-list-group__icon"></i>
                                            <span>
                                                <strong className="mb-2 h4 d-block cdp-list-group__link-title">Define Roles</strong>
                                                <span className="d-block cdp-list-group__link-description">Manage user roles</span>
                                                <span className="d-block cdp-list-group__link-activity">5 - 7 minutes</span>
                                            </span>
                                        </NavLink>
                                        <NavLink to="platform/permission-sets" className="p-3 border-bottom pb-0 mb-0 w-100 d-flex align-items-center cdp-list-group__link">
                                            <i className="icon icon-role icon-3x icon-3x cdp-list-group__icon"></i>
                                            <span>
                                                <strong className="mb-2 h4 d-block cdp-list-group__link-title">Manage Permission Sets</strong>
                                                <span className="d-block cdp-list-group__link-description">Assign rights to Permission Set</span>
                                                <span className="d-block cdp-list-group__link-activity">5 - 7 minutes</span>
                                            </span>
                                        </NavLink>
                                        <NavLink to="platform/manage-faq" className="p-3 border-bottom pb-0 mb-0 w-100 d-flex align-items-center cdp-list-group__link">
                                            <i className="icon icon-help icon-3x cdp-list-group__icon"></i>
                                            <span>
                                                <strong className="mb-2 h4 d-block cdp-list-group__link-title">Manage FAQs</strong>
                                                <span className="d-block cdp-list-group__link-description">Manage new or update existing user guides on how to use specific services in a service category within CDP</span>
                                                <span className="d-block cdp-list-group__link-activity">Within 5 - 7 minutes</span>
                                            </span>
                                        </NavLink>

                                        <NavLink to="#" className="p-3 border-bottom pb-0 mb-0 w-100 d-flex align-items-center cdp-list-group__link disabled">
                                            <i className="icon icon-laptop icon-3x cdp-list-group__icon"></i>
                                            <span>
                                                <strong className="mb-2 h4 d-block cdp-list-group__link-title">Manage Mailchimp API Credentials</strong>
                                            </span>
                                        </NavLink>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-lg-4 col-xl-3 py-3 app__content-panel-right">
                        <Faq topic="cdp-management" />
                    </div>
                </div>
            </div>
        </main>
    );
};

export default UserManagement;

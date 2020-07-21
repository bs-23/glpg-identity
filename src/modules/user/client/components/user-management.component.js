import React from 'react';
import { NavLink } from 'react-router-dom';
import Faq from '../../../shared/client/components/faq.component';

const UserManagement = () => {
    return (
        <main className="app__content cdp-light-bg">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb rounded-0">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item active">Customer Data Platform Management</li>
                            </ol>
                        </nav>
                    </div>
                </div>
                <div className="row h-100">
                    <div className="col-12 col-lg-8 col-xl-9 py-3">
                        <div className="h-100 shadow-sm bg-white">
                            <h2 className="d-flex align-items-center mb-3 px-3 cdp-text-primary"><i className="icon icon-user-management d-block service__icon"></i>User Management</h2>
                            <div className="row">
                                <div className="col-12">
                                    <div className="list-group cdp-list-group px-3">
                                        <NavLink to="users/list" className="p-3 border-bottom pb-0 mb-0 w-100 d-flex align-items-center cdp-list-group__link">
                                            <i className="icon icon-listing icon-3x cdp-list-group__icon"></i>
                                            <span>
                                                <strong className="mb-2 d-block cdp-list-group__link-title">CDP User List</strong>
                                                <span className="d-block cdp-list-group__link-description text-secondary">A list view of all the users</span>
                                                <span className="d-block cdp-list-group__link-timeing text-muted">10 minutes</span>
                                            </span>
                                        </NavLink>
                                        <NavLink to="users/create" className="p-3 border-bottom pb-0 mb-0 w-100 d-flex align-items-center cdp-list-group__link">
                                            <i className="icon icon-add-user icon-3x  cdp-list-group__icon"></i>
                                            <span>
                                                <strong className="mb-2 h4 d-block cdp-list-group__link-title">Add CDP User</strong>
                                                <span className="d-block cdp-list-group__link-description text-secondary">Add new user for CDP management</span>
                                                <span className="d-block cdp-list-group__link-timeing text-muted">5 minutes</span>
                                            </span>
                                        </NavLink>
                                        <NavLink to="users/roles" className="p-3 border-bottom pb-0 mb-0 w-100 d-flex align-items-center cdp-list-group__link">
                                            <i className="icon icon-board-games-with-roles icon-3x cdp-list-group__icon"></i>
                                            <span>
                                                <strong className="mb-2 h4 d-block cdp-list-group__link-title">Manage User Roles</strong>
                                                <span className="d-block cdp-list-group__link-description text-secondary">Manage user roles and permissions</span>
                                                <span className="d-block cdp-list-group__link-timeing text-muted">5 minutes</span>
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

export default UserManagement;

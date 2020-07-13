import React from 'react';
import { NavLink } from 'react-router-dom';

const UserManagement = () => {
    return (
        <main className="app__content">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb rounded-0">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item active">User Managment</li>
                            </ol>
                        </nav>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <div>
                            <div className="d-flex justify-content-between align-items-center">
                                <h2 className="mb-3">User Managment</h2>
                            </div>
                            <div className="row">
                                <div className="col-12 col-sm-6">
                                    <div className="list-group cdp-list-group">
                                        <NavLink to="users/list" className="p-3 border-bottom pb-0 mb-0 w-100 d-flex align-items-center cdp-list-group__link">
                                            <i className="fas fa-th-list mr-4 fa-3x cdp-list-group__icon"></i>
                                            <span>
                                                <strong className="mb-1 h4 d-block cdp-list-group__link-title">CDP User List</strong>
                                                <span className="mb-1 d-block cdp-list-group__link-description text-secondary">A list view of all GDS and LDS</span>
                                                <span className="mb-1 d-block cdp-list-group__link-timeing text-muted">10 -12 minutes</span>
                                            </span>
                                        </NavLink>
                                        <NavLink to="users/create" className="p-3 border-bottom pb-0 mb-0 w-100 d-flex align-items-center cdp-list-group__link">
                                            <i className="fas fa-plus mr-4 fa-3x cdp-list-group__icon"></i>
                                            <span>
                                                <strong className="mb-1 h4 d-block cdp-list-group__link-title">Add CDP User</strong>
                                                <span className="mb-1 d-block cdp-list-group__link-description text-secondary">Add GDS or LDS user for CDP management</span>
                                                <span className="mb-1 d-block cdp-list-group__link-timeing text-muted">5 -7 minutes</span>
                                            </span>
                                        </NavLink>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>


    
    );
}
 
export default UserManagement;

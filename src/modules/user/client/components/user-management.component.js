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
                                    <div className="list-group">
                                        <NavLink to="users/list" className="p-2 border shadow-sm h4 pb-0 mb-0">
                                            <div className="d-flex w-100 justify-content-between">
                                                <h5 className="mb-1">CDP User List</h5>
                                            </div>
                                        </NavLink>
                                        <NavLink to="users/create" className="p-2 border shadow-sm h4 pb-0 mb-0">
                                            <div className="d-flex w-100 justify-content-between">
                                                <h5 className="mb-1">Add CDP User</h5>
                                            </div>
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

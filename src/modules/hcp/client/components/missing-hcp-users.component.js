import React from 'react';
import { NavLink } from 'react-router-dom';

const InformationManagement = () => {
    return (
        <main className="app__content cdp-light-bg h-100">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb rounded-0">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item"><NavLink to="/hcps">Information Management</NavLink></li>
                                <li className="breadcrumb-item active"><span>Missing Users</span></li>
                            </ol>
                        </nav>
                    </div>
                </div>
                <div className="row">
                    Hello Brothers, ki khobor valo aso?
                </div>
            </div>
        </main>
    );
}

export default InformationManagement;

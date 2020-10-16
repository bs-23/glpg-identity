import React from "react";
import { NavLink } from 'react-router-dom';

const CreateCdpConsent = () => {

    return (
        <main className="app__content cdp-light-bg h-100">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb rounded-0">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item"><NavLink to="/consent/">Data Privacy & Consent Management</NavLink></li>
                                <li className="breadcrumb-item"><NavLink to="/consent/list">CDP Consents List</NavLink></li>
                                <li className="breadcrumb-item active"><span>Add new Consent</span></li>
                            </ol>
                        </nav>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <div className="shadow-sm bg-white mb-3">
                            <h2 className="d-flex align-items-center p-3 px-sm-4 py-sm-2 page-title light">
                                <span className="page-title__text font-weight-bold py-3">Create New Consent</span>
                            </h2>
                            <div className="add-user p-3"></div>
                        </div>
                    </div>
                </div>
            </div>
            
        </main>
    );
}

export default CreateCdpConsent;

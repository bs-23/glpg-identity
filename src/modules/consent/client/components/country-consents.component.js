import React from 'react';
import { NavLink } from 'react-router-dom';

const CountryConsents = () => {
    return (
        <main className="app__content cdp-light-bg h-100">
            <div className="container-fluid">
            <div className="row">
                    <div className="col-12 px-0">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb rounded-0">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item"><NavLink to="/consent">Data Privacy & Consent Management</NavLink></li>
                                <li className="breadcrumb-item active"><span>Country Consents</span></li>
                            </ol>
                        </nav>
                    </div>
                </div>
                <h1>Country Consents</h1>
            </div>
        </main>
    );
}

export default CountryConsents;

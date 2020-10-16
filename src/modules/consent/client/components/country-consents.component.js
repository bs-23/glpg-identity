import React from 'react';
import { NavLink } from 'react-router-dom';
import Dropdown from 'react-bootstrap/Dropdown';
import Modal from 'react-bootstrap/Modal';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';

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
                                <li className="breadcrumb-item active"><span>Country Consents List</span></li>
                            </ol>
                        </nav>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <div className="d-sm-flex justify-content-between align-items-center mb-3 mt-4">
                            <h4 className="cdp-text-primary font-weight-bold mb-3 mb-sm-0">Country Consents</h4>
                            <div class="d-flex justify-content-between align-items-center">
                                <NavLink to="/consent/country/create" className="btn cdp-btn-secondary text-white ml-2">
                                    <i className="icon icon-plus pr-1"></i> Create country consent
                                </NavLink>
                            </div>
                        </div>

                        <div className="table-responsive shadow-sm bg-white mb-3">
                            <table className="table table-hover table-sm mb-0 cdp-table mb-2">
                                <thead className="bg-light cdp-table__header">
                                    <tr>
                                        <th colSpan="4"><div className="d-flex align-items-center"><img alt="CDP LOGO" src="/assets/flag/flag-netherlands.svg" height="18" className="mr-2" /> Netherlands</div></th>
                                    </tr>
                                </thead>
                                <thead className="cdp-table__header">
                                    <tr>
                                        <th>Consent Title</th>
                                        <th>Available Translation</th>
                                        <th>Opt Type</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody className="cdp-table__body bg-white">
                                    <tr>
                                        <td>I give my consent to send me promotional email</td>
                                        <td>NL_NL, BE_NL</td>
                                        <td>Single Opt-In</td>
                                        <td>
                                            <a href="#" className="btn btn-link">Edit</a> | <a href="#" className="btn btn-link text-danger">Delete</a>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            
                        </div>

                        <div className="table-responsive shadow-sm bg-white mb-3">
                            <table className="table table-hover table-sm mb-0 cdp-table mb-2">
                                <thead className="bg-light cdp-table__header">
                                    <tr>
                                        <th colSpan="4"><div className="d-flex align-items-center"><img alt="CDP LOGO" src="/assets/flag/flag-belgium.svg" className="mr-2" height="18" /> Belgium</div></th>
                                    </tr>
                                </thead>
                                <thead className="cdp-table__header">
                                    <tr>
                                        <th>Consent Title</th>
                                        <th>Available Translation</th>
                                        <th>Opt Type</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody className="cdp-table__body bg-white">
                                    <tr>
                                        <td>I give my consent to send me promotional email</td>
                                        <td>NL_NL, BE_NL</td>
                                        <td>Single Opt-In</td>
                                        <td>
                                            <a href="#" className="btn btn-link">Edit</a> | <a href="#" className="btn btn-link text-danger">Delete</a>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                        </div>
                    </div>
                </div>
            </div>

        </main>
    );
}

export default CountryConsents;

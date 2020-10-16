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
                                <li className="breadcrumb-item active"><span>Country Consents</span></li>
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

                        <div className="table-responsive shadow-sm bg-white">
                            <table className="table table-hover table-sm mb-0 cdp-table">
                                <thead className="cdp-bg-primary text-white cdp-table__header">
                                    <tr>
                                        <th>Country</th>
                                        <th>Consent Title</th>
                                        <th>Available Translation</th>
                                        <th>Opt Type</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody className="cdp-table__body bg-white">
                                    <tr>
                                        <td>Netherlands</td>
                                        <td>I give my consent to send me promotional email</td>
                                        <td>NL_NL, BE_NL</td>
                                        <td>Single Opt-In</td>
                                        <td>Active</td>
                                        <td><Dropdown className="ml-auto dropdown-customize">
                                            <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle btn-sm py-0 px-1 dropdown-toggle ">
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item>Edit country consents</Dropdown.Item>
                                                <Dropdown.Item>Consent Detail</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown></td>
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

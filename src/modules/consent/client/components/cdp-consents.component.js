import React, { useEffect, useState } from "react";
import { NavLink } from 'react-router-dom';
import { getCdpConsents } from '../consent.action';
import { useSelector, useDispatch } from 'react-redux';
import Dropdown from 'react-bootstrap/Dropdown';

const CdpConsents = () => {
    const dispatch = useDispatch();
    const cdp_consents = useSelector(state => state.consentReducer.cdp_consents);

    async function loadCdpConsents() {
        const params = new URLSearchParams(window.location.search);
        dispatch(getCdpConsents(
            params.get('translations') ? params.get('translations') : '',
            params.get('category') ? params.get('category') : ''
        ));
    }

    useEffect(() => {
        loadCdpConsents();
    }, []);

    return (
        <main className="app__content cdp-light-bg h-100">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb rounded-0">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item"><NavLink to="/consent">Data Privacy & Consent Management</NavLink></li>
                                <li className="breadcrumb-item active"><span>CDP Consents</span></li>
                            </ol>
                        </nav>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <div className="d-sm-flex justify-content-between align-items-center mb-3 mt-4">
                            <h4 className="cdp-text-primary font-weight-bold mb-3 mb-sm-0">CDP Consents</h4>
                            <div class="d-flex justify-content-between align-items-center">
                                <a class="btn cdp-btn-secondary text-white ml-2" href="">
                                    <i class="icon icon-plus pr-1"></i> Create new consent
                                </a>
                            </div>
                        </div>

                        <div className="table-responsive shadow-sm bg-white">
                            <table className="table table-hover table-sm mb-0 cdp-table">
                                <thead className="cdp-bg-primary text-white cdp-table__header">
                                    <tr>
                                        <th>Consent Title</th>
                                        <th>Available Translation</th>
                                        <th>Consent Type</th>
                                        <th>Preference</th>
                                        <th>Status</th>
                                        <th>Created By</th>
                                        <th>Created Date</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody className="cdp-table__body bg-white">
                                    <tr>
                                        <td>I give my consent to send me promotional email</td>
                                        <td>NL_NL, BE_NL</td>
                                        <td>Medical</td>
                                        <td>Galapagos Terms of Use</td>
                                        <td>Active</td>
                                        <td>System Admin</td>
                                        <td>10.10.2020</td>
                                        <td><Dropdown className="ml-auto dropdown-customize">
                                            <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle btn d-flex align-items-center">
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item>Edit Consent</Dropdown.Item>
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

export default CdpConsents;

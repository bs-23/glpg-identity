import React, { useEffect, useState } from "react";
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Dropdown from 'react-bootstrap/Dropdown';
import Modal from 'react-bootstrap/Modal';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import CreateCountryConsent from './create-country-consent.component';
import { useSelector, useDispatch } from 'react-redux';
import { getCdpConsents } from '../consent.action';
import axios from "axios";


import { getCountryConsents } from '../consent.action';

const CountryConsents = () => {
    const [show, setShow] = useState(false);
    const dispatch = useDispatch();
    const cdp_consents = useSelector(state => state.consentReducer.cdp_consents);
    const [countries, setCountries] = useState([]);


    const dispatch = useDispatch();
    const [countryConsent, setCountryConsent] = useState([]);
    const country_consents = useSelector(state => state.consentReducer.country_consents).reduce(
        (grouped, current) => {
            const existing = grouped.find(g => g.country_iso2 === current.country_iso2);
            if (existing) {
                existing.consents.push({
                    ...current.consent,
                    opt_type: current.opt_type
                });
            } else {
                grouped.push({
                    country_iso2: current.country_iso2,
                    consents: [{
                        ...current.consent,
                        opt_type: current.opt_type
                    }]
                });
            }
            return grouped;
        }
        , []
    );

    async function loadCountryConsents() {
        dispatch(getCountryConsents());
    }

    useEffect(() => {
        async function getCountries() {
            const response = await axios.get('/api/countries');
            setCountries(response.data);
        }
        getCountries();
        dispatch(getCdpConsents(null, null));
        loadCountryConsents();
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
                                <li className="breadcrumb-item active"><span>Country Consents List</span></li>
                            </ol>
                        </nav>
                    </div>
                </div>
                <div className="row">

                    {/* {
                        country_consents.map((countryConsent, index) =>
                            (
                                <div key={index}>
                                    <ul >{countryConsent.country_iso2}---------------</ul>
                                    {
                                        countryConsent.consents.map((consent, i) =>
                                            (
                                                <span key={i}>{consent.opt_type}===========</span>
                                            )
                                        )
                                    }
                                </div>
                            )
                        )
                    } */}






                    <div className="col-12">
                        <div className="d-sm-flex justify-content-between align-items-center mb-3 mt-4">
                            <h4 className="cdp-text-primary font-weight-bold mb-3 mb-sm-0">Country Consents</h4>
                            <div class="d-flex justify-content-between align-items-center">
                                <button onClick={() => setShow(true)} className="btn cdp-btn-secondary text-white ml-2">
                                    <i className="icon icon-plus pr-1"></i> Create country consent
                                </button>
                                {cdp_consents && <CreateCountryConsent changeShow={(val) => setShow(val)} countries={countries} consents={cdp_consents} show={show} />}
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

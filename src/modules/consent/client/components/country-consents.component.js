import React, { useEffect, useState } from "react";
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import CountryConsentForm from './country-consent-form';
import { getCdpConsents } from '../consent.action';
import optTypes from '../opt-types.json';
import axios from "axios";
import Modal from 'react-bootstrap/Modal'
import { useToasts } from 'react-toast-notifications';

import { getCountryConsents, deleteCountryConsent } from '../consent.action';

const CountryConsents = () => {
    const [show, setShow] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const { addToast } = useToasts();

    const dispatch = useDispatch();
    const cdp_consents = useSelector(state => state.consentReducer.cdp_consents);
    const [countries, setCountries] = useState([]);
    const [] = useState([]);
    const country_consents = useSelector(state => state.consentReducer.country_consents);

    const getGroupedCountryConsents = () => {
        if (!countries || !countries.length) return [];

        const groupedByCountry = country_consents.reduce(
            (grouped, current) => {
                const existing = grouped.find(g => g.country_iso2 === current.country_iso2);
                const optType = optTypes.find(ot => ot.value === current.opt_type);
                if (existing) {
                    existing.consents.push({
                        ...current.consent,
                        opt_type: optType.text,
                        country_consent_id: current.id
                    });
                } else {
                    const country = countries.find(c => c.country_iso2.toLowerCase() === current.country_iso2.toLowerCase());
                    grouped.push({
                        name: country.codbase_desc,
                        country_iso2: current.country_iso2,
                        flagUrl: `/assets/flag/flag-${country.codbase_desc.replace(' ', '-').toLowerCase()}.svg`,
                        consents: [{
                            ...current.consent,
                            opt_type: optType.text,
                            country_consent_id: current.id
                        }]
                    });
                }
                return grouped;
            }
            , []
        );
        return groupedByCountry;
    }

    const setDeleteModal = (id) => {
        setDeleteId(id);
        setShowDelete(true);
    }

    const deleteItem = () => {
        dispatch(deleteCountryConsent(deleteId)).then(() => {
            addToast('Country Consent deleted successfully', {
                appearance: 'success',
                autoDismiss: true
            });

        }).catch(error => {
            addToast(error.response.data, {
                appearance: 'error',
                autoDismiss: true
            });
        }).finally(function () {
            setShowDelete(false);
            setDeleteId(null);

        });

    }

    useEffect(() => {
        async function getCountries() {
            const response = await axios.get('/api/countries');
            setCountries(response.data);
        }
        getCountries();
        dispatch(getCdpConsents(null, null));
        dispatch(getCountryConsents());
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
                    <div className="col-12">
                        <div className="d-sm-flex justify-content-between align-items-center mb-3 mt-4">
                            <h4 className="cdp-text-primary font-weight-bold mb-3 mb-sm-0">Country Consents</h4>
                            <div class="d-flex justify-content-between align-items-center">
                                <button onClick={() => setShow(true)} className="btn cdp-btn-secondary text-white ml-2">
                                    <i className="icon icon-plus pr-1"></i> Create country consent
                                </button>
                                {cdp_consents && <CountryConsentForm changeShow={(val) => setShow(val)} countries={countries} consents={cdp_consents} show={show} />}
                            </div>
                        </div>

                        {
                            getGroupedCountryConsents().map((countryConsent, countryConsentIndex) =>
                                (
                                    <div className="table-responsive shadow-sm bg-white mb-3" key={countryConsentIndex}>
                                        <table className="table table-hover table-sm mb-0 cdp-table mb-2">
                                            <thead className="bg-light cdp-table__header">
                                                <tr>
                                                    <th colSpan="4"><div className="d-flex align-items-center"><img alt={countryConsent.name} src={countryConsent.flagUrl} height="18" className="mr-2" /> {countryConsent.name}</div></th>
                                                </tr>
                                            </thead>
                                            <thead className="cdp-table__header">
                                                <tr>
                                                    <th>Consent Title</th>
                                                    <th>Available Translations</th>
                                                    <th>Opt Type</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="cdp-table__body bg-white">
                                                {
                                                    countryConsent.consents.map((consent, coonsentIndex) =>
                                                        (
                                                            <tr key={coonsentIndex}>
                                                                <td>{consent.title}</td>
                                                                <td>{consent.locales}</td>
                                                                <td>{consent.opt_type}</td>
                                                                <td>
                                                                    <a href="#" className="btn btn-link">Edit</a> | <button onClick={() => setDeleteModal(consent.country_consent_id)} className="btn btn-link text-danger">Delete</button>

                                                                </td>
                                                            </tr>
                                                        )
                                                    )
                                                }
                                            </tbody>
                                        </table>

                                    </div>
                                )
                            )
                        }

                        <Modal show={showDelete} onHide={() => setShowDelete(false)}>
                            <Modal.Header closeButton>
                                <Modal.Title>Modal heading</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <p>Are you sure to delete this country consent?</p>
                                <button onClick={() => setShowDelete(false)}>Close</button>
                                <button onClick={() => deleteItem()}>Save Changes</button>
                            </Modal.Body>

                        </Modal>


                    </div>
                </div>
            </div>

        </main>
    );
}

export default CountryConsents;

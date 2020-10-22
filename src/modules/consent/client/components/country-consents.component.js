import React, { useEffect, useState } from "react";
import { NavLink } from 'react-router-dom';
import { useToasts } from 'react-toast-notifications';
import { useSelector, useDispatch } from 'react-redux';
import Modal from 'react-bootstrap/Modal'
import axios from "axios";
import CountryConsentForm from './country-consent-form';
import optTypes from '../opt-types.json';
import ConsentComponent from './consent.component';
import { getCountryConsents, deleteCountryConsent, getCdpConsents } from '../consent.actions';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import parse from 'html-react-parser';

const CountryConsents = () => {
    const [show, setShow] = useState(false);
    const [editable, setEditable] = useState(false);
    const [editOption, setEditOption] = useState(null);
    const [showDelete, setShowDelete] = useState(false);
    const [consentToDelete, setConsentToDelete] = useState(null);
    const { addToast } = useToasts();
    const [consentId, setConsentId] = useState(null);

    const dispatch = useDispatch();
    const cdp_consents = useSelector(state => state.consentReducer.cdp_consents);
    const [countries, setCountries] = useState([]);
    const [] = useState([]);
    const country_consents = useSelector(state => state.consentReducer.country_consents);

    const getGroupedCountryConsents = () => {
        if (!countries || !countries.length) return [];

        const groupedByCountry = country_consents.reduce(
            (grouped, current) => {
                const existing = grouped.find(g => g.country_iso2.toLowerCase() === current.country_iso2.toLowerCase());
                const optType = optTypes.find(ot => ot.value === current.opt_type);
                if (existing) {
                    existing.consents.push({
                        ...current.consent,
                        opt_type: optType.text,
                        country_consent_id: current.id,
                        country_iso2: current.country_iso2
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
                            country_consent_id: current.id,
                            country_iso2: current.country_iso2
                        }]
                    });
                }
                return grouped;
            }
            , []
        );
        return groupedByCountry;
    }

    const setEdit = (consent) => {
        setEditOption(consent);
        setEditable(true);
        setShow(true);
    }

    const showConsentDetailsModal = (id) => {
        setConsentId(id);
    };

    const setDeleteModal = (id, title, countryName) => {
        setConsentToDelete({ id, title, countryName });
        setShowDelete(true);
    }

    const deleteItem = () => {
        dispatch(deleteCountryConsent(consentToDelete.id)).then(() => {
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
            setConsentToDelete(null);
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
                                <li className="breadcrumb-item active"><span>Manage Consent Per Country</span></li>
                            </ol>
                        </nav>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <div className="d-sm-flex justify-content-between align-items-center mb-3 mt-4">
                            <div class="d-flex justify-content-end align-items-center">
                                <button onClick={() => { setShow(true); setEditable(false); setEditOption(null); }} className="btn cdp-btn-secondary text-white ml-2">
                                    <i className="icon icon-plus pr-1"></i> Assign consent to country
                                </button>
                                {cdp_consents && <CountryConsentForm editable={editable} options={editOption} changeShow={(val) => setShow(val)} countries={countries} consents={cdp_consents} show={show} />}
                            </div>
                        </div>

                        {
                            getGroupedCountryConsents().map((countryConsent, countryConsentIndex) =>
                                (
                                    <div className="table-responsive shadow-sm bg-white mb-3" key={countryConsentIndex}>
                                        <table className="table table-hover table-sm mb-0 cdp-table mb-2">
                                            <thead className="cdp-bg-primary-lighter cdp-table__header">
                                                <tr>
                                                    <th colSpan="4"><div className="d-flex align-items-center text-white"><img alt={countryConsent.name} src={countryConsent.flagUrl} height="18" className="mr-2" /> {countryConsent.name}</div></th>
                                                </tr>
                                            </thead>
                                            <thead className="cdp-table__header">
                                                <tr>
                                                    <th>Preference / Purpose</th>
                                                    <th>Available Localizations</th>
                                                    <th>Opt Type</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="cdp-table__body bg-white">
                                                {
                                                    countryConsent.consents.map((consent, coonsentIndex) =>
                                                        (
                                                            <tr key={coonsentIndex}>
                                                                <td>
                                                                    <span type="button" className="btn btn-link cdp-text-primary p-0" onClick={() => showConsentDetailsModal(consent.id)}>
                                                                        <i className="fas fa-caret-right mr-1"></i>{consent.preference}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    {consent.translations && consent.translations.length > 0 && consent.translations.map(translation => (
                                                                        <OverlayTrigger key={translation.id}
                                                                            placement="top"
                                                                            delay={{ show: 250, hide: 400 }}
                                                                            overlay={
                                                                                <Popover className="popup-customize" id={`popover-positioned-top`}>
                                                                                    <Popover.Content className="popup-customize__content">
                                                                                        <div>{parse(translation.rich_text)}</div>
                                                                                    </Popover.Content>
                                                                                </Popover>
                                                                            }

                                                                        >
                                                                            <span className="badge badge-secondary-light shadow-sm font-weight-bold-light mr-1 text-dark">{translation.locale}</span>
                                                                        </OverlayTrigger>
                                                                    ))}</td>
                                                                <td>{consent.opt_type}</td>
                                                                <td>
                                                                    <button className="btn btn-link cdp-text-primary p-0 mr-3" onClick={() => setEdit(consent)}><i className="fas fa-tasks mr-1"></i>Manage opt type</button> <button onClick={() => setDeleteModal(consent.country_consent_id, consent.title, countryConsent.name)} className="btn btn-link text-danger p-0"><i className="far fa-trash-alt mr-1"></i>Remove</button>
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

                        <Modal centered size="lg" show={showDelete} onHide={() => setShowDelete(false)}>
                            <Modal.Header closeButton>
                                <Modal.Title>Remove Consent from Country</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                {consentToDelete ? (
                                    <div>
                                        Are you sure to remove this consent from <b>{consentToDelete.countryName}</b>?
                                        <div className="alert alert-warning my-3">
                                            {consentToDelete.title}
                                        </div>
                                    </div>
                                ) : null}
                            </Modal.Body>
                            <Modal.Footer>
                                <button className="btn cdp-btn-outline-primary" onClick={() => setShowDelete(false)}>Cancel</button>
                                <button className="ml-2 btn cdp-btn-secondary text-white" onClick={() => deleteItem()}>Confirm</button>
                            </Modal.Footer>
                        </Modal>

                        {consentId && <ConsentComponent consentId={consentId} setConsentId={setConsentId} />}
                    </div>
                </div>
            </div>
        </main >
    );
}

export default CountryConsents;

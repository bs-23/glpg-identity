import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Modal from 'react-bootstrap/Modal';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import parse from 'html-react-parser';
import optTypes from '../opt-types.json';
import { getConsent, setConsent } from '../consent.actions';

const ConsentComponent = ({ consentId }) => {
    const dispatch = useDispatch();
    const consent = useSelector(state => state.consentReducer.consent);
    const [showConsentModal, setShowConsentModal] = useState(false);
    const countries = useSelector(state => state.userReducer.countries);

    const getConsentCountries = (consentCountries) => {
        return consentCountries.map(countryConsent => {
            const country = countries.find(c => c.country_iso2.toLowerCase() === countryConsent.country_iso2.toLowerCase());
            return {
                name: country.codbase_desc,
                opt_type: (optTypes.find(optType => optType.value === countryConsent.opt_type) || {}).text
            };
        });
    };

    const hideConsentDetails = () => {
        setShowConsentModal(false);
        dispatch(setConsent(null));
    };

    useEffect(() => {
        dispatch(getConsent(consentId));
        setShowConsentModal(true);
    }, [consentId]);

    return <Modal
        size="lg"
        centered
        show={showConsentModal}
        onHide={() => hideConsentDetails()}>
        <Modal.Header closeButton>
            <Modal.Title>
                Consent details
            </Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {consent ? (
                <div className="px-4 py-3">
                    <div className="row">
                        <div className="col-12 pb-3 px-0">
                            <label className="mt-1 font-weight-bold">Consent Title</label>
                            <div className="">{consent.title}</div>
                        </div>
                        <div className="col-12 col-sm-6 pb-3 px-0">
                            <label className="mt-1 font-weight-bold">Consent Type</label>
                            <div>{consent.consent_category ? consent.consent_category.title : ''}</div>
                        </div>
                        <div className="col-12 col-sm-6 pb-3 px-0">
                            <label className="mt-1 font-weight-bold">Preference</label>
                            <div>{consent.preference}</div>
                        </div>
                        <div className="col-12 col-sm-6 pb-3 px-0">
                            <label className="mt-1 font-weight-bold">Status</label>
                            <div>{consent.is_active ? 'Active' : 'Inactive'}</div>
                        </div>
                        <div className="col-12 col-sm-6 pb-3 px-0">
                            <label className="mt-1 font-weight-bold">Created By</label>
                            <div>{consent.createdByUser ? `${consent.createdByUser.first_name} ${consent.createdByUser.last_name}` : ''}</div>
                        </div>
                        <div className="col-12 col-sm-6 pb-3 px-0">
                            <label className="mt-1 font-weight-bold">Ctreated Date</label>
                            <div>{(new Date(consent.created_at)).toLocaleDateString('en-GB').replace(/\//g, '.')}</div>
                        </div>
                        <div className="col-12 pb-3 px-0">
                            <label className="mt-1 font-weight-bold">Assigned Countries</label>
                            {consent.countries && consent.countries.length > 0 ?
                                (
                                    <table className="table table-hover table-sm mb-0 cdp-table mb-2 shadow-sm">
                                        <thead className="cdp-bg-primary-lighter text-white cdp-table__header">
                                            <tr>
                                                <th className="py-1">Country</th>
                                                <th className="py-1">Opt Type</th>
                                            </tr>
                                        </thead>
                                        <tbody className="cdp-table__body bg-white">
                                            {getConsentCountries(consent.countries).map((country, index) => (
                                                <tr key={index}>
                                                    <td>{country.name}</td>
                                                    <td>{country.opt_type}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )
                                : 'This consent is not assigned to any country.'
                            }
                        </div>
                    </div>

                    <div className="row mt-1">
                        <div className="col accordion-consent rounded shadow-sm p-0">
                            <h4 className="accordion-consent__header p-3 font-weight-bold mb-0 cdp-light-bg">Available Translations</h4>
                            {consent.translations && consent.translations.length > 0 ? consent.translations.map((translation, index) => (
                                <Accordion defaultActiveKey="0" key={index}>
                                    <Card>
                                        <Card.Header className="p-0">
                                            <Accordion.Toggle as={Card.Header} variant="link" eventKey="0" type="button" className="card-header d-flex justify-content-between">
                                                {translation.locale.toUpperCase()}
                                                <i class="icon icon-arrow-down ml-2 faq__icon-down"></i>
                                            </Accordion.Toggle>
                                        </Card.Header>
                                        <Accordion.Collapse eventKey="0">
                                            <Card.Body className="ml-0"><div>{parse(translation.rich_text)}</div></Card.Body>
                                        </Accordion.Collapse>
                                    </Card>
                                </Accordion>
                            )) : 'There are no translations for this Consent.'}
                        </div>
                    </div>
                </div>
            ) : (<div>LOADING...</div>)}
        </Modal.Body>
    </Modal>
};

export default ConsentComponent;

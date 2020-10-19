import React, { useEffect, useState } from "react";
import { NavLink } from 'react-router-dom';
import { getCdpConsents } from '../consent.action';
import { useSelector, useDispatch } from 'react-redux';
import Dropdown from 'react-bootstrap/Dropdown';
import Modal from 'react-bootstrap/Modal';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import parse from 'html-react-parser';

const Consents = () => {
    const dispatch = useDispatch();
    const cdp_consents = useSelector(state => state.consentReducer.cdp_consents);
    const [lgShow, setLgShow] = useState(false);
    const [consent, setConsent] = useState({});

    async function loadCdpConsents() {
        dispatch(getCdpConsents(true, true));
    }

    const getConsents = (row) => {
        setConsent(row);
        setLgShow(true);
    }

    function getLocales(translations){
        if(translations){
            const locales = translations.map(item => item.locale.toUpperCase());
            return locales.join(', ');
        }
        return '';
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
                                <NavLink to="/consent/create" className="btn cdp-btn-secondary text-white ml-2">
                                    <i className="icon icon-plus pr-1"></i> Create new consent
                                </NavLink>
                            </div>
                        </div>

                        {cdp_consents && cdp_consents.length > 0 &&
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
                                        {cdp_consents.map((row, index) => (
                                            <tr key={index}>
                                                <td>{row.title}</td>
                                                <td>{getLocales(row.translations)}</td>
                                                <td>{row.consent_category ? row.consent_category.title : ''}</td>
                                                <td>{row.preference}</td>
                                                <td>{row.is_active ? 'Active' : 'Inactive'}</td>
                                                <td>{row.createdByUser ? `${row.createdByUser.first_name} ${row.createdByUser.last_name}` : ''}</td>
                                                <td>{(new Date(row.created_at)).toLocaleDateString('en-GB').replace(/\//g, '.')}</td>
                                                <td><Dropdown className="ml-auto dropdown-customize">
                                                    <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle btn-sm py-0 px-1 dropdown-toggle ">
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu>
                                                        <Dropdown.Item>Edit Consent</Dropdown.Item>
                                                        <Dropdown.Item onClick={() => getConsents(row)}>Consent Detail</Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        }
                    </div>
                </div>
            </div>

            <Modal
                size="lg"
                centered
                show={lgShow}
                onHide={() => setLgShow(false)}
                aria-labelledby="example-modal-sizes-title-lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title id="example-modal-sizes-title-lg">
                        Consent detail
                </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="px-4 py-3">
                        <div className="row">
                            <div className="col">
                                <h4 className="mt-1 font-weight-bold">Consent Title</h4>
                                <div className="">{consent.title}</div>
                            </div>
                        </div>
                        <div className="row mt-3">
                            <div className="col-6">
                                <div className="mt-1 font-weight-bold">Consent Type</div>
                                <div className="">{consent.consent_category ? consent.consent_category.title : ''}</div>
                            </div>
                            <div className="col-6">
                                <div className="mt-1 font-weight-bold">Preference</div>
                                <div className="">{consent.preference}</div>
                            </div>
                        </div>
                        <div className="row mt-3">
                            <div className="col-6">
                                <div className="mt-1 font-weight-bold">Status</div>
                                <div className="">{consent.is_active ? 'Active' : 'Inactive'}</div>
                            </div>
                            <div className="col-6">
                                <div className="mt-1 font-weight-bold">Created By</div>
                                <div className="">{consent.createdByUser ? `${consent.createdByUser.first_name} ${consent.createdByUser.last_name}` : ''}</div>
                            </div>
                        </div>
                        <div className="row mt-3">
                            <div className="col-6">
                                <div className="mt-1 font-weight-bold">Ctreated Date</div>
                                <div className="">{(new Date(consent.created_at)).toLocaleDateString('en-GB').replace(/\//g, '.')}</div>
                            </div>
                        </div>
                        <div className="row mt-4">
                            <div className="col accordion-consent rounded shadow-sm p-0">
                                <h4 className="accordion-consent__header p-3 font-weight-bold mb-0 cdp-light-bg">Available Translation	</h4>
                                {consent.translations && consent.translations.length > 0 ? consent.translations.map((translation, index) => (
                                    <Accordion defaultActiveKey="0" key={index}>
                                        <Card>
                                            <Card.Header>
                                                <Accordion.Toggle as={Card.Header} variant="link" eventKey="0">
                                                    {translation.locale.toUpperCase()}
                                                </Accordion.Toggle>
                                            </Card.Header>
                                            <Accordion.Collapse eventKey="0">
                                                <Card.Body><div>{parse(translation.rich_text)}</div></Card.Body>
                                            </Accordion.Collapse>
                                        </Card>
                                    </Accordion>
                                )) : 'There are no translations'}
                            </div>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </main>
    );
}

export default Consents;

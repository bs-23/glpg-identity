import React, { useEffect, useState } from "react";
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Dropdown from 'react-bootstrap/Dropdown';
import Modal from 'react-bootstrap/Modal';
import { getCdpConsents } from './consent.actions';
import ConsentComponent from './consent.component';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import parse from 'html-react-parser';
import Faq from '../../../platform/faq/client/faq.component';

const ConsentsComponent = () => {
    const dispatch = useDispatch();
    const cdp_consents = useSelector(state => state.consentReducer.cdp_consents);
    const [consentId, setConsentId] = useState(null);
    const [showFaq, setShowFaq] = useState(false);
    const handleCloseFaq = () => setShowFaq(false);
    const handleShowFaq = () => setShowFaq(true);

    const showConsentDetails = (row) => {
        setConsentId(row.id);
    };

    useEffect(() => {
        dispatch(getCdpConsents(true, true));
    }, []);

    return (
        <main className="app__content cdp-light-bg h-100">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0">
                        <nav className="breadcrumb justify-content-between align-items-center" aria-label="breadcrumb">
                            <ol className="rounded-0 m-0 p-0 d-none d-sm-flex">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item"><NavLink to="/consent">Data Privacy & Consent Management</NavLink></li>
                                <li className="breadcrumb-item active"><span>CDP Consents</span></li>
                            </ol>
                            <Dropdown className="dropdown-customize breadcrumb__dropdown d-block d-sm-none ml-2">
                                <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle btn d-flex align-items-center border-0">
                                    <i className="fas fa-arrow-left mr-2"></i> Back
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item className="px-2" href="/"><i className="fas fa-link mr-2"></i> Dashboard</Dropdown.Item>
                                    <Dropdown.Item className="px-2" href="/consent"><i className="fas fa-link mr-2"></i> Data Privacy & Consent Management</Dropdown.Item>
                                    <Dropdown.Item className="px-2" active><i className="fas fa-link mr-2"></i> CDP Consents</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                            <span className="ml-auto mr-3"><i type="button" onClick={handleShowFaq} className="icon icon-help breadcrumb__faq-icon cdp-text-secondary"></i></span>
                        </nav>
                        <Modal show={showFaq} onHide={handleCloseFaq} size="lg" centered>
                            <Modal.Header closeButton>
                                <Modal.Title>Questions You May Have</Modal.Title>
                            </Modal.Header>
                            <Modal.Body className="faq__in-modal"><Faq topic="manage-consent" /></Modal.Body>
                        </Modal>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <div className="d-flex justify-content-between align-items-center py-3 cdp-table__responsive-sticky-panel">
                            <h4 className="cdp-text-primary font-weight-bold mb-0 mb-sm-0 d-flex align-items-end pr-2">CDP Consents</h4>
                            <div class="d-flex justify-content-between align-items-center">
                                <NavLink to="/consent/create" className="btn cdp-btn-secondary text-white ml-2">
                                    <i className="icon icon-plus pr-1"></i> <span className="d-none d-sm-inline-block pl-1">Create new consent</span>
                                </NavLink>
                            </div>
                        </div>

                        {cdp_consents && cdp_consents.length > 0 &&
                            <div className="table-responsive shadow-sm bg-white mb-3 cdp-table__responsive-wrapper">
                            <table className="table table-hover table-sm mb-0 cdp-table cdp-table__responsive">
                                    <thead className="cdp-bg-primary text-white cdp-table__header">
                                        <tr>
                                            <th>Preference</th>
                                            <th>Available Localizations</th>
                                            <th>Consent Type</th>
                                            <th>Status</th>
                                            <th>Created By</th>
                                            <th>Created On</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="cdp-table__body bg-white">
                                        {cdp_consents.map((row, index) => (
                                            <tr key={index}>
                                                <td data-for="Preference">{row.preference}</td>
                                                <td data-for="Preference">
                                                    {row.translations && row.translations.length > 0 && row.translations.map(translation => (
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
                                                    ))}
                                                </td>
                                                <td data-for="Available Localizations">{row.consent_category ? row.consent_category.title : ''}</td>
                                                <td data-for="Status">{row.is_active ? 'Active' : 'Inactive'}</td>
                                                <td data-for="Created By">{row.createdBy}</td>
                                                <td data-for="Created On">{(new Date(row.created_at)).toLocaleDateString('en-GB').replace(/\//g, '.')}</td>
                                                <td data-for="Action"><Dropdown className="ml-auto dropdown-customize">
                                                    <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle btn-sm py-0 px-1 dropdown-toggle ">
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu>
                                                        <Dropdown.Item as={NavLink} to={`/consent/edit/${row.id}`}>
                                                            Edit Consent
                                                        </Dropdown.Item>
                                                        <Dropdown.Item onClick={() => showConsentDetails(row)}>Consent Detail</Dropdown.Item>
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

            {consentId && <ConsentComponent consentId={consentId} setConsentId={setConsentId} />}
        </main>
    );
}

export default ConsentsComponent;

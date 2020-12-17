import React, { useEffect, useState } from "react";
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Dropdown from 'react-bootstrap/Dropdown';
import Modal from 'react-bootstrap/Modal';
import { useToasts } from 'react-toast-notifications';
import { getCdpConsents } from '../consent.actions';
import ConsentComponent from './consent.component';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import parse from 'html-react-parser';
import Faq from '../../../platform/faq/client/faq.component';

const ConsentsComponent = () => {
    const { addToast } = useToasts();
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
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb rounded-0">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item"><NavLink to="/consent">Data Privacy & Consent Management</NavLink></li>
                                <li className="breadcrumb-item active"><span>CDP Consents</span></li>
                                <li className="ml-auto mr-3"><i type="button" onClick={handleShowFaq} className="icon icon-help icon-2x cdp-text-secondary"></i></li>
                            </ol>
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
                                                <td>{row.preference}</td>
                                                <td>
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
                                                <td>{row.consent_category ? row.consent_category.title : ''}</td>
                                                <td>{row.is_active ? 'Active' : 'Inactive'}</td>
                                                <td>{row.createdBy}</td>
                                                <td>{(new Date(row.created_at)).toLocaleDateString('en-GB').replace(/\//g, '.')}</td>
                                                <td><Dropdown className="ml-auto dropdown-customize">
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

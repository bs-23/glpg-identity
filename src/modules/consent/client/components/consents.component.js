import React, { useEffect, useState } from "react";
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Dropdown from 'react-bootstrap/Dropdown';
import Modal from 'react-bootstrap/Modal';
import { useToasts } from 'react-toast-notifications';
import { getCdpConsents, deleteConsent } from '../consent.actions';
import ConsentComponent from './consent.component';

const ConsentsComponent = () => {
    const { addToast } = useToasts();
    const dispatch = useDispatch();
    const cdp_consents = useSelector(state => state.consentReducer.cdp_consents);
    const [consentId, setConsentId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [consentToDelete, setConsentToDelete] = useState(null);

    const showConsentDetails = (row) => {
        setConsentId(row.id);
    };

    const toggleDeleteConsentModal = (consent) => {
        setConsentToDelete(consent);
        setShowDeleteModal(!!consent);
    };

    const deleteItem = () => {
        dispatch(deleteConsent(consentToDelete.id)).then(() => {
            addToast('Consent deleted successfully', {
                appearance: 'success',
                autoDismiss: true
            });
        }).catch(error => {
            addToast(error.response.data, {
                appearance: 'error',
                autoDismiss: true
            });
        }).finally(function () {
            toggleDeleteConsentModal(null);
        });
    }

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
                                            <th>Title</th>
                                            <th>Available Localizations</th>
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
                                                <td>{row.locales}</td>
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
                                                        <Dropdown.Item onClick={() => showConsentDetails(row)}>Consent Detail</Dropdown.Item>
                                                        <Dropdown.Item className="text-danger" onClick={() => toggleDeleteConsentModal(row)}>Delete</Dropdown.Item>
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

            <Modal show={showDeleteModal} onHide={() => toggleDeleteConsentModal(null)}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete Consent</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {consentToDelete ? (
                        <div>
                            Are you sure to delete the following consent?
                            <div className="card mt-2 mb-3">
                                <div className="card-body">
                                    {consentToDelete.title}
                                </div>
                            </div>
                        </div>
                    ) : null}
                    <button onClick={() => toggleDeleteConsentModal(null)}>Cancel</button>
                    <button className="ml-2" onClick={() => deleteItem()}>Confirm</button>
                </Modal.Body>
            </Modal>
        </main>
    );
}

export default ConsentsComponent;

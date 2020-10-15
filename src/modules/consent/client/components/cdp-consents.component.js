import React, { useEffect, useState } from "react";
import { NavLink } from 'react-router-dom';
import { getCdpConsents } from '../consent.action';
import { useSelector, useDispatch } from 'react-redux';
import Dropdown from 'react-bootstrap/Dropdown';
import Modal from 'react-bootstrap/Modal';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';

const CdpConsents = () => {
    const dispatch = useDispatch();
    const cdp_consents = useSelector(state => state.consentReducer.cdp_consents);
    const [lgShow, setLgShow] = useState(false);

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
                                            <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle btn-sm py-0 px-1 dropdown-toggle ">
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item>Edit Consent</Dropdown.Item>
                                                <Dropdown.Item onClick={() => setLgShow(true)}>Consent Detail</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
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
                                <h4 className="mt-1 font-weight-bold">Consent Title	</h4>
                                <div className="">I give my consent to send me promotional email</div>
                            </div>
                        </div>
                        <div className="row mt-3">
                            <div className="col-6">
                                <div className="mt-1 font-weight-bold">Consent Type</div>
                                <div className="">Medical</div>
                            </div>
                            <div className="col-6">
                                <div className="mt-1 font-weight-bold">Preference</div>
                                <div className="">Galapagos Terms of Use</div>
                            </div>
                        </div>
                        <div className="row mt-3">
                            <div className="col-6">
                                <div className="mt-1 font-weight-bold">Status</div>
                                <div className="">Active</div>
                            </div>
                            <div className="col-6">
                                <div className="mt-1 font-weight-bold">Created By</div>
                                <div className="">System Admin</div>
                            </div>
                        </div>
                        <div className="row mt-3">
                            <div className="col-6">
                                <div className="mt-1 font-weight-bold">Ctreated Date</div>
                                <div className="">20.102020</div>
                            </div>
                        </div>
                        <div className="row mt-4">
                            <div className="col accordion-consent rounded shadow-sm p-0">
                                <h4 className="accordion-consent__header p-3 font-weight-bold mb-0 cdp-light-bg">Available Translation	</h4>
                                <Accordion defaultActiveKey="0">
                                    <Card>
                                        <Card.Header>
                                            <Accordion.Toggle as={Card.Header} variant="link" eventKey="0">
                                                NL_NL
      </Accordion.Toggle>
                                        </Card.Header>
                                        <Accordion.Collapse eventKey="0">
                                            <Card.Body>NL_NL text</Card.Body>
                                        </Accordion.Collapse>
                                    </Card>
                                    <Card>
                                        <Card.Header>
                                            <Accordion.Toggle as={Card.Header}variant="link" eventKey="1">
                                                BE_NL
      </Accordion.Toggle>
                                        </Card.Header>
                                        <Accordion.Collapse eventKey="1">
                                            <Card.Body>BE_NL text</Card.Body>
                                        </Accordion.Collapse>
                                    </Card>
                                </Accordion>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </main>
    );
}

export default CdpConsents;

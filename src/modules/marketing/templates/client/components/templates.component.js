import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Dropdown from 'react-bootstrap/Dropdown';
import Modal from 'react-bootstrap/Modal';

import Faq from '../../../../platform/faq/client/faq.component';
import { getTemplates } from '../templates.types';


const TemplatesComponent = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const history = useHistory();

    const [showFaq, setShowFaq] = useState(false);
    const [campaignToDelete, setCampaignToDelete] = useState(null);
    const handleCloseFaq = () => setShowFaq(false);
    const handleShowFaq = () => setShowFaq(true);

    return (
        <main className="app__content cdp-light-bg h-100">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0">
                        <nav className="breadcrumb justify-content-between align-items-center" aria-label="breadcrumb">
                            <ol className="rounded-0 m-0 p-0 d-none d-sm-flex">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item"><NavLink to="/marketing">Marketing and Promotional</NavLink></li>
                                <li className="breadcrumb-item active"><span>Manage Templates</span></li>
                            </ol>
                            <Dropdown className="dropdown-customize breadcrumb__dropdown d-block d-sm-none ml-2">
                                <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle btn d-flex align-items-center border-0">
                                    <i className="fas fa-arrow-left mr-2"></i> Back
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item className="px-2" href="/"><i className="fas fa-link mr-2"></i> Dashboard</Dropdown.Item>
                                    <Dropdown.Item className="px-2" href="/marketing"><i className="fas fa-link mr-2"></i> Marketing and Promotional</Dropdown.Item>
                                    <Dropdown.Item className="px-2" active><i className="fas fa-link mr-2"></i> Manage Templates</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                            <span className="ml-auto mr-3"><i onClick={handleShowFaq} className="icon icon-help breadcrumb__faq-icon cdp-text-secondary cursor-pointer"></i></span>
                        </nav>
                        <Modal show={showFaq} onHide={handleCloseFaq} size="lg" centered>
                            <Modal.Header closeButton>
                                <Modal.Title>Questions You May Have</Modal.Title>
                            </Modal.Header>
                            <Modal.Body className="faq__in-modal"><Faq topic="manage-marketing" /></Modal.Body>
                        </Modal>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <div className="d-flex justify-content-between align-items-center py-3 cdp-table__responsive-sticky-panel">
                            <h4 className="cdp-text-primary font-weight-bold mb-0 mb-sm-0 d-flex align-items-end pr-2">List of Templates</h4>
                            <div class="d-flex justify-content-between align-items-center">
                                <NavLink to="#" className="btn cdp-btn-secondary text-white ml-2">
                                    <i className="icon icon-plus"></i> <span className="d-none d-sm-inline-block pl-1">Create Template</span>
                                </NavLink>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default TemplatesComponent;

import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Faq } from '../../../../platform';
import Modal from 'react-bootstrap/Modal';
import Dropdown from 'react-bootstrap/Dropdown';

const WholesellerBusinessPartnerManagement = () => {
    const [showFaq, setShowFaq] = useState(false);
    const handleCloseFaq = () => setShowFaq(false);
    const handleShowFaq = () => setShowFaq(true);
    const requests = [
        {
            first_name: "Daniel",
            last_name: "Martin",
            purchasing_organization: "UAS",
            company_code: "0932",
            email: "daniel@gmail.com",
            procurement_contact: "daniel@gmail.com"
        }
    ];

    return (
        <main className="app__content cdp-light-bg">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb rounded-0">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item"><NavLink to="/business-partner">Business Partner Management</NavLink></li>
                                <li className="breadcrumb-item active"><span>Business Partner Requests</span></li>
                                <li className="ml-auto mr-3"><i type="button" onClick={handleShowFaq} className="icon icon-help icon-2x cdp-text-secondary"></i></li>
                            </ol>
                        </nav>
                        <Modal show={showFaq} onHide={handleCloseFaq} size="lg" centered>
                            <Modal.Header closeButton>
                                <Modal.Title>Questions You May Have</Modal.Title>
                            </Modal.Header>
                            <Modal.Body className="faq__in-modal"><Faq topic="consent-performance-report" /></Modal.Body>
                        </Modal>
                    </div>
                </div>

                <div className="row">
                    <div className="col-12">
                    <div className="d-sm-flex justify-content-between align-items-center mb-3 mt-4">
                            <h4 className="cdp-text-primary font-weight-bold mb-3 mb-sm-0">Overview of Business Partner Requests</h4>
                            <div class="d-flex justify-content-between align-items-center">
                                <button onClick={() => setShowForm(true)} className="btn cdp-btn-secondary text-white ml-2">
                                    <i className="icon icon-plus pr-1"></i> Add New Request
                                </button>
                            </div>
                        </div>

                        <div>
                            <NavLink className="custom-tab px-3 py-3 cdp-border-primary" to="/business-partner/requests/vendors">General Vendors</NavLink>
                            <NavLink className="custom-tab px-3 py-3 cdp-border-primary" to="/business-partner/requests/wholesellers">Wholesellers</NavLink>
                        </div>

                        <div className="table-responsive shadow-sm mb-3">
                            <table className="table table-hover table-sm mb-0 cdp-table mb-2">
                                <thead className="cdp-table__header  cdp-bg-primary text-white">
                                    <tr>
                                        <th>First Name</th>
                                        <th>Last Name</th>
                                        <th>Purchasing Organization</th>
                                        <th>Company Code</th>
                                        <th>Email Address</th>
                                        <th>Procurement Contact</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        requests.map((item, index) =>
                                        (
                                            <tr key={index}>
                                                <td>{item.first_name}</td>
                                                <td>{item.last_name}</td>
                                                <td>{item.purchasing_organization}</td>
                                                <td>{item.company_code}</td>
                                                <td>{item.email}</td>
                                                <td>{item.procurement_contact}</td>
                                                <td><Dropdown className="ml-auto dropdown-customize">
                                                    <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle btn-sm py-0 px-1 dropdown-toggle ">
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu>
                                                        <Dropdown.Item> Send Form </Dropdown.Item>
                                                        <Dropdown.Item > Edit Request </Dropdown.Item>
                                                        <Dropdown.Item > Delete </Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown></td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>


                    </div>
                </div>
            </div>
        </main >

    );
};

export default WholesellerBusinessPartnerManagement;

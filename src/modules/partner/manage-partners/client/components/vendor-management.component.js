import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Faq } from '../../../../platform';
import Modal from 'react-bootstrap/Modal';
import Dropdown from 'react-bootstrap/Dropdown';

const VendorManagement = () => {
    const [showFaq, setShowFaq] = useState(false);
    const handleCloseFaq = () => setShowFaq(false);
    const handleShowFaq = () => setShowFaq(true);
    const partnerList = [
        {
            oneKeyId: "WBE123456",
            uuid: "1_6566_767",
            first_name: "Daniel",
            last_name: "Martin",
            data_request: "approved",
            data_origin: "Intranet",
            language: "FR",
            streethouseNo: "9 Rue Haute",
            city: "Luxemburg",
            country: "Belgium"
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
                                <li className="breadcrumb-item active"><span>Business Partner lists</span></li>
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
                        <div className="d-sm-flex justify-content-between align-items-end mb-0 mt-4">
                            <div>
                                <h4 className="cdp-text-primary font-weight-bold mb-4">Business Partner Lists</h4>
                                <div>
                                    <NavLink className="custom-tab px-3 py-3 cdp-border-primary" to="/business-partner/vendor-management/vendors">Vendors</NavLink>
                                    <NavLink className="custom-tab px-3 py-3 cdp-border-primary" to="/business-partner/vendor-management/hcp">Health Care Professional</NavLink>
                                    <NavLink className="custom-tab px-3 py-3 cdp-border-primary" to="/business-partner/vendor-management/hco">Health Care Organizations</NavLink>
                                </div>
                            </div>

                        </div>

                        <div className="table-responsive shadow-sm mb-3">
                            <table className="table table-hover table-sm mb-0 cdp-table mb-2">
                                <thead className="cdp-table__header  cdp-bg-primary text-white">
                                    <tr>
                                        <th>OneKey Id</th>
                                        <th>UUID</th>
                                        <th>First Name</th>
                                        <th>Last Name</th>
                                        <th>Data Request</th>
                                        <th>Data Origin</th>
                                        <th>Language</th>
                                        <th>Street House No</th>
                                        <th>City</th>
                                        <th>Country</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        partnerList.map((item, index) =>
                                        (
                                            <tr key={index}>
                                                <td>{item.oneKeyId}</td>
                                                <td>{item.uuid}</td>
                                                <td>{item.first_name}</td>
                                                <td>{item.last_name}</td>
                                                <td>{item.data_request}</td>
                                                <td>{item.data_origin}</td>
                                                <td>{item.language}</td>
                                                <td>{item.streethouseNo}</td>
                                                <td>{item.city}</td>
                                                <td>{item.country}</td>
                                                <td><Dropdown className="ml-auto dropdown-customize">
                                                    <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle btn-sm py-0 px-1 dropdown-toggle ">
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu>
                                                        <Dropdown.Item>Manage Status</Dropdown.Item>
                                                        <Dropdown.Item>Profile</Dropdown.Item>
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

export default VendorManagement;

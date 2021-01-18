import React, { useEffect, useState, useRef } from "react";
import { NavLink, useLocation, useHistory } from 'react-router-dom';
import { Faq } from '../../../../platform';
import Modal from 'react-bootstrap/Modal';
import Dropdown from 'react-bootstrap/Dropdown';
import { useSelector, useDispatch } from 'react-redux';
import { getHcpPartners, getHcoPartners, getVendorsPartners } from '../manage-partners.actions';

const VendorManagement = () => {

    const location = useLocation();
    const history = useHistory();
    const params = new URLSearchParams(window.location.search);
    const dispatch = useDispatch();

    const partnersData = useSelector(state => state.managePartnerReducer.partnersData);


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

    useEffect(() => {
        const partnerType = window.location.pathname.split("/").pop();
        if (partnerType === 'hcp') dispatch(getHcpPartners());
        if (partnerType === 'hco') dispatch(getHcoPartners());
        if (partnerType === 'vendors') dispatch(getVendorsPartners());

    }, [location]);

    useEffect(() => {
        console.log(partnersData);

    }, [partnersData]);

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
                                        partnersData.partners && partnersData.partners.length > 0 && partnersData.partners.map((item, index) =>
                                        (
                                            <tr key={index}>
                                                <td>--</td>
                                                <td>{item.uuid}</td>
                                                <td>{item.first_name}</td>
                                                <td>{item.last_name}</td>
                                                <td>{item.status}</td>
                                                <td>--</td>
                                                <td>--</td>
                                                <td>{item.address}</td>
                                                <td>{item.city}</td>
                                                <td>--</td>
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

                        {partnersData.partners && partnersData.partners.length === 0 &&
                            <div className="row justify-content-center mt-5 pt-5 mb-3">
                                <div className="col-12 col-sm-6 py-4 bg-white shadow-sm rounded text-center">
                                    <i class="icon icon-team icon-6x cdp-text-secondary"></i>
                                    <h3 className="font-weight-bold cdp-text-primary pt-4">No Partner Found!</h3>
                                </div>
                            </div>
                        }


                    </div>
                </div>
            </div>
        </main >

    );
};

export default VendorManagement;

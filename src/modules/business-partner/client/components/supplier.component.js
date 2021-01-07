import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import Dropdown from 'react-bootstrap/Dropdown';
import { useSelector, useDispatch } from 'react-redux';
import Faq from '../../../platform/faq/client/faq.component';
import { getPartnerRequests } from '../business-partner.actions';

const BusinessPartnerManagement = () => {
    const dispatch = useDispatch();
    const requests = useSelector(state => state.businessPartnerReducer.partnerRequests)
    // const requests = [{ firstName: 'Habibur', lastName: 'Rahman', status: 'new', companyCodes: ['501', 'c603', 'F145'], email: 'habiburrahman3089@gmail.com', procurementContact: 'habiburrahman3089@gmail.com'}];

    async function loadRequests() {
        dispatch(getPartnerRequests());
    }

    useEffect(() => {

        loadRequests();
    }, []);

    return (
        <main className="app__content cdp-light-bg h-100">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb rounded-0">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item active"><span>Business Partner Management</span></li>
                            </ol>
                        </nav>
                    </div>
                </div>



                <div className="row">
                    <div className="col-12">
                        <div className="d-sm-flex justify-content-between align-items-center mb-3 mt-4">
                            <h4 className="cdp-text-primary font-weight-bold mb-3 mb-sm-0">Overview of Business Partner Requests</h4>
                            <div class="d-flex justify-content-between align-items-center">
                                <NavLink to="/consent/create" className="btn cdp-btn-secondary text-white ml-2">
                                    <i className="icon icon-plus pr-1"></i> Add New Request
                                </NavLink>
                            </div>
                        </div>

                        {requests && requests.length > 0 &&
                            <div className="table-responsive shadow-sm bg-white">
                                <table className="table table-hover table-sm mb-0 cdp-table">
                                    <thead className="cdp-bg-primary text-white cdp-table__header">
                                        <tr>
                                            <th>Name</th>
                                            <th>Status</th>
                                            <th>Company Code</th>
                                            <th>Email Address</th>
                                            <th>Procurement Contact</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="cdp-table__body bg-white">
                                        {requests.map((row, index) => (
                                            <tr key={index}>
                                                <td>{`${row.first_name} ${row.last_name}`}</td>
                                                <td>{row.status}</td>
                                                <td>
                                                    {
                                                        row.company_codes.map((companyCode, idx) => (
                                                            <p key={idx}>{companyCode}</p>
                                                        ))
                                                    }
                                                </td>
                                                <td>{row.email}</td>
                                                <td>{row.procurement_contact}</td>
                                                <td><Dropdown className="ml-auto dropdown-customize">
                                                    <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle btn-sm py-0 px-1 dropdown-toggle ">
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu>
                                                        <Dropdown.Item> Send Form </Dropdown.Item>
                                                        <Dropdown.Item> Edit Request </Dropdown.Item>
                                                        <Dropdown.Item> Delete </Dropdown.Item>
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
            <div className="col-12 col-lg-4 col-xl-3 py-3 app__content-panel-right">
                <Faq />
            </div>
        </main>
    );
};

export default BusinessPartnerManagement;

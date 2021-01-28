import React, { useEffect, useState, useRef } from "react";
import { NavLink, useLocation, useHistory } from 'react-router-dom';
import { Faq } from '../../../../platform';
import Modal from 'react-bootstrap/Modal';
import Dropdown from 'react-bootstrap/Dropdown';
import { useSelector, useDispatch } from 'react-redux';
import { getHcpPartners, getHcoPartners, getVendorsPartners, getWholesalePartners } from '../manage-partners.actions';
import PartnerDetails from './partner-details.component';
import PartnerStatusManage from './partner-status-management.component';
import { getAllCountries } from '../../../../core/client/country/country.actions';

const PartnerManagement = () => {

    const [detailShow, setDetailShow] = useState(false);
    const [statusShow, setStatusShow] = useState(false);
    const [detailType, setDetailType] = useState(null);
    const location = useLocation();
    const history = useHistory();
    const params = new URLSearchParams(window.location.search);
    const dispatch = useDispatch();
    const [sort, setSort] = useState({ type: 'asc', value: null });
    const countries = useSelector(state => state.countryReducer.countries);

    const partnersData = useSelector(state => state.managePartnerReducer.partnersData);


    const [showFaq, setShowFaq] = useState(false);
    const handleCloseFaq = () => setShowFaq(false);
    const handleShowFaq = () => setShowFaq(true);
    const pageLeft = () => {
        if (partnersData.metadata.page > 1) urlChange(partnersData.metadata.page - 1, params.get('orderBy'), true);
    };

    const pageRight = () => {
        if (partnersData.metadata.end !== partnersData.metadata.total) urlChange(partnersData.metadata.page + 1, params.get('orderBy'), true);
    };

    const urlChange = (pageNo, orderColumn, pageChange = false) => {
        let orderType = params.get('orderType');
        const orderBy = params.get('orderBy');
        const page = pageNo ? pageNo : (params.get('page') ? params.get('page') : 1);

        if (!pageChange) {
            if (orderBy && !orderType) {
                orderType = 'asc'
            }

            (orderBy === orderColumn)
                ? (orderType === 'asc'
                    ? orderType = 'desc'
                    : orderType = 'asc')
                : orderType = 'asc';
        }

        const url = `?page=${page}`
            + (orderColumn && orderColumn !== 'null' ? `&orderBy=${orderColumn}` : '')
            + (orderColumn && orderType && orderType !== 'null' ? `&orderType=${orderType}` : '');

        history.push(location.pathname + url);
    }

    const exportApprovedList = () => {
        const partnerType = window.location.pathname.split('/').pop();

        const url = `/api/partners/export/${partnerType}`
        window.open(url, '_blank');
    };

    useEffect(() => {
        const partnerType = window.location.pathname.split("/").pop();
        if (partnerType === 'hcps') dispatch(getHcpPartners(location.search));
        if (partnerType === 'hcos') dispatch(getHcoPartners(location.search));
        if (partnerType === 'vendors') dispatch(getVendorsPartners(location.search));
        if (partnerType === 'wholesalers') dispatch(getWholesalePartners(location.search));
        setDetailType(partnerType);
        setSort({ type: params.get('orderType') || 'asc', value: params.get('orderBy') });
    }, [location]);

    useEffect(() => {
        dispatch(getAllCountries());

    }, []);

    return (
        <main className="app__content cdp-light-bg">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0">
                        <nav className="breadcrumb justify-content-between align-items-center" aria-label="breadcrumb">
                            <ol className="rounded-0 m-0 p-0 d-none d-sm-flex">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item"><NavLink to="/business-partner">Business Partner Management</NavLink></li>
                                <li className="breadcrumb-item active"><span>Business Partner lists</span></li>
                            </ol>
                            <Dropdown className="dropdown-customize breadcrumb__dropdown d-block d-sm-none ml-2">
                                <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle btn d-flex align-items-center border-0">
                                    <i className="fas fa-arrow-left mr-2"></i> Back
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item className="px-2" href="/"><i className="fas fa-link mr-2"></i> Dashboard</Dropdown.Item>
                                    <Dropdown.Item className="px-2" href="/business-partner"><i className="fas fa-link mr-2"></i> Business Partner Management</Dropdown.Item>
                                    <Dropdown.Item className="px-2" active><i className="fas fa-link mr-2"></i> Business Partner lists</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                            <span className="ml-auto mr-3"><i type="button" onClick={handleShowFaq} className="icon icon-help breadcrumb__faq-icon cdp-text-secondary"></i></span>
                        </nav>
                        <Modal show={showFaq} onHide={handleCloseFaq} size="lg" centered>
                            <Modal.Header closeButton>
                                <Modal.Title>Questions You May Have</Modal.Title>
                            </Modal.Header>
                            <Modal.Body className="faq__in-modal"><Faq topic="partner-management" /></Modal.Body>
                        </Modal>
                    </div>
                </div>

                <div className="row">
                    <div className="col-12">
                        <div className="d-sm-flex justify-content-between align-items-end mb-0 mt-4">
                            <div>
                                <h4 className="cdp-text-primary font-weight-bold mb-4">Business Partner Lists</h4>
                                <div>
                                    <NavLink className="custom-tab px-3 py-3 cdp-border-primary font-weight-normal" to="/business-partner/partner-management/hcps"><i className="fas fa-user-md fa-1_5x mr-2"></i>Health Care Professionals</NavLink>
                                    <NavLink className="custom-tab px-3 py-3 cdp-border-primary font-weight-normal" to="/business-partner/partner-management/hcos"><i className="fas fa-hospital fa-1_5x mr-2"></i>Health Care Organizations</NavLink>
                                    <NavLink className="custom-tab px-3 py-3 cdp-border-primary font-weight-normal" to="/business-partner/partner-management/vendors"><i className="fas fa-hospital-user fa-1_5x mr-2"></i>General Vendors</NavLink>
                                    <NavLink className="custom-tab px-3 py-3 cdp-border-primary font-weight-normal" to="/business-partner/partner-management/wholesalers"><i className="fas fa-dolly fa-1_5x mr-2"></i>Wholesalers</NavLink>
                                </div>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <button onClick={() => exportApprovedList()} className="btn cdp-btn-secondary text-white ml-2">
                                    Export Approved List for SAP
                                </button>
                            </div>
                        </div>

                        <div className="table-responsive shadow-sm mb-3">
                            {countries && countries.length > 0 && partnersData.partners && partnersData.partners.length > 0 &&
                                <table className="table table-hover table-sm mb-0 cdp-table mb-2">
                                    <thead className="cdp-table__header  cdp-bg-primary text-white">
                                        <tr>
                                            {(detailType === 'hcps' || detailType === 'hcos') && <th>OneKey Id</th>}
                                            {(detailType === 'hcps' || detailType === 'hcos') && <th>UUID</th>}
                                            {(detailType === 'hcps' || detailType === 'hcos') && <th><span className={sort.value === 'first_name' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : `cdp-table__col-sorting`} onClick={() => urlChange(1, 'first_name')}>First Name<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>}
                                            {(detailType === 'hcps' || detailType === 'hcos') && <th><span className={sort.value === 'last_name' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : `cdp-table__col-sorting`} onClick={() => urlChange(1, 'last_name')}>Last Name<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>}
                                            {(detailType === 'vendors' || detailType === 'wholesalers') && <th><span className={sort.value === 'name' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : `cdp-table__col-sorting`} onClick={() => urlChange(1, 'name')}>Name<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>}
                                            <th><span className={sort.value === 'locale' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : `cdp-table__col-sorting`} onClick={() => urlChange(1, 'locale')}>Locale<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>
                                            <th>Street House No</th>
                                            <th><span className={sort.value === 'city' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : `cdp-table__col-sorting`} onClick={() => urlChange(1, 'city')}>City<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>
                                            <th><span className={sort.value === 'country_iso2' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : `cdp-table__col-sorting`} onClick={() => urlChange(1, 'country_iso2')}>Country<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            partnersData.partners.map((item, index) =>
                                            (
                                                <tr key={index}>
                                                    {
                                                        (detailType === 'hcps' || detailType === 'hcos') &&
                                                        <td>{item.onekey_id || '--'}</td>
                                                    }
                                                    {
                                                        (detailType === 'hcps' || detailType === 'hcos') &&
                                                        <td>{item.uuid || '--'}</td>
                                                    }
                                                    { (detailType === 'hcps' || detailType === 'hcos') && <td> {item.first_name} </td>}
                                                    { (detailType === 'hcps' || detailType === 'hcos') && <td> {item.last_name} </td>}
                                                    { (detailType === 'vendors' || detailType === 'wholesalers') && <td> {item.name}</td>}
                                                    <td>{item.locale}</td>
                                                    <td>{item.address}</td>
                                                    <td>{item.city}</td>
                                                    <td>{(countries.find(i => i.country_iso2.toLowerCase() === item.country_iso2.toLowerCase())).countryname}</td>
                                                    <td><Dropdown className="ml-auto dropdown-customize">
                                                        <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle btn-sm py-0 px-1 dropdown-toggle ">
                                                        </Dropdown.Toggle>
                                                        <Dropdown.Menu>
                                                            {item.status === 'pending' &&
                                                                <>
                                                                    <Dropdown.Item onClick={() => setStatusShow(true)}>Manage Status</Dropdown.Item>
                                                                    <PartnerStatusManage partnerInfo={item} detailType={detailType} changeStatusShow={(val) => setStatusShow(val)} statusShow={statusShow}></PartnerStatusManage>
                                                                </>
                                                            }
                                                            <Dropdown.Item onClick={() => setDetailShow(true)}>Profile</Dropdown.Item>
                                                            <PartnerDetails countries={countries} detailId={item.id} detailType={detailType} changeDetailShow={(val) => setDetailShow(val)} detailShow={detailShow} />
                                                        </Dropdown.Menu>
                                                    </Dropdown></td>
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </table>
                            }
                        </div>
                        {
                            partnersData.metadata && ((partnersData.metadata.page === 1 &&
                                partnersData.metadata.total > partnersData.metadata.limit) ||
                                (partnersData.metadata.page > 1))
                            && partnersData['partners'] &&
                            <div className="pagination justify-content-end align-items-center border-top p-3">
                                <span className="cdp-text-primary font-weight-bold">{partnersData.metadata.start + ' - ' + partnersData.metadata.end}</span> <span className="text-muted pl-1 pr-2"> {' of ' + partnersData.metadata.total}</span>
                                <span className="pagination-btn" data-testid='Prev' onClick={() => pageLeft()} disabled={partnersData.metadata.page <= 1}><i className="icon icon-arrow-down ml-2 prev"></i></span>
                                <span className="pagination-btn" data-testid='Next' onClick={() => pageRight()} disabled={partnersData.metadata.end === partnersData.metadata.total}><i className="icon icon-arrow-down ml-2 next"></i></span>
                            </div>
                        }

                        {partnersData.partners && partnersData.partners.length === 0 &&
                            <div className="row justify-content-center mt-5 pt-5 mb-3">
                                <div className="col-12 col-sm-6 py-4 bg-white shadow-sm rounded text-center">
                                    <i className="icon icon-team icon-6x cdp-text-secondary"></i>
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

export default PartnerManagement;

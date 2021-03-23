import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Dropdown from 'react-bootstrap/Dropdown';
import Modal from 'react-bootstrap/Modal';

import Faq from '../../../../platform/faq/client/faq.component';
import { getCampaigns } from '../campaign.actions';


const CampaignsComponent = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const history = useHistory();

    const [showFaq, setShowFaq] = useState(false);
    const handleCloseFaq = () => setShowFaq(false);
    const handleShowFaq = () => setShowFaq(true);

    const campaignList = useSelector(state => state.campaignReducer.campaignList);

    const getFormattedDate = (dateString) => {
        const pad2 = (n) => (n < 10 ? '0' + n : n);

        var date = new Date(dateString);
        let monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const day = pad2(date.getDate());

        const monthIndex = date.getMonth();
        const monthName = monthNames[monthIndex];

        const year = date.getFullYear();

        return `${day} ${monthName} ${year}`;
    }

    const deleteCampaign = (campaign) => {
        alert(campaign.title);
    };

    const pageLeft = () => {
        if (campaignList.page > 1)
            urlChange(campaignList.page - 1);
    };

    const pageRight = () => {
        if (campaignList.end !== campaignList.total)
            urlChange(campaignList.page + 1);
    };

    const urlChange = (pageNo) => {
        const page = pageNo ? pageNo : (params.get('page') ? params.get('page') : 1);
        const search = new URLSearchParams();
        page && search.append('page', page);

        const url = location.pathname + search
            ? `?${search.toString()}`
            : '';

        history.push(url);
    };

    useEffect(() => {
        const searchObj = {};
        const searchParams = location.search.slice(1).split("&");

        searchParams.forEach(element => {
            searchObj[element.split("=")[0]] = element.split("=")[1];
        });

        dispatch(getCampaigns(searchObj.page));
    }, [location]);

    return (
        <main className="app__content cdp-light-bg h-100">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0">
                        <nav className="breadcrumb justify-content-between align-items-center" aria-label="breadcrumb">
                            <ol className="rounded-0 m-0 p-0 d-none d-sm-flex">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item"><NavLink to="/marketing">Marketing and Promotional</NavLink></li>
                                <li className="breadcrumb-item active"><span>Manage Mass Mailing</span></li>
                            </ol>
                            <Dropdown className="dropdown-customize breadcrumb__dropdown d-block d-sm-none ml-2">
                                <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle btn d-flex align-items-center border-0">
                                    <i className="fas fa-arrow-left mr-2"></i> Back
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item className="px-2" href="/"><i className="fas fa-link mr-2"></i> Dashboard</Dropdown.Item>
                                    <Dropdown.Item className="px-2" href="/marketing"><i className="fas fa-link mr-2"></i> Marketing and Promotional</Dropdown.Item>
                                    <Dropdown.Item className="px-2" active><i className="fas fa-link mr-2"></i> Manage Mass Mailing</Dropdown.Item>
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
                            <h4 className="cdp-text-primary font-weight-bold mb-0 mb-sm-0 d-flex align-items-end pr-2">List of Email Campaign</h4>
                            <div class="d-flex justify-content-between align-items-center">
                                <NavLink to="#" className="btn cdp-btn-secondary text-white ml-2">
                                    <i className="icon icon-plus"></i> <span className="d-none d-sm-inline-block pl-1">Create Email Campaign</span>
                                </NavLink>
                            </div>
                        </div>

                        {campaignList && campaignList.campaigns && campaignList.campaigns.length > 0 &&
                            <div className="table-responsive shadow-sm bg-white mb-3 cdp-table__responsive-wrapper">
                                <table className="table table-hover table-sm mb-0 cdp-table cdp-table__responsive">
                                    <thead className="cdp-bg-primary text-white cdp-table__header">
                                        <tr>
                                            <th>Campaign</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="cdp-table__body bg-white">
                                        {campaignList.campaigns.map((campaign, index) => (
                                            <tr key={index}>
                                                <td data-for="Title">
                                                    <b>{campaign.title}</b>
                                                    <br />
                                                    {getFormattedDate(campaign.sendTime)}
                                                    <br />
                                                    {campaign.previewText}
                                                </td>
                                                <td data-for="Action">
                                                    <a className="link-with-underline cursor-pointer" onClick={() => deleteCampaign(campaign)}>Delete</a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {((campaignList.page === 1 &&
                                    campaignList.total > campaignList.limit) ||
                                    (campaignList.page > 1))
                                    && campaignList.campaigns &&
                                    <div className="pagination justify-content-end align-items-center border-top p-3">
                                        <span className="cdp-text-primary font-weight-bold">{campaignList.start + ' - ' + campaignList.end}</span> <span className="text-muted pl-1 pr-2"> {' of ' + campaignList.total}</span>
                                        <span className="pagination-btn" onClick={() => pageLeft()} disabled={campaignList.page <= 1}><i className="icon icon-arrow-down ml-2 prev"></i></span>
                                        <span className="pagination-btn" onClick={() => pageRight()} disabled={campaignList.end === campaignList.total}><i className="icon icon-arrow-down ml-2 next"></i></span>
                                    </div>
                                }
                            </div>
                        }
                    </div>
                </div>
            </div>
        </main>
    );
}

export default CampaignsComponent;

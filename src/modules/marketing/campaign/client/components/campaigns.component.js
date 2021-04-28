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
    const [campaignToDelete, setCampaignToDelete] = useState(null);
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

    const deleteCampaign = () => {
        // to-do: call delete api
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
                                            <th width="8%">Campaign ID</th>
                                            <th width="15%">Title</th>
                                            <th width="15%">Subject of Campaign</th>
                                            <th width="20%">Preview Text</th>
                                            <th width="8%">Status</th>
                                            <th width="8%">Type</th>
                                            <th width="10%">Date</th>
                                            <th width="8%">Emails Sent</th>
                                            <th width="8%">Opening Rate</th>
                                            <th width="8%">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="cdp-table__body bg-white">
                                        {campaignList.campaigns.map((campaign, index) => (
                                            <tr key={index}>
                                                <td data-for="Id">{campaign.id}</td>
                                                <td data-for="Title">
                                                    {campaign.title}
                                                </td>
                                                <td data-for="Subject">
                                                    {campaign.subject}
                                                </td>
                                                <td data-for="PreviewText">
                                                    {campaign.previewText}
                                                </td>
                                                <td data-for="Status">
                                                    {campaign.status}
                                                </td>
                                                <td data-for="Type">
                                                    {campaign.type}
                                                </td>
                                                <td data-for="Date">
                                                    {getFormattedDate(campaign.sendTime)}
                                                </td>
                                                <td data-for="EmailsSent">
                                                    {campaign.emailsSent}
                                                </td>
                                                <td data-for="OpenRate">
                                                    {`${Number(campaign.open_rate).toFixed(2)}%`}
                                                </td>
                                                <td data-for="Action">
                                                    <a className="link-with-underline cursor-pointer" onClick={() => setCampaignToDelete(campaign)}>Delete</a>
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

                        <Modal
                            centered
                            show={!!campaignToDelete}
                            onHide={() => setCampaignToDelete(null)}>
                            <Modal.Header closeButton>
                                <Modal.Title className="modal-title_small">Delete Campaign</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <div>Are you sure you want to the Campaign <b>{campaignToDelete ? campaignToDelete.title : ''}?</b></div>
                            </Modal.Body>
                            <Modal.Footer>
                                <button className="btn cdp-btn-outline-primary" onClick={() => setCampaignToDelete(null)}>Cancel</button>
                                <button className="ml-2 btn cdp-btn-secondary text-white" onClick={() => deleteCampaign()}>Confirm</button>
                            </Modal.Footer>
                        </Modal>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default CampaignsComponent;

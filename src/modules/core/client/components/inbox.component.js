import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import StatusupdateModal from './statusUpdateModal.component';
import { Tabs, TabList, Tab, PanelList, Panel } from 'react-tabtab';
import { getHcpProfiles } from '../../../information/hcp/client/hcp.actions';
import { getPartnersToBeApproved } from '../../../partner/manage-partners/client/manage-partners.actions';
import PartnerStatusManage from '../../../partner/manage-partners/client/components/partner-status-management.component';

export default function Inbox() {
    const dispatch = useDispatch();
    const [show, setShow] = React.useState();
    const [showModal, setShowModal] = useState(false);
    const [modalId, setModalId] = useState(null);
    const [isUnauthorized, setIsUnauthorized] = useState(false);
    const [statusShow, setStatusShow] = useState(false);
    const [statusModalId, setStatusModalId] = useState(false);

    const filterSetting = {
        filters: [
            {
                name: '1',
                fieldName: 'status',
                operator: 'equal',
                displayText: 'Not Verified',
                value: ['not_verified']
            }
        ],
        logic: '1'
    }

    const getHcps = () => {
        const reqBody = {
            ...filterSetting,
            fields: ['id', 'first_name', 'last_name', 'email', 'created_at']
        };

        dispatch(getHcpProfiles('?limit=5', reqBody)).catch(err => {
            if (err.response.status === 403) {
                setIsUnauthorized(true);
            }
        });
    };

    let hcps = useSelector(state => state.hcpReducer.hcps);
    const partnersToBeApproved = useSelector(state => state.managePartnerReducer.partnersTobeApproved);
    const partners = partnersToBeApproved !== undefined ? partnersToBeApproved.partners : null;
    const totalPartners = partnersToBeApproved !== undefined ? partnersToBeApproved.totalPartners : null;

    useEffect(() => {
        getHcps();
        // dispatch(getPartnersToBeApproved('?status=not_approved&limit=5'));
    }, []);

    return (
        <div className={`shadow-sm bg-white mb-3 cdp-inbox ${show ? "cdp-inbox__expand" : ""}`}>
            <h5 className="p-3 cdp-text-primary font-weight-bold mb-0 d-flex justify-content-between cdp-inbox__header">
                CDP Queues / Tasks / Alerts
                <i onClick={() => setShow(true)} class="icon icon-expand cdp-inbox__icon-expand cdp-inbox__icon-toggle d-none d-lg-block cursor-pointer"></i>
                <i class="icon icon-minimize cdp-inbox__icon-minimize cdp-inbox__icon-toggle cursor-pointer" onClick={() => setShow(false)}></i>
                <i className="far fa-bell cdp-inbox__icon-bell d-block d-lg-none"></i>
            </h5>

            <div className="cdp-inbox__tab">
                <Tabs showArrowButton={true} showModalButton={false}>
                    <TabList>
                        <Tab>HCP Approval</Tab>
                        <Tab>Business Partner Approval</Tab>
                        <Tab>Email Campaign</Tab>
                        <Tab>Sample Request</Tab>
                        <Tab>Chatbot</Tab>
                    </TabList>

                    <PanelList>
                        <Panel>
                            {!isUnauthorized
                                ? <div className="cdp-inbox__tab-detail">
                                    {hcps.users !== undefined && hcps.users.length < 6 &&
                                        hcps.users.map((user, key) => <ul key={key} className="cdp-inbox__list p-0 m-0">
                                            <li key={key} className="cdp-inbox__list-item d-flex justify-content-between  align-items-center border-bottom p-2 p-lg-3">
                                                <span className="cdp-inbox__list-item-col large cdp-text-primary font-weight-bold text-break">{user.email}</span>
                                                <span className="cdp-inbox__list-item-col cdp-text-primary font-weight-bold px-3 text-break">{new Date(user.created_at).toLocaleDateString('en-GB', {
                                                    day: 'numeric', month: 'short', year: 'numeric'
                                                }).replace(/ /g, ' ')}</span>
                                                <span className="cdp-inbox__list-item-col small text-break">
                                                    <button className="btn cdp-btn-secondary btn-sm text-white" onClick={() => { setModalId(key); setShowModal(true) }}><i className="fas fa-user-edit d-block d-sm-none"></i><span className="d-none d-sm-inline-block">Update Status</span></button>
                                                </span>
                                            </li>
                                            {(showModal && modalId === key) && <StatusupdateModal user={user} show={showModal} onHide={() => { setShowModal(false) }} type={'inbox'} />}
                                        </ul>
                                        )}

                                    {hcps.users !== undefined && hcps.users.length !== 0 ?
                                        <Link to={{ pathname: "/information/list/cdp", state: { filterSetting } }} className="d-inline-block p-2 p-lg-3 text-uppercase cdp-text-secondary active small font-weight-bold">
                                            {hcps.total > 5 && 'More Pending'}
                                        </Link>
                                        : <h5 className="d-block py-5 px-2 text-uppercase text-center mb-0"><i className="far fa-clock mr-2 cdp-text-secondary"></i>No data found</h5>
                                    }
                                </div>
                                : <div className="cdp-inbox__tab-detail">
                                    <span className="d-block py-5 px-2 text-uppercase text-center mb-0"><i className="fas fa-ban mr-2 cdp-text-secondary"></i>You do not have permission to approve HCP users.</span>
                                </div>
                            }
                        </Panel>

                        <Panel>
                            {
                                <div className="cdp-inbox__tab-detail">
                                    {partners !== null && partners.length !== 0 ? partners.map((partner, key) => {
                                        return <ul key={key} className="cdp-inbox__list p-0 m-0">
                                            <li key={key} className="cdp-inbox__list-item d-flex justify-content-between  align-items-center border-bottom p-2 p-lg-3">
                                                <span className="cdp-inbox__list-item-col large cdp-text-primary font-weight-bold text-break">{partner.email}</span>
                                                <span className="cdp-inbox__list-item-col cdp-text-primary font-weight-bold px-3 text-break">{new Date(partner.created_at).toLocaleDateString('en-GB', {
                                                    day: 'numeric', month: 'short', year: 'numeric'
                                                }).replace(/ /g, ' ')}</span>
                                                <span className="cdp-inbox__list-item-col small text-break">
                                                    <button className="btn cdp-btn-secondary btn-sm text-white" onClick={() => { setStatusModalId(key); setStatusShow(true) }}><i className="fas fa-user-edit d-block d-sm-none"></i><span className="d-none d-sm-inline-block">Update Status</span></button>
                                                </span>
                                            </li>
                                            {(statusShow && statusModalId === key) && <PartnerStatusManage partnerInfo={partner} detailType={`${partner.entity_type}s`} changeStatusShow={(val) => setStatusShow(val)} statusShow={statusShow} from={'Inbox'}></PartnerStatusManage>}
                                        </ul>
                                    }

                                    ) : <h5 className="d-block py-5 px-2 text-uppercase text-center mb-0"><i className="far fa-clock mr-2 cdp-text-secondary"></i>No data found</h5>}

                                    {totalPartners > 5 &&
                                        <Link to={{ pathname: `/business-partner/partner-management/${partners[0].entity_type}s` }} className="d-inline-block p-2 p-lg-3 text-uppercase cdp-text-secondary active small font-weight-bold">
                                            More Pending
                                        </Link>
                                    }
                                </div>}
                        </Panel>
                        <Panel><div className="cdp-inbox__tab-detail"><h5 className="d-block py-5 px-2 text-uppercase text-center mb-0"><i className="far fa-clock mr-2 cdp-text-secondary"></i>No data found</h5></div></Panel>
                        <Panel><div className="cdp-inbox__tab-detail"><h5 className="d-block py-5 px-2 text-uppercase text-center mb-0"><i className="far fa-clock mr-2 cdp-text-secondary"></i>No data found</h5></div></Panel>
                        <Panel><div className="cdp-inbox__tab-detail"><h5 className="d-block py-5 px-2 text-uppercase text-center mb-0"><i className="far fa-clock mr-2 cdp-text-secondary"></i>No data found</h5></div></Panel>
                    </PanelList>
                </Tabs>
            </div>
        </div>
    );
}

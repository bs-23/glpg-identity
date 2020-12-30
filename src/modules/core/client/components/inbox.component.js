import React, { useEffect, useState } from "react";
import { Tabs, Tab } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getHcpProfiles } from '../../../information/hcp/client/hcp.actions';
import { isArray } from "lodash";
import StatusupdateModal from './statusUpdateModal.component';

export default function Inbox(){
  const dispatch = useDispatch();
  const [show, setShow] = React.useState();
  const [selectedTab, setSelectedTab] = useState('hcpaproval');
  const [showModal, setShowModal] = useState(false);
  const getHcps=()=>{
      dispatch(getHcpProfiles('?page=1&status=not_verified&limit=5'));
  }
  useEffect(() => {
    getHcps();
  }, []);
  const hcps = useSelector(state => state.hcpReducer.hcps);

  return(
      <div className={`shadow-sm bg-white mb-3 cdp-inbox ${show ? "cdp-inbox__expand" : ""}`}>
      <h5 className="p-3 cdp-text-primary font-weight-bold mb-0 d-flex justify-content-between cdp-inbox__header">
        CDP Queues / Tasks / Alerts
        <i onClick={() => setShow(true)} type="button" class="icon icon-expand cdp-inbox__icon-expand cdp-inbox__icon-toggle d-none d-lg-block"></i>
              <i class="icon icon-minimize cdp-inbox__icon-minimize cdp-inbox__icon-toggle" type="button" onClick={() => setShow(false)}></i>
              <i className="far fa-bell cdp-inbox__icon-bell d-block d-lg-none"></i>
      </h5>
      <div>
        <Tabs defaultActiveKey={selectedTab} className="cdp-inbox__tab px-2" onSelect={(activeKey, e) => setSelectedTab(activeKey)}>
          <Tab eventKey="hcpaproval" title="HCP Approval">
            <div className="cdp-inbox__tab-detail">
            {hcps.users !== undefined &&
                hcps.users.map((user, key) => <ul key ={key}  className="cdp-inbox__list p-0 m-0">
                    <li  className="cdp-inbox__list-item d-flex justify-content-between  align-items-center border-bottom py-3 px-3">
                      <span className="cdp-inbox__list-item-col large cdp-text-primary font-weight-bold">{user.email}</span>
                    <span className="cdp-inbox__list-item-col cdp-text-primary font-weight-bold px-3">{new Date(user.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    }).replace(/ /g, ' ')}</span>
                      <span className="cdp-inbox__list-item-col">
                      <button className="btn cdp-btn-secondary btn-sm text-white" onClick={() => { setShowModal(true)}}>Update Status</button>
                      </span>
                    </li>
                  {showModal && <StatusupdateModal user={user} show={showModal} onHide={() => { setShowModal(false)}}/>}
                  </ul>
                )
              }
            {hcps.users !== undefined && hcps.users.length !== 0 ?
                <NavLink to="/information/list?page=1&status=not_verified" className="d-inline-block p-3 text-uppercase cdp-text-secondary active small font-weight-bold">More Pending</NavLink>
                :
            <div className="d-inline-block p-3 text-uppercase cdp-text-secondary active small font-weight-bold">No Data Found</div>}
            </div>
          </Tab>
          <Tab eventKey="consent" title="Consent" disabled>
            <div className="cdp-inbox__tab-detail p-3">Coming soon...</div>
          </Tab>
          <Tab eventKey="emailcampaign" title="Email Campaign" disabled>
            <div className="cdp-inbox__tab-detail p-3">Coming soon...</div>
          </Tab>
          <Tab eventKey="samplerequest" title="Sample Request" disabled>
            <div className="cdp-inbox__tab-detail p-3">Coming soon...</div>
          </Tab>
          <Tab eventKey="chatbot" title="Chatbot" disabled>
            <div className="cdp-inbox__tab-detail p-3">Coming soon...</div>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}

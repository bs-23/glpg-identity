import React, { useEffect, useState } from "react";
import { Tabs, Tab } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getHcpProfiles } from '../../../information/hcp/client/hcp.actions'; 
import { isArray } from "lodash";


export default function Inbox() {
    const [show, setShow] = React.useState();
    const dispatch = useDispatch();
    const [selectedTab, setSelectedTab] = useState('hcpaproval');

    const getHcps = () => {
        dispatch(getHcpProfiles(1, 'not_verified'));
    };

    useEffect(() => {
    getHcps();
    }, []);
    const hcps = useSelector(state => state.hcpReducer.hcps);
    console.log("user Array:", hcps.users, "----", isArray(hcps.users));

  return(
      <div className={`shadow-sm bg-white mb-3 cdp-inbox ${show ? "cdp-inbox__expand" : ""}`}>
      <h5 className="p-3 cdp-text-primary font-weight-bold mb-0 d-flex justify-content-between cdp-inbox__header">
        CDP Queues / Tasks / Alerts
        <i onClick={() => setShow(true)} type="button" class="icon icon-expand cdp-inbox__icon-expand cdp-inbox__icon-toggle d-none d-lg-block"></i>
        <i class="icon icon-minimize cdp-inbox__icon-minimize cdp-inbox__icon-toggle" type="button" onClick={() => setShow(false)}></i>
        <i className="far fa-bell d-block d-lg-none cdp-inbox__icon-bell"></i>
      </h5>
      <div>
        <Tabs defaultActiveKey={selectedTab} className="cdp-inbox__tab px-2" onSelect={(activeKey, e) => setSelectedTab(activeKey)}>
          <Tab eventKey="hcpaproval" title="HCP Approval">
            <div className="cdp-inbox__tab-detail">
              {hcps.users !== undefined && 
                hcps.users.map(user => {
                  <ul className="cdp-inbox__list p-0 m-0">
                    <li className="cdp-inbox__list-item d-flex justify-content-between  align-items-center border-bottom py-3 px-3">
                      <span className="cdp-inbox__list-item-col large cdp-text-primary font-weight-bold">{user.email}</span>
                      <span className="cdp-inbox__list-item-col cdp-text-primary font-weight-bold px-3">{user.created_at}</span>
                      <span className="cdp-inbox__list-item-col">
                        <button className="btn cdp-btn-secondary btn-sm text-white">Update Status</button>
                      </span>
                    </li>
                  </ul>
                })
              }
              
              <NavLink to="/information/list" className="d-inline-block p-3 text-uppercase cdp-text-secondary active small font-weight-bold">
                More Pending
              </NavLink>
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

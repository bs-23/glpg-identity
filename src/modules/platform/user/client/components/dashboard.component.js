import React, { useEffect, useState } from "react";
import { NavLink } from 'react-router-dom';
import { Faq } from '../../../../platform';
import { Tabs, Tab } from 'react-bootstrap';

export default function Dashboard() {
    const [selectedTab, setSelectedTab] = useState('hcpaproval');

    return (
        <main className="app__content cdp-light-bg">
            <div className="container-fluid">
                <div className="row h-100">
                    <div className="col-12 col-lg-7 col-xl-8 py-3">
                        <div className="service">
                            <h4 className="service__header font-weight-bold pt-3 pb-4">
                                Category of Services
                            </h4>
                            <div>
                                <ul className="d-flex flex-wrap list-unstyled service__list">
                                    <li className="pr-sm-4 pb-4 service__item">
                                        <NavLink to="/information" className="d-block py-5 px-3 service__link">
                                            <i className="icon icon-information-management d-block service__icon"></i>
                                            Information Management
                                        </NavLink>
                                    </li>
                                    <li className="pr-sm-4 pb-4 service__item">
                                        <NavLink to="/platform" className="d-block py-5 px-3 service__link">
                                            <i className="icon icon-customer-data-platform d-block service__icon"></i>
                                          Management of Customer Data Platform
                                        </NavLink>
                                    </li>
                                    <li className="pr-sm-4 pb-4 service__item">
                                        <NavLink to="/consent" className="d-block py-5 px-3 service__link">
                                            <i className="icon icon-data-consent-management d-block service__icon"></i>
                                            Data Privacy & Consent Management
                                        </NavLink>
                                    </li>
                                    <li className="pr-sm-4 pb-4 service__item">
                                        <NavLink to="/" className="d-block py-5 px-3 service__link disabled">
                                            <i className="icon icon-marketing-promotion d-block service__icon"></i>
                                            Marketing and Promotional
                                        </NavLink>
                                    </li>
                                    <li className="pr-sm-4 pb-4 service__item">
                                        <NavLink to="/" className="d-block py-5 px-3 service__link disabled">
                                            <i className="icon icon-market-research d-block service__icon"></i>
                                           Market Research
                                        </NavLink>
                                    </li>
                                    <li className="pr-sm-4 pb-4 service__item">
                                        <NavLink to="/" className="d-block py-5 px-3 service__link disabled">
                                            <i className="icon icon-infield-team d-block service__icon"></i>
                                            InField-Team Effectiveness
                                        </NavLink>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-lg-5 col-xl-4 py-3 app__content-panel-right">
                        <div className="shadow-sm bg-white mb-3 cdp-inbox">
                            <h5 className="p-3 cdp-text-primary font-weight-bold mb-0 d-flex justify-content-between cdp-inbox__header">
                               CDP Queues / Tasks / Alerts
                                <i onClick={() => setShow(true)} type="button" class="icon icon-expand faq-icon-expand faq__icon-toggle d-none d-lg-block"></i>
                                <i class="icon icon-minimize faq-icon-minimize  d-none faq__icon-toggle" type="button" onClick={() => setShow(false)}></i>
                                <i className="icon icon-help faq__icon-help d-block d-lg-none"></i>
                            </h5>
                            <div>
                                <Tabs defaultActiveKey={selectedTab} className="cdp-inbox__tab px-2" onSelect={(activeKey, e) => setSelectedTab(activeKey)}>
                                    <Tab eventKey="hcpaproval" title="HCP Approval">
                                        <div className="cdp-inbox__tab-detail">
                                            <ul className="cdp-inbox__list p-0 m-0">
                                                <li className="cdp-inbox__list-item d-flex justify-content-between align-items-center border-bottom py-3 px-3">
                                                    <span className="cdp-inbox__list-item-col large cdp-text-primary font-weight-bold">xavier.bergnaum@delfina.info</span>
                                                    <span className="cdp-inbox__list-item-col cdp-text-primary font-weight-bold px-3">25 Jun 2020</span>
                                                    <span className="cdp-inbox__list-item-col">
                                                        <button className="btn cdp-btn-secondary btn-sm text-white">Update Status</button>
                                                    </span>
                                                </li>
                                                <li className="cdp-inbox__list-item d-flex justify-content-between align-items-center border-bottom py-3 px-3">
                                                    <span className="cdp-inbox__list-item-col large cdp-text-primary font-weight-bold">xavier.bergnaum@delfina.info</span>
                                                    <span className="cdp-inbox__list-item-col cdp-text-primary font-weight-bold px-3">25 Jun 2020</span>
                                                    <span className="cdp-inbox__list-item-col">
                                                        <button className="btn cdp-btn-secondary btn-sm text-white">Update Status</button>
                                                    </span>
                                                </li>
                                                <li className="cdp-inbox__list-item d-flex justify-content-between align-items-center border-bottom py-3 px-3">
                                                    <span className="cdp-inbox__list-item-col large cdp-text-primary font-weight-bold">xavier.bergnaum@delfina.info</span>
                                                    <span className="cdp-inbox__list-item-col cdp-text-primary font-weight-bold px-3">25 Jun 2020</span>
                                                    <span className="cdp-inbox__list-item-col">
                                                        <button className="btn cdp-btn-secondary btn-sm text-white">Update Status</button>
                                                    </span>
                                                </li>
                                                <li className="cdp-inbox__list-item d-flex justify-content-between align-items-center border-bottom py-3 px-3">
                                                    <span className="cdp-inbox__list-item-col large cdp-text-primary font-weight-bold">xavier.bergnaum@delfina.info</span>
                                                    <span className="cdp-inbox__list-item-col cdp-text-primary font-weight-bold px-3">25 Jun 2020</span>
                                                    <span className="cdp-inbox__list-item-col">
                                                        <button className="btn cdp-btn-secondary btn-sm text-white">Update Status</button>
                                                    </span>
                                                </li>
                                            </ul>
                                            <NavLink to="#" className="d-inline-block p-3 text-uppercase cdp-text-secondary active small font-weight-bold">
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
                        <Faq topic="general-information" />
                    </div>
                </div>
            </div>
        </main>
    );
}

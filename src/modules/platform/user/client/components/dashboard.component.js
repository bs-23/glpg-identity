import React from "react";
import { NavLink } from 'react-router-dom';
import { Faq } from '../../../../platform';
import Inbox from '../../../../core/client/components/inbox.component';
export default function Dashboard() {
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
                                            <i className="icon icon-partner d-block service__icon"></i>
                                            Business Partner Management
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
                                    <li className="pr-sm-4 pb-4 service__item">
                                        <NavLink to="/clinical-trials" className="d-block py-5 px-3 service__link">
                                            <i className="icon icon-ct-management d-block service__icon"></i>
                                            Clinical Trials
                                        </NavLink>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                   <div className="col-12 col-lg-5 col-xl-4 py-3 app__content-panel-right">
                      <Inbox />
                        <Faq topic="general-information" />
                    </div>
                </div>
            </div>
        </main>
    );
}

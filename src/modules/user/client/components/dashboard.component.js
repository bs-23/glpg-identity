import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import Faq from '../../../platform/faq/client/faq.component';
import { useSelector, useDispatch } from 'react-redux';
import { getFaqItems } from '../../../platform/faq/client/faq.actions';

export default function Dashboard() {
    const faqData = useSelector(state => state.faqReducer.faq_items);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getFaqItems(1, 'information', null, null, 5));
    }, []);

    return (
        <main className="app__content cdp-light-bg">
            <div className="container-fluid">
                <div className="row h-100">
                    <div className="col-12 col-lg-8 col-xl-9 py-3">
                        <div className="service">
                            <h4 className="service__header font-weight-bold pt-3 pb-4">
                                Category of Services
                            </h4>
                            <div>
                                <ul className="d-flex flex-wrap list-unstyled service__list">
                                    <li className="pr-sm-4 pb-4 service__item">
                                        <NavLink to="/hcps" className="d-block py-5 px-3 service__link">
                                            <i className="icon icon-information-management d-block service__icon"></i>
                                            Information Management
                                        </NavLink>
                                    </li>
                                    <li className="pr-sm-4 pb-4 service__item">
                                        <NavLink to="/users" className="d-block py-5 px-3 service__link">
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
                    <div className="col-12 col-lg-4 col-xl-3 py-3 app__content-panel-right">
                        <Faq category={faqData.faq} />
                    </div>
                </div>
            </div>
        </main>
    );
}

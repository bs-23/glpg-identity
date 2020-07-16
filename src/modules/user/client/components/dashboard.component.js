import React from 'react';
import { NavLink } from 'react-router-dom';
import Faq from '../../../shared/client/components/faq.component';

export default function Dashboard() {
    return (
        <main className="app__content cdp-light-bg">
            <div className="container-fluid">
                <div className="row h-100">
                    <div className="col-12 col-sm-8 col-xl-9 py-3">
                        <div className="service">
                            <h4 className="service__header font-weight-bold pt-3 pb-4">
                                Category of Services
                            </h4>
                            <div>
                                <ul className="row list-unstyled service__list">
                                    <li className="col-12 col-sm-4 col-xl-2 mb-4 service__item">
                                        <NavLink to="/hcps" className="d-block py-5 px-3 service__link">
                                            <i className="icon icon-information-management d-block service__icon"></i>
                                            Information Management
                                        </NavLink>
                                    </li>
                                    <li className="col-12 col-sm-4 col-xl-2 mb-4 service__item">
                                        <NavLink to="" className="d-block py-5 px-3 service__link disabled">
                                            <i className="icon icon-marketing-promotion-management d-block service__icon"></i>
                                            Consent Management
                                        </NavLink>
                                    </li>
                                    <li className="col-12 col-sm-4 col-xl-2 mb-4 service__item">
                                        <NavLink to="/users" className="d-block py-5 px-3 service__link">
                                            <i className="icon icon-user-management d-block service__icon"></i>
                                            User Management
                                        </NavLink>
                                    </li>
                                    <li className="col-12 col-sm-4 col-xl-2 mb-4 service__item">
                                        <NavLink to="/" className="d-block py-5 px-3 service__link disabled">
                                            <i className="icon icon-sample-request-management d-block service__icon"></i>
                                            Sample Request Management
                                        </NavLink>
                                    </li>
                                    <li className="col-12 col-sm-4 col-xl-2 mb-4 service__item">
                                        <NavLink to="" className="d-block py-5 px-3 service__link disabled">
                                            <i className="icon icon-tag-persona-management d-block service__icon"></i>
                                            Tag & Persona Management
                                        </NavLink>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-sm-4 col-xl-3 py-3">
                        <Faq/>
                    </div>
                </div>
            </div>
        </main>
    );
}

import React from 'react';
import { NavLink } from 'react-router-dom';
import Faq from '../../../shared/client/components/faq.component';

export default function Dashboard() {
    return (
        <main className="app__content cdp-light-bg">
            <div className="container-fluid">
                <div className="row h-100">
                    <div className="col-12 col-sm-8 col-md-9 py-3">
                        <div className="service">
                            <h4 className="service__header font-weight-bold py-3 pl-2">
                                Category of Services
                            </h4>
                            <div>
                                <ul className="row list-unstyled service__list">
                                    <li className="col-12 col-sm-4 col-md-2 service__item">
                                        <NavLink to="/hcps" className="d-block rounded py-5 px-3 service__link">
                                            Information Management
                                        </NavLink>
                                    </li>
                                    <li className="col-12 col-sm-4 col-md-2 service__item">
                                        <NavLink to="" className="d-block rounded py-5 px-3 service__link disabled">
                                            Marketing and Promotion Management
                                        </NavLink>
                                    </li>
                                    <li className="col-12 col-sm-4 col-md-2 service__item">
                                        <NavLink to="/users" className="d-block rounded py-5 px-3 service__link">
                                            User Management
                                        </NavLink>
                                    </li>
                                    <li className="col-12 col-sm-4 col-md-2 service__item">
                                        <NavLink to="/" className="d-block rounded py-5 px-3 service__link disabled">
                                            Sample Request Management
                                        </NavLink>
                                    </li>
                                    <li className="col-12 col-sm-4 col-md-2 service__item">
                                        <NavLink to="" className="d-block rounded py-5 px-3 service__link disabled">
                                            Tag & Persona Management
                                        </NavLink>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-sm-4 col-md-3 py-3">
                        <Faq/>
                    </div>
                </div>
            </div>
        </main>
    );
}

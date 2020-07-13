import React from 'react';
import { NavLink } from 'react-router-dom';
import Faq from '../../../shared/client/components/faq.component';

export default function Dashboard() {
    return (
        <main className="app__content">
            <div className="container-fluid">
                <div className="row h-100">
                    <div className="col-12 col-sm-8 col-md-8 py-3">
                        <h2 className="">
                           Category of Services
                        </h2>
                        <div>
                            <div className="d-flex flex-wrap">
                                <NavLink to="/hcps" className="p-5 border shadow-sm m-2 h4 pb-0 mb-0">
                                    Information Management
                                </NavLink>
                                <NavLink to="" className="p-5 border shadow-sm m-2 h4 pb-0 mb-0 text-muted text-decoration-none">
                                    Marketing & Promotion Management
                                </NavLink>
                                <NavLink to="/users" className="p-5 border shadow-sm m-2 h4 pb-0 mb-0">
                                    User Management
                                </NavLink>
                                <NavLink to="/" className="p-5 border shadow-sm m-2 h4 pb-0 mb-0 text-muted text-decoration-none">
                                    Sample Request Management
                                </NavLink>
                                <NavLink to="" className="p-5 border shadow-sm m-2 h4 pb-0 mb-0 text-muted text-decoration-none">
                                    Tag & Persona Management
                                </NavLink>

                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-sm-4 col-md-4 py-3">
                        <Faq/>
                    </div>
                </div>
            </div>
        </main>
    );
}

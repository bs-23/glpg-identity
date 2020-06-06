import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Dashboard() {
    return (
        <main>
            <div className="app__content">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-12 col-sm-8">
                            <h2 className="mt-5">
                                Dashboard {' '}
                            </h2>
                            <div>
                                <div className="d-flex flex-wrap">
                                    <NavLink to="/users" className="p-5 border shadow-sm m-2 h4 pb-0 mb-0">
                                        CDP Users
                                    </NavLink>
                                    <NavLink to="" className="p-5 border shadow-sm m-2 h4 pb-0 mb-0 text-muted text-decoration-none">
                                        Forms Management
                                    </NavLink>
                                    <NavLink to="" className="p-5 border shadow-sm m-2 h4 pb-0 mb-0 text-muted text-decoration-none">
                                        Tag and Persona Management
                                    </NavLink>
                                    <NavLink to="/hcps" className="p-5 border shadow-sm m-2 h4 pb-0 mb-0 text-decoration-none">
                                        HCP Profiles
                                    </NavLink>
                                    <NavLink to="" className="p-5 border shadow-sm m-2 h4 pb-0 mb-0 text-muted text-decoration-none">
                                        Campaign Management
                                    </NavLink>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 col-sm-4 bg-light p-3">
                            <h4>FAQ</h4>
                            <div className="list-group">
                                <div className="list-group-item  border-bottom border-top-0 border-left-0 border-right-0">
                                    <div className="d-flex w-100 justify-content-between">
                                        <h5 className="mb-1">FAQ question one</h5>
                                    </div>
                                    <p className="mb-1">Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget risus varius blandit.</p>
                                    <small>Donec id elit non mi porta.</small>
                                </div>
                                <div className="list-group-item  border-bottom border-top-0 border-left-0 border-right-0">
                                    <div className="d-flex w-100 justify-content-between">
                                        <h5 className="mb-1">FAQ question two</h5>
                                    </div>
                                    <p className="mb-1">Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget risus varius blandit.</p>
                                    <small>Donec id elit non mi porta.</small>
                                </div>
                                <div className="list-group-item  border-bottom border-top-0 border-left-0 border-right-0">
                                    <div className="d-flex w-100 justify-content-between">
                                        <h5 className="mb-1">FAQ question three</h5>
                                    </div>
                                    <p className="mb-1">Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget risus varius blandit.</p>
                                    <small>Donec id elit non mi porta.</small>
                                </div>
                                <div className="list-group-item  border-bottom border-top-0 border-left-0 border-right-0">
                                    <div className="d-flex w-100 justify-content-between">
                                        <h5 className="mb-1">FAQ question four</h5>
                                    </div>
                                    <p className="mb-1">Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget risus varius blandit.</p>
                                    <small>Donec id elit non mi porta.</small>
                                </div>
                                <div className="list-group-item  border-bottom border-0">
                                    <div className="d-flex w-100 justify-content-between">
                                        <h5 className="mb-1">FAQ question five</h5>
                                    </div>
                                    <p className="mb-1">Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget risus varius blandit.</p>
                                    <small>Donec id elit non mi porta.</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

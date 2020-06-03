import React from 'react';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';

import ChangePasswordFormComponent from './change-password-form.component';

export default function Dashboard() {
    const loggedInUser = useSelector(state => state.userReducer.loggedInUser);

    return (
        <main>
            <header className="app__header bg-success py-2">
                <div className="container-fluid">
                    <div className="row align-items-center">
                        <div className="col-12 col-sm-6">
                            <div className="d-flex">
                                <h1 className="mb-0 text-white mr-5">CDP</h1>
                            </div>
                        </div>
                        <div className="col-12 col-sm-6 text-right">
                            <h6 className="mr-3 mb-0 text-white d-inline-block">{loggedInUser.name}</h6><a className="btn btn-danger" href="/logout">Logout</a>
                        </div>
                    </div>
                </div>
            </header>
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
                                        User and Permission Service
                                    </NavLink>
                                    <NavLink to="" className="p-5 border shadow-sm m-2 h4 pb-0 mb-0 text-muted text-decoration-none">
                                        Form Data Service
                                    </NavLink>
                                    <NavLink to="" className="p-5 border shadow-sm m-2 h4 pb-0 mb-0 text-muted text-decoration-none">
                                        Tag and Persona Service
                                    </NavLink>
                                    <NavLink to="/hcp" className="p-5 border shadow-sm m-2 h4 pb-0 mb-0 text-decoration-none">
                                        HCP Service
                                    </NavLink>
                                    <NavLink to="" className="p-5 border shadow-sm m-2 h4 pb-0 mb-0 text-muted text-decoration-none">
                                        Campaign Service
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

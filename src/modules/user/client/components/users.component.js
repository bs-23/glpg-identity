import React from "react";
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import Dropdown from 'react-bootstrap/Dropdown';
import Breadcrumb from 'react-bootstrap/Breadcrumb';

export default function Users() {
    const loggedInUser = useSelector(state => state.userReducer.loggedInUser);
    return (
        <main>
            <header className="app__header bg-success py-2">
                <div className="container-fluid">
                    <div className="row align-items-center">
                        <div className="col-12 col-sm-6">
                            <div className="d-flex">
                                <h1 className="mb-0 text-white mr-5">CDP</h1>
                                <Dropdown>
                                    <Dropdown.Toggle variant="secondary" id="dropdown-basic" className="mt-2">
                                        Service
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item href="/users">User and Permission Service</Dropdown.Item>
                                        <Dropdown.Item href="#/action-2">Form Data Service</Dropdown.Item>
                                        <Dropdown.Item href="#/action-3">Tag and Persona Service</Dropdown.Item>
                                        <Dropdown.Item href="#/action-4">HCP Service</Dropdown.Item>
                                        <Dropdown.Item href="#/action-5">Campaign Service</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </div>
                        </div>
                        <div className="col-12 col-sm-6 text-right">
                            <h6 className="mr-3 mb-0 text-white d-inline-block">{loggedInUser.name}</h6><a className="btn btn-danger" href="/logout">Logout</a>
                        </div>
                    </div>
                </div>
            </header>
            <div className="app__content">
                <Breadcrumb>
                    <Breadcrumb.Item href="/">
                        Dashboard
                    </Breadcrumb.Item>
                    <Breadcrumb.Item active>User and Permission Service</Breadcrumb.Item>
                </Breadcrumb>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-12">
                            <div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <h2 className="">User list</h2>
                                    <NavLink to="/users/create" className="btn btn-primary ml-auto">
                                        Create new user
                                    </NavLink>
                                </div>
                                <table className="table">
                                    <thead className="table-secondary">
                                        <tr>
                                            <th scope="col">#</th>
                                            <th scope="col">First</th>
                                            <th scope="col">Last</th>
                                            <th scope="col">Handle</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <th scope="row">1</th>
                                            <td>Mark</td>
                                            <td>Otto</td>
                                            <td>@mdo</td>
                                        </tr>
                                        <tr>
                                            <th scope="row">2</th>
                                            <td>Jacob</td>
                                            <td>Thornton</td>
                                            <td>@fat</td>
                                        </tr>
                                        <tr>
                                            <th scope="row">3</th>
                                            <td>Larry</td>
                                            <td>the Bird</td>
                                            <td>@twitter</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        
                    </div>
                </div>
            </div>
        </main>
    );
}

import React from "react";
import { useSelector } from "react-redux";
import Dropdown from 'react-bootstrap/Dropdown';
import { LinkContainer } from 'react-router-bootstrap';

export default function Navbar() {
    const loggedInUser = useSelector(state => state.userReducer.loggedInUser);

    return (
        <header className="app__header bg-success py-2 shadow-sm">
            <div className="container-fluid">
                <div className="row align-items-center">
                    <div className="col-12 col-sm-6">
                        <div className="d-flex">
                            <h1 className="mb-0 text-white mr-5">CDP</h1>
                            <Dropdown>
                                <Dropdown.Toggle variant="secondary" className="mt-2">
                                    Service
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <LinkContainer to="hcps"><Dropdown.Item>Information Management</Dropdown.Item></LinkContainer>
                                    <LinkContainer to="#"><Dropdown.Item>Marketing & Promotion Management</Dropdown.Item></LinkContainer>
                                    <LinkContainer to="users"><Dropdown.Item>User Management</Dropdown.Item></LinkContainer>
                                    <LinkContainer to="#"><Dropdown.Item>Sample Request Management</Dropdown.Item></LinkContainer>
                                    <LinkContainer to="#"><Dropdown.Item>Tag & Persona Management</Dropdown.Item></LinkContainer>
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    </div>
                    <div className="col-12 col-sm-6 text-right">
                        <h6 className="mr-3 mb-0 text-white d-inline-block">{loggedInUser.name}</h6><a className="btn btn-danger" href="/api/logout">Logout</a>
                    </div>
                </div>
            </div>
        </header>
    );
}

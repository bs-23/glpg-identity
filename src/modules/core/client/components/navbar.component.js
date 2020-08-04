import React from "react";
import { useSelector } from "react-redux";


export default function Navbar() {
    const loggedInUser = useSelector(state => state.userReducer.loggedInUser);
    const { first_name, last_name } = loggedInUser;

    return (
        <header className="app__header py-1 shadow-sm">
            <div className="container-fluid">
                <div className="row align-items-center">
                    <div className="col-3">
                        <div className="d-flex">
                            <h1 className="text-center">
                                <a href="/"> <img alt="CDP LOGO" src="/assets/CDP.png" height="64" /></a>
                            </h1>
                            {/*<Dropdown>
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
                            </Dropdown>*/}
                        </div>
                    </div>
                    <div className="col-9 text-right">
                        <button className="mr-2 btn cdp-btn-secondary text-white"><i className="icon icon-user-round mr-1 app__header-icon-user d-none d-sm-inline-block"></i> <span className="">{first_name + " " + last_name}</span></button>
                        <a className="btn cdp-btn-outline-primary" href="/api/logout"><i className="icon icon-logout mr-1 app__header-icon-logout"></i>Sign Out</a>
                    </div>
                </div>
            </div>
        </header>
    );
}

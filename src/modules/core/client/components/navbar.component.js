import React from "react";
import { useSelector } from "react-redux";
import { useCookies } from 'react-cookie';
import Dropdown from 'react-bootstrap/Dropdown';

export default function Navbar() {
    const [cookies, setCookie, removeCookie] = useCookies();
    const loggedInUser = useSelector(state => state.userReducer.loggedInUser);
    const { first_name, last_name } = loggedInUser;

    const handleLogOut = () => {
        // alert('clicked auto');
        setCookie('logged_in', '', { path: '/' });
        removeCookie('logged_in');
    }

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
                        <div className="d-flex justify-content-end">
                            <Dropdown className="dropdown-customize">
                                <Dropdown.Toggle id="applications" className="btn cdp-btn-outline-gray cdp-text-primary mr-2 py-1 px-2 d-flex align-items-center">
                                    <i className="icon icon-applications mr-1 dropdown-customize__icon-with-bg"></i> Applications
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item href="#/action-1">Brand X</Dropdown.Item>
                                    <Dropdown.Item href="#/action-2">HCP Portal</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                            <Dropdown className="dropdown-customize">
                                <Dropdown.Toggle id="countries" className="btn cdp-btn-outline-gray cdp-text-primary mr-2  py-1 px-2 d-flex align-items-center">
                                    <i className="icon icon-europe-map mr-1 dropdown-customize__icon-with-bg"></i> Countries
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item href="#/action-1"><img height="26" width="26" src="/assets/flag/flag-netherlands.svg" alt="Flag" /> Netherlands</Dropdown.Item>
                                    <Dropdown.Item href="#/action-1"><img height="26" width="26" src="/assets/flag/flag-belgium.svg" alt="Flag" /> Belgium</Dropdown.Item>
                                    <Dropdown.Item href="#/action-1"><img height="26" width="26" src="/assets/flag/flag-france.svg" alt="Flag" /> France</Dropdown.Item>
                                    <Dropdown.Item href="#/action-1"><img height="26" width="26" src="/assets/flag/flag-Germany.svg" alt="Flag" /> Germany</Dropdown.Item>
                                    <Dropdown.Item href="#/action-1"><img height="26" width="26" src="/assets/flag/flag-uk.svg" alt="Flag" /> United Kingdom</Dropdown.Item>
                                    <Dropdown.Item href="#/action-1"><img height="26" width="26" src="/assets/flag/flag-spain.svg" alt="Flag" /> Spain</Dropdown.Item>
                                    <Dropdown.Item href="#/action-1"><img height="26" width="26" src="/assets/flag/flag-italy.svg" alt="Flag" /> Italy</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                            <button className="mr-2 btn cdp-btn-secondary text-white"><i className="icon icon-user-round mr-1 app__header-icon-user d-none d-sm-inline-block"></i> <span className="">{first_name + " " + last_name}</span></button>
                            <a className="btn cdp-btn-outline-primary d-flex align-items-center" onClick={handleLogOut} href="/api/logout"><i className="icon icon-logout mr-1 app__header-icon-logout"></i>Sign out</a>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

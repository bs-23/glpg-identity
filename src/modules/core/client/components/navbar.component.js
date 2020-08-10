import React from "react";
import { useSelector } from "react-redux";
import { useCookies } from 'react-cookie';
// import Dropdown from 'react-bootstrap/Dropdown';

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
                        <div className="d-block d-sm-flex justify-content-end align-items-center">
                            <div className="mb-2 mb-sm-0 d-flex justify-content-end align-items-center">
                                <div className="mr-3">
                                    <img src="https://cdp-asset.s3.eu-central-1.amazonaws.com/brandx_logo.png" title="Brand X" alt="Brand X Logo" width="122" />
                                </div>
                                <div className="mr-2">
                                    <img height="26" width="26" src="/assets/flag/flag-netherlands.svg" title="Netherlands" alt="Flag" className="ml-1" />
                                    <img height="26" width="26" src="/assets/flag/flag-belgium.svg" title="Belgium" alt="Flag" className="ml-1" />
                                    <img height="26" width="26" src="/assets/flag/flag-france.svg" title="France" alt="Flag" className="ml-1" />
                                </div>
                            </div>
                            <div className="mb-2 mb-sm-0 d-flex justify-content-end align-items-center">
                                <button className="mr-2 btn cdp-btn-secondary text-white"><i className="icon icon-user-round mr-1 app__header-icon-user d-none d-sm-inline-block"></i> <span className="">{first_name + " " + last_name}</span></button>
                                <a className="btn cdp-btn-outline-primary d-flex align-items-center" onClick={handleLogOut} href="/api/logout"><i className="icon icon-logout mr-1 app__header-icon-logout"></i>Sign out</a>    
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

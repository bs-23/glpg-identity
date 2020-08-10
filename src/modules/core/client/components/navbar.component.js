import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useCookies } from 'react-cookie';
import { getCountries } from '../../../user/client/user.actions'
// import Dropdown from 'react-bootstrap/Dropdown';

export default function Navbar() {
    const [, setCookie, removeCookie] = useCookies();
    const loggedInUser = useSelector(state => state.userReducer.loggedInUser);
    const countries = useSelector(state => state.userReducer.countries);
    const { first_name, last_name } = loggedInUser;
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(getCountries())
    }, [])

    const handleLogOut = () => {
        // alert('clicked auto');
        setCookie('logged_in', '', { path: '/' });
        removeCookie('logged_in');
    }

    const generateCountryIconPath = (country) => {
        if(country) return `/assets/flag/flag-${country.toLowerCase().replace(/ /g, "-")}.svg`
        return `/assets/flag/flag-placeholder.svg`
    }

    const renderCountryIcons = () => {
        if(loggedInUser.countries){
            return loggedInUser.countries.map(country_iso2 => {
                const country = countries && countries.find(country => country.country_iso2 === country_iso2)
                return <img key={country_iso2} height="26" width="26" src={generateCountryIconPath(country && country.countryname)} title={country ? country.countryname : country_iso2 } alt="Flag" className="ml-1" />
            })
        }
    }

    const renderApplicationIcon = () => {
        if(loggedInUser.application){
            const { name, logo_link } = loggedInUser.application
            return <img src={logo_link} title={name} alt={`${name} Logo`} width="122" />
        }
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
                            {loggedInUser.type !== 'admin' && <div className="mb-2 mb-sm-0 d-flex justify-content-end align-items-center">
                                <div className="mr-3">
                                    {renderApplicationIcon()}
                                </div>
                                <div className="mr-2">
                                    {renderCountryIcons()}
                                </div>
                            </div>}
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

import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useCookies } from 'react-cookie';
import { getCountries } from '../../../user/client/user.actions'
import { useHistory } from "react-router-dom";
// import Dropdown from 'react-bootstrap/Dropdown';

export default function Navbar() {
    const [, setCookie, removeCookie] = useCookies();
    const loggedInUser = useSelector(state => state.userReducer.loggedInUser);
    const countries = useSelector(state => state.userReducer.countries);
    const { first_name, last_name } = loggedInUser;
    const dispatch = useDispatch()
    const history = useHistory();

    useEffect(() => {
        dispatch(getCountries())
    }, [])

    const handleLogOut = () => {
        // alert('clicked auto');
        setCookie('logged_in', '', { path: '/' });
        removeCookie('logged_in');

        // localStorage.removeItem('logged_in');
    }

    const addFallbackIcon = (e) => {
        e.target.src = '/assets/flag/flag-placeholder.svg';
    }

    const generateCountryIconPath = (country) => {
        if(country) return `/assets/flag/flag-${country.toLowerCase().replace(/ /g, "-")}.svg`;
        return `/assets/flag/flag-placeholder.svg`;
    }

    const renderCountryIcons = () => {
        if(loggedInUser.countries){
            const selectedCountries = countries && countries.filter(c => loggedInUser.countries.includes(c.country_iso2) ? true : false).map(c => c.codbase_desc)
            return selectedCountries.map( country => {
                return <img key={country} height="26" width="26" src={generateCountryIconPath(country)} onError={addFallbackIcon} title={country} alt="Flag" className="ml-1" />;
            })
        }
    }

    const renderApplicationIcon = () => {
        if(loggedInUser.application){
            const { name, logo_link } = loggedInUser.application
            return <img src={logo_link} title={name} alt={`${name} Logo`} width="122" />
        }
    }

    const myProfileClickHandler = () => {
        history.push('/users/my-profile');
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
                                <button className="mr-2 btn cdp-btn-secondary text-white" onClick={myProfileClickHandler}><i className="icon icon-user-round mr-1 app__header-icon-user d-none d-sm-inline-block"></i> <span className="">{first_name + " " + last_name}</span></button>
                                <a className="btn cdp-btn-outline-primary d-flex align-items-center" onClick={handleLogOut} href="/api/logout"><i className="icon icon-logout mr-1 app__header-icon-logout"></i>Sign out</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

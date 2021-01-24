import _ from 'lodash';
import React from 'react';
import { useSelector } from 'react-redux';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import { Navbar } from 'react-bootstrap';

export default function Navigationbar() {
    const [, setCookie, removeCookie] = useCookies();
    const loggedInUser = useSelector(state => state.userReducer.loggedInUser);
    const countries = useSelector(state => state.countryReducer.countries);
    const history = useHistory();

    const { first_name, last_name, applications: userApplications, countries: userCountries } = loggedInUser;

    const handleLogOut = () => {
        setCookie('logged_in', '', { path: '/' });
        removeCookie('logged_in');
    };

    const addFallbackIcon = (e) => {
        e.target.src = '/assets/flag/flag-placeholder.svg';
    };

    const generateCountryIconPath = (country) => {
        if(country) return `/assets/flag/flag-${country.toLowerCase().replace(/ /g, "-")}.svg`;
        return `/assets/flag/flag-placeholder.svg`;
    };

    const renderCountryIcons = () => {
        if(userCountries) {
            const selectedCountries = countries && countries.filter(c => userCountries.includes(c.country_iso2) ? true : false).map(c => c.codbase_desc);
            return selectedCountries.map( country => {
                return <img key={country} height="26" width="26" src={generateCountryIconPath(country)} onError={addFallbackIcon} title={country} alt="Flag" className="ml-1" />;
            })
        }
    };

    const renderApplicationIcon = () => {
        if(userApplications) {
            return userApplications.map(app => {
                const { name, logo_link, slug } = app;
                return <img className="ml-2" key={slug} src={logo_link} title={name} alt={`${name} Logo`} width="122" />
            })
        }
    };

    const myProfileClickHandler = () => {
        history.push('/my-profile');
    };

    return (
        <header className="app__header py-1 shadow-sm">
            <div className="container-fluid">
                <div className="row align-items-center d-none d-sm-flex">
                    <div className="col-3">
                        <div className="d-flex">
                            <h1 className="text-center">
                                <a href="/"> <img alt="CDP LOGO" src="/assets/CDP.png" height="64" /></a>
                            </h1>
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
                                <button className="mr-2 btn cdp-btn-secondary text-white my-profile__btn" onClick={myProfileClickHandler}><i className="icon icon-user-round mr-1 app__header-icon-user "></i> <span className="d-none d-lg-inline-block">{first_name + " " + last_name}</span></button>
                                <a className="btn cdp-btn-outline-primary d-flex align-items-center" title="Sign out" onClick={handleLogOut} href="/api/logout"><i className="icon icon-logout mr-1 app__header-icon-logout"></i> <span className="d-none d-lg-inline-block">Sign out</span></a>
                            </div>
                        </div>
                    </div>
                </div>
                <Navbar collapseOnSelect expand={false} className="d-flex p-0 d-sm-none">
                    <Navbar.Brand>
                        <h1 className="text-center">
                            <a href="/"> <img alt="CDP LOGO" src="/assets/CDP.png" height="50" /></a>
                        </h1>
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="responsive-navbar-nav"><i className="fas fa-bars py-1 cdp-text-primary"></i></Navbar.Toggle>
                    <Navbar.Collapse id="responsive-navbar-nav" className="cdp-light-bg">
                        <div className="text-right">
                            <Navbar.Toggle className="in-submenu m-2" aria-controls="responsive-navbar-nav">
                                <i className="fas fa-times cdp-text-secondary fa-2x"></i>
                            </Navbar.Toggle>
                        </div>
                        { loggedInUser.type !== 'admin' && <div>
                            {userApplications.length > 0 && <div className="px-3 border-bottom pb-2 mb-2">
                                <label className="d-block">Application</label>
                                {renderApplicationIcon()}
                            </div>}
                            {userCountries.length > 0 && <div className="px-3 border-bottom pb-2 mb-2">
                                <label className="d-block">Countries</label>
                                {renderCountryIcons()}
                            </div>}
                        </div>}
                        <div className="border-bottom mb-2">
                            <a className="d-flex align-items-center py-2 px-3" onClick={myProfileClickHandler}><i className="icon icon-user-round mr-2 app__header-icon-user "></i> {first_name + " " + last_name}</a>
                        </div>
                        <div>
                            <a className="d-flex align-items-center py-2 px-3" onClick={handleLogOut} href="/api/logout"><i className="icon icon-logout mr-2 app__header-icon-logout"></i> Sign out</a>
                        </div>
                    </Navbar.Collapse>
                </Navbar>
            </div>
        </header>
    );
}

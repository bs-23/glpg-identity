import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useCookies } from 'react-cookie';
import _ from 'lodash';
import { getCountries } from '../../../user/client/user.actions'

export default function Navbar() {
    const [, setCookie, removeCookie] = useCookies();
    const loggedInUser = useSelector(state => state.userReducer.loggedInUser);
    const countries = useSelector(state => state.userReducer.countries);
    const { first_name, last_name } = loggedInUser;
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(getCountries());
    }, []);

    const handleLogOut = () => {
        setCookie('logged_in', '', { path: '/' });
        removeCookie('logged_in');
    }

    const addFallbackIcon = (e) => {
        e.target.src = '/assets/flag/flag-placeholder.svg';
    }

    const generateCountryIconPath = (country) => {
        if(country) return `/assets/flag/flag-${country.toLowerCase().replace(/ /g, "-")}.svg`;
        return `/assets/flag/flag-placeholder.svg`;
    }

    const extractUserCountriesAndApplications = (data) => {
        const safeGet = (object, property) => {
            const propData = (object || {})[property];
            return (prop) => prop ? safeGet(propData, prop) : propData;
        };

        const flatten = (array) => {
            return Array.isArray(array) ? [].concat(...array.map(flatten)) : array;
        }

        const union = (a, b) => [...new Set([...a, ...b])];

        const profile_permission_sets = safeGet(data, 'profile')('permissionSets')();
        const profile_countries = profile_permission_sets ? profile_permission_sets.map(pps => safeGet(pps, 'countries')() || []) : [];
        const profile_applications = profile_permission_sets ? profile_permission_sets.map(pps => pps.application || []) : [];

        const userRoles = safeGet(data, 'role')();
        const roles_countries = userRoles ? userRoles.map(role => {
            const role_permission_sets = safeGet(role, 'permissionSets')();
            return role_permission_sets.map(rps => safeGet(rps, 'countries')() || []);
        }) : [];
        const roles_applications = userRoles ? userRoles.map(role => {
            const role_permission_sets = safeGet(role, 'permissionSets')();
            return role_permission_sets.map(rps => safeGet(rps, 'application')() || []);
        }) : [];

        const userCountries = union(flatten(profile_countries), flatten(roles_countries));
        const userFlattenedApplications = [...flatten(profile_applications), ...flatten(roles_applications)];
        const userDistinctApplications = _.uniqWith(userFlattenedApplications, function(arrVal, othVal) {
            return arrVal.slug === othVal.slug;
        });

        return [userCountries, userDistinctApplications];
    }

    const renderCountryIcons = (userCountriesCode) => {
        if(userCountriesCode){
            const selectedCountries = countries && countries.filter(c => userCountriesCode.includes(c.country_iso2) ? true : false).map(c => c.codbase_desc)
            return selectedCountries.map( country => {
                return <img key={country} height="26" width="26" src={generateCountryIconPath(country)} onError={addFallbackIcon} title={country} alt="Flag" className="ml-1" />;
            })
        }
    }

    const renderApplicationIcon = (applications) => {
        if(applications){
            return applications.map(app => {
                const { name, logo_link, slug } = app;
                return <img className="ml-2" key={slug} src={logo_link} title={name} alt={`${name} Logo`} width="122" />
            })
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
                                    {renderApplicationIcon(extractUserCountriesAndApplications(loggedInUser)[1])}
                                </div>
                                <div className="mr-2">
                                    {renderCountryIcons(extractUserCountriesAndApplications(loggedInUser)[0])}
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

import axios from 'axios';
import { NavLink } from 'react-router-dom';
import Dropdown from 'react-bootstrap/Dropdown';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { LinkContainer } from 'react-router-bootstrap';
import { getUsers, cdpSort } from '../user.actions';


const safeGet = (object, property) => {
    const propData = (object || {})[property];
    return (prop) => prop ? safeGet(propData, prop) : propData;
};

const flatten = (array) => {
    return Array.isArray(array) ? [].concat(...array.map(flatten)) : array;
}

const union = (a, b) => [...new Set([...a, ...b])];


export default function Users() {
    const dispatch = useDispatch();

    const userdata = useSelector(state => state.userReducer.users);

    const [countries, setCountries] = useState([]);
    const [userCountries, setUserCountries] = useState([]);

    const params = new URLSearchParams(window.location.search);
    const [sort, setSort] = useState({ type: 'ASC', value: null });

    const getUserList = (page = params.get('page') ? params.get('page') : 1,
        codbase = params.get('codbase') ? params.get('codbase') : null) => {
        dispatch(getUsers(page, codbase));
    };

    const extractUserCountries = (data) => {
        const profile_permission_sets = safeGet(data, 'userProfile')('up_ps')();
        const profile_countries = profile_permission_sets ? profile_permission_sets.map(pps => safeGet(pps, 'ps')('countries')()) : [];

        const userRoles = safeGet(data, 'userRoles')();
        const roles_countries = userRoles ? userRoles.map(role => {
            const role_permission_sets = safeGet(role, 'role')('role_ps')();
            return role_permission_sets.map(rps => safeGet(rps, 'ps')('countries')());
        }) : [];

        const userCountries = union(flatten(profile_countries), flatten(roles_countries)).filter(e => e);

        return userCountries;
    }

    const extractLoggedInUserCountries = (data) => {
        const profile_permission_sets = safeGet(data, 'profile')('permissionSets')();
        const profile_countries = profile_permission_sets ? profile_permission_sets.map(pps => safeGet(pps, 'countries')() || []) : [];

        const userRoles = safeGet(data, 'role')();
        const roles_countries = userRoles ? userRoles.map(role => {
            const role_permission_sets = safeGet(role, 'permissionSets')();
            return role_permission_sets.map(rps => safeGet(rps, 'countries')() || []);
        }) : [];

        const userCountries = union(flatten(profile_countries), flatten(roles_countries)).filter(e => e);

        return userCountries;
    }

    const sortCountries = (userCountries) => {
        let countryArr = [];
        let countryString = "";
        if (countries.length > 0 && (userCountries.length)) {
            if(userCountries.length > 0 && (userCountries.length)) {
                (userCountries).map((country, key) => {
                    const matchedCountry = countries.find(i => i.country_iso2 === country);
                    return countryArr.push(matchedCountry).codbase_desc;
                });
            } else {
                return countryString;
            }

        }

        countryArr.sort((a, b) => (a.codbase_desc > b.codbase_desc) ? 1 : -1);
        countryArr.forEach((element, key) => {
            if(!element) return;
            countryString = countryString + element.codbase_desc;
            if (key < countryArr.length - 1) countryString = countryString + ', ';
        });

        return countryString;
    }

    useEffect(() => {
        getUserList();
        async function getCountries() {
            const response = (await axios.get('/api/countries')).data;
            const userProfile = (await axios.get('/api/users/profile')).data;
            const userCountries = extractLoggedInUserCountries(userProfile);
            setCountries(response);
            (userProfile.type === "admin") ? setUserCountries(response) : setUserCountries(fetchUserCountries(userCountries, response));
        }
        getCountries();
    }, []);

    const fetchUserCountries = (args, allCountries) => {
        const countryList = [];
        args.forEach(element => {
            countryList.push(allCountries.find(x => x.country_iso2 == element));
        });
        return countryList;
    }

    useEffect(() => {
        sortWithUrlChange();
    }, [userdata.users]);

    const sortWithUrlChange = () => {
        if (userdata.users && params.get('sort_type') && params.get('sort_col')) {
            dispatch(cdpSort(params.get('sort_type'), params.get('sort_col')));
        }
    }

    const sortCdp = (val) => {
        if (sort.value === val) {
            dispatch(cdpSort(sort.type === 'ASC' ? 'DESC' : 'ASC', val));
            setSort({ type: sort.type === 'ASC' ? 'DESC' : 'ASC', value: val });
        } else {
            dispatch(cdpSort('ASC', val));
            setSort({ type: 'ASC', value: val });
        }
    };

    // const onDeleteUser = id => {
    //     if (confirm("Are you sure?")) {
    //         dispatch(deleteUser(id)).then(res => {
    //             addToast("User deleted successfully", {
    //                 appearance: 'error',
    //                 autoDismiss: true
    //             });

    //             getUserList();
    //         });
    //     }
    // };

    const pageLeft = () => {
        if (userdata.page > 1) getUserList(userdata.page - 1, userdata.country_iso2);
    };

    const pageRight = () => {
        if (userdata.end !== userdata.total) getUserList(userdata.page + 1, userdata.country_iso2);
    };

    return (
        <main className="app__content cdp-light-bg">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb rounded-0">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item"><NavLink to="/users">Management of Customer Data platform</NavLink></li>
                                <li className="breadcrumb-item active"><span>CDP User List</span></li>
                            </ol>
                        </nav>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <div className="d-sm-flex justify-content-between align-items-center mb-3 mt-4">
                            <h4 className="cdp-text-primary font-weight-bold mb-3 mb-sm-0">CDP User List</h4>
                            <div className="d-flex justify-content-between align-items-center">
                                <Dropdown className="ml-auto dropdown-customize">
                                    <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle btn d-flex align-items-center">
                                        <i className="icon icon-filter mr-2 mb-n1"></i> Filter by Country
                                </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <LinkContainer to="list?page=1"><Dropdown.Item onClick={() => getUserList(1, null)}>All</Dropdown.Item></LinkContainer>
                                        {
                                            userCountries.length > 0 && userCountries.map(country => (
                                                <LinkContainer to={`list?page=1&codbase=${country.codbase}&sort_type=${sort.type}&sort_col=${sort.value}`} key={country.countryid}><Dropdown.Item onClick={() => getUserList(1, country.codbase)}>{country.codbase_desc}</Dropdown.Item></LinkContainer>
                                            ))
                                        }
                                    </Dropdown.Menu>
                                </Dropdown>

                                <NavLink to="/users/create" className="btn cdp-btn-secondary text-white ml-2">
                                    <i className="icon icon-plus pr-1"></i> Create new user
                                </NavLink>
                            </div>
                        </div>

                        {userdata['users'] && userdata['users'].length > 0 &&
                            <React.Fragment>
                                <div className="table-responsive shadow-sm bg-white">
                                    <table className="table table-hover table-sm mb-0 cdp-table">
                                        <thead className="cdp-bg-primary text-white cdp-table__header">
                                            <tr>
                                                <th><span className={sort.value === 'first_name' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : "cdp-table__col-sorting"} onClick={() => sortCdp('first_name')}>First Name<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>
                                                <th><span className={sort.value === 'last_name' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : "cdp-table__col-sorting"} onClick={() => sortCdp('last_name')}>Last Name<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>
                                                <th><span className={sort.value === 'email' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : "cdp-table__col-sorting"} onClick={() => sortCdp('email')}>Email<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>
                                                <th><span className="cdp-table__col-sorting">Countries</span></th>
                                                <th><span className={sort.value === 'created_at' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : "cdp-table__col-sorting"} onClick={() => sortCdp('created_at')}>Creation Date<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>
                                                <th><span className={sort.value === 'expiry_date' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : "cdp-table__col-sorting"} onClick={() => sortCdp('expiry_date')}>Expiry Date<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>
                                                <th><span className={sort.value === 'created_by' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : "cdp-table__col-sorting"} onClick={() => sortCdp('created_by')}>Created By<i className="icon icon-sort cdp-table__icon-sorting"></i></span></th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="cdp-table__body bg-white">
                                            {userdata.users.map(row => (
                                                <tr key={row.id}>
                                                    <td>{row.first_name}</td>
                                                    <td>{row.last_name}</td>
                                                    <td>{row.email}</td>
                                                    {/* <td>{countries.length > 0 && (row.countries.length) && (row.countries).map((country, key) => (
                                                        <span key={key}>{(countries.find(i => i.country_iso2 === country)).codbase_desc} {key < row.countries.length - 1 ? ', ' : ''}</span>
                                                    ))}</td> */}
                                                    <td>{sortCountries(extractUserCountries(row))}</td>
                                                    <td>{(new Date(row.created_at)).toLocaleDateString('en-GB').replace(/\//g, '.')}</td>
                                                    <td>{(new Date(row.expiry_date)).toLocaleDateString('en-GB').replace(/\//g, '.')}</td>
                                                    <td>
                                                        <NavLink to={`/users/${row.createdByUser.id}`}>
                                                            {`${row.createdByUser.first_name} ${row.createdByUser.last_name}`}
                                                        </NavLink>
                                                    </td>
                                                    <td>
                                                        <NavLink to={`/users/${row.id}`} className="btn cdp-btn-outline-primary btn-sm"><i class="icon icon-user mr-2"></i>Profile</NavLink>
                                                        {/* <button onClick={() => onDeleteUser(row.id)} className="btn btn-outline-danger btn-sm"><i class="far fa-trash-alt mr-2"></i> Delete</button> */}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {((userdata.page === 1 &&
                                        userdata.total > userdata.limit) ||
                                        (userdata.page > 1))
                                        && userdata['users'] &&
                                        <div className="pagination justify-content-end align-items-center border-top p-3">
                                            <span className="cdp-text-primary font-weight-bold">{userdata.start + ' - ' + userdata.end}</span> <span className="text-muted pl-1 pr-2"> {' of ' + userdata.total}</span>
                                            <LinkContainer to={`list?page=${userdata.page - 1}&codbase=${userdata.codbase}&sort_type=${sort.type}&sort_col=${sort.value}`}>
                                                <span className="pagination-btn" onClick={() => pageLeft()} disabled={userdata.page <= 1}><i className="icon icon-arrow-down ml-2 prev"></i></span>
                                            </LinkContainer>
                                            <LinkContainer to={`list?page=${userdata.page + 1}&codbase=${userdata.codbase}&sort_type=${sort.type}&sort_col=${sort.value}`}>
                                                <span className="pagination-btn" onClick={() => pageRight()} disabled={userdata.end === userdata.total}><i className="icon icon-arrow-down ml-2 next"></i></span>
                                            </LinkContainer>
                                        </div>
                                    }
                                </div>


                            </React.Fragment>
                        }

                        {userdata['users'] && userdata['users'].length === 0 &&
                            <div className="row justify-content-center mt-5 pt-5 mb-3">
                                <div className="col-12 col-sm-6 py-4 bg-white shadow-sm rounded text-center">
                                    <i class="icon icon-team icon-6x cdp-text-secondary"></i>
                                    <h3 className="font-weight-bold cdp-text-primary pt-4">No Users Found!</h3>
                                    <h4 className="cdp-text-primary pt-3 pb-5">Click on the button below to create new one</h4>
                                    <NavLink to="/users/create" className="btn cdp-btn-secondary text-white px-5 py-2 font-weight-bold">
                                        <i className="icon icon-plus pr-1"></i> Create New User
                                    </NavLink>
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </main>
    );
}

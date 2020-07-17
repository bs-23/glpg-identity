import axios from 'axios';
import { NavLink } from 'react-router-dom';
import Dropdown from 'react-bootstrap/Dropdown';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { LinkContainer } from 'react-router-bootstrap';
import { getUsers, getSignedInUserProfile } from '../user.actions';

export default function Users() {
    const dispatch = useDispatch();

    const userdata = useSelector(state => state.userReducer.users);

    const [countries, setCountries] = useState([]);

    const params = new URLSearchParams(window.location.search);

    const getUserList = (page = params.get('page') ? params.get('page') : 1,
        country_iso2 = params.get('country_iso2') ? params.get('country_iso2') : null) => {
        dispatch(getUsers(page, country_iso2));
    };

    useEffect(() => {
        getUserList();
        async function getCountries() {
            const response = await axios.get('/api/countries');
            setCountries(response.data);
        }
        getCountries();
    }, []);

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
        <main className="app__content">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb rounded-0">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item"><NavLink to="/users">User Management</NavLink></li>
                                <li className="breadcrumb-item active">User List</li>
                            </ol>
                        </nav>
                    </div>
                </div>

                <div className="row">
                    <div className="col-12">
                        <div className="d-flex justify-content-between align-items-center">
                            <h2>CDP User List</h2>
                            <Dropdown className="ml-auto mr-2">
                                <Dropdown.Toggle variant="" className="cdp-btn-secondary text-white btn-sm">
                                    <i className="fas fa-filter mr-1"></i> Filter by Country
                            </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <LinkContainer to="list?page=1"><Dropdown.Item onClick={() => getUserList(1, null)}>None</Dropdown.Item></LinkContainer>
                                    {
                                        countries.length > 0 && countries.map(country => (
                                            <LinkContainer to={`list?page=1&country_iso2=${country.country_iso2}`} key={country.countryid}><Dropdown.Item onClick={() => getUserList(1, country.country_iso2)}>{country.countryname}</Dropdown.Item></LinkContainer>
                                        ))
                                    }
                                </Dropdown.Menu>
                            </Dropdown>

                            <NavLink to="/users/create" className="btn cdp-btn-primary btn-sm text-white mr-2">
                                <i className="fas fa-plus pr-1"></i> Create new user
                            </NavLink>
                        </div>

                        {userdata['users'] && userdata['users'].length > 0 &&
                            <React.Fragment>
                                <table className="table table-hover table-sm mb-0">
                                    <thead className="cdp-light-bg">
                                        <tr>
                                            <th className="py-2">First Name</th>
                                            <th className="py-2">Last Name</th>
                                            <th className="py-2">Email</th>
                                            <th className="py-2">Creation Date</th>
                                            <th className="py-2">Expiry Date</th>
                                            <th className="py-2">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userdata.users.map(row => (
                                            <tr key={row.id}>
                                                <td>{row.first_name}</td>
                                                <td>{row.last_name}</td>
                                                <td>{row.email}</td>
                                                <td>{(new Date(row.created_at)).toLocaleDateString().replace(/\//g, '-')}</td>
                                                <td>{(new Date(row.expiry_date)).toLocaleDateString().replace(/\//g, '-')}</td>
                                                <td>
                                                    <NavLink to={`/users/${row.id}`} className="btn cdp-btn-outline-secondary btn-sm"><i class="far fa-address-card mr-1"></i>Profile</NavLink>
                                                    {/* <button onClick={() => onDeleteUser(row.id)} className="btn btn-outline-danger btn-sm"><i class="far fa-trash-alt mr-2"></i> Delete</button> */}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {((userdata.page === 1 && userdata['users'].length > userdata.limit - 1) ||
                                    (userdata.page > 1))
                                    && userdata['users'] &&
                                    < div className="pagination justify-content-end align-items-center mb-4 border-top pt-3">
                                        {userdata.start + '-' + userdata.end + ' of ' + userdata.total}
                                        <LinkContainer to={`list?page=${userdata.page - 1}&country_iso2=${userdata.country_iso2}`}>
                                            <button className="btn btn-sm cdp-btn-secondary text-white mx-2" onClick={() => pageLeft()} disabled={userdata.page <= 1}>Prev</button>
                                        </LinkContainer>
                                        <LinkContainer to={`list?page=${userdata.page + 1}&country_iso2=${userdata.country_iso2}`}>
                                            <button className="btn btn-sm cdp-btn-secondary text-white" onClick={() => pageRight()} disabled={userdata.end === userdata.total}>Next</button>
                                        </LinkContainer>
                                    </div>
                                }
                            </React.Fragment>
                        }

                        {userdata['users'] && userdata['users'].length === 0 &&
                            <div className="alert alert-info mt-5">No users found!</div>
                        }
                    </div>
                </div>
            </div>
        </main>
    );
}

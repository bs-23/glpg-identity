import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Dropdown from 'react-bootstrap/Dropdown';
import { LinkContainer } from 'react-router-bootstrap';
import { getUsers } from '../user.actions';
// import { deleteUser } from '../user.actions';
import axios from "axios";

export default function Users() {
    const dispatch = useDispatch();

    const userdata = useSelector(state => state.userReducer.users);

    const [countries, setCountries] = useState([]);

    const params = new URLSearchParams(window.location.search);

    const getUserList = (page = params.get('page') ? params.get('page') : 1,
        country = params.get('country') ? params.get('country') : null) => {
        dispatch(getUsers(page, country));
    }

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
        if (userdata.page > 1) getUserList(userdata.page - 1, userdata.country);
    };

    const pageRight = () => {
        if (userdata.end !== userdata.total) getUserList(userdata.page + 1, userdata.country);
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
                                    Filter by Country
                            </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <LinkContainer to="list?page=1"><Dropdown.Item onClick={() => getUserList(1, null)}>None</Dropdown.Item></LinkContainer>
                                    {
                                        countries.length > 0 && countries.map(country => (
                                            <LinkContainer to={`list?page=1&country=${country.country_iso2}`} key={country.countryid}><Dropdown.Item onClick={() => getUserList(1, country.country_iso2)}>{country.countryname}</Dropdown.Item></LinkContainer>
                                        ))
                                    }

                                </Dropdown.Menu>
                            </Dropdown>

                            <NavLink to="/users/create" className="btn cdp-btn-primary btn-sm text-white">
                                Create new user
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
                                            <th className="py-2">Account Expiry Date</th>
                                            <th className="py-2">Status</th>
                                            <th className="py-2">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userdata.users.map(row => (
                                            <tr key={row.id}>
                                                <td>{row.first_name}</td>
                                                <td>{row.last_name}</td>
                                                <td>{row.email}</td>
                                                <td>{(new Date(row.expiary_date)).toLocaleDateString().replace(/\//g, '-')}</td>
                                                <td>
                                                    {row.status === 'active' ?
                                                        <span><i className="fa fa-xs fa-circle text-success pr-2"></i>Active</span> :
                                                        <span><i className="fa fa-xs fa-circle text-danger pr-2"></i>Inactive</span>
                                                    }
                                                </td>
                                                <td>
                                                    <NavLink to={`/users/${row.id}`} className="btn btn-outline-primary btn-sm"><i className="far fa-user-circle pr-1"></i>Profile Details</NavLink>
                                                    {/* <button onClick={() => onDeleteUser(row.id)} className="btn btn-outline-danger btn-sm"><i class="far fa-trash-alt mr-2"></i> Delete</button> */}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {((userdata.page === 1 && userdata['users'] && userdata['users'].length > 19) ||
                                    (userdata.page > 1 && userdata['users']))
                                    &&
                                    < div className="pagination justify-content-end align-items-center mb-4 border-top pt-3">
                                        {userdata.start + '-' + userdata.end + ' of ' + userdata.total}
                                        <LinkContainer to={`list?page=${userdata.page - 1}&country=${userdata.country}`}><button className="btn btn-sm cdp-btn-secondary text-white mx-2" onClick={() => pageLeft()} disabled={userdata.page <= 1}>Prev</button></LinkContainer>
                                        <LinkContainer to={`list?page=${userdata.page + 1}&country=${userdata.country}`}><button className="btn btn-sm cdp-btn-secondary text-white" onClick={() => pageRight()} disabled={userdata.end === userdata.total}>Next</button></LinkContainer>
                                    </div>
                                }
                            </React.Fragment>
                        }

                        {userdata['users'] && userdata['users'].length === 0 &&
                            <>No users found!</>
                        }

                    </div>
                </div>
            </div>
        </main >

    );
}

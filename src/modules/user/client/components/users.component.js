import axios from 'axios';
import { NavLink } from 'react-router-dom';
import Dropdown from 'react-bootstrap/Dropdown';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { LinkContainer } from 'react-router-bootstrap';
import { getUsers } from '../user.actions';

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
                        <div className="d-flex justify-content-between align-items-center mb-3 mt-4">
                            <h4 className="cdp-text-primary font-weight-bold mb-0">CDP User List</h4>
                            <Dropdown className="ml-auto dropdown-customize">
                                <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle btn d-flex align-items-center">
                                    <i className="icon icon-filter mr-2 mb-n1"></i> Filter by Country
                            </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <LinkContainer to="list?page=1"><Dropdown.Item onClick={() => getUserList(1, null)}>All</Dropdown.Item></LinkContainer>
                                    {
                                        countries.length > 0 && countries.map(country => (
                                            <LinkContainer to={`list?page=1&country_iso2=${country.country_iso2}`} key={country.countryid}><Dropdown.Item onClick={() => getUserList(1, country.country_iso2)}>{country.countryname}</Dropdown.Item></LinkContainer>
                                        ))
                                    }
                                </Dropdown.Menu>
                            </Dropdown>

                            <NavLink to="/users/create" className="btn cdp-btn-secondary text-white ml-2">
                                <i className="icon icon-plus pr-1"></i> Create new user
                            </NavLink>
                        </div>

                        {userdata['users'] && userdata['users'].length > 0 &&
                            <React.Fragment>
                            <div className="table-responsive shadow-sm bg-white">
                                <table className="table table-hover table-sm mb-0 cdp-table">
                                    <thead className="cdp-bg-primary text-white cdp-table__header">
                                        <tr>
                                            <th className="py-2">First Name</th>
                                            <th className="py-2">Last Name</th>
                                            <th className="py-2">Email</th>
                                            <th className="py-2">Country</th>
                                            <th className="py-2">Creation Date</th>
                                            <th className="py-2">Expiry Date</th>
                                            <th className="py-2">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="cdp-table__body bg-white">
                                        {userdata.users.map(row => (
                                            <tr key={row.id}>
                                                <td>{row.first_name}</td>
                                                <td>{row.last_name}</td>
                                                <td>{row.email}</td>
                                                <td>{countries.length > 0 && (row.countries.length) && (row.countries).map((country, key) => (
                                                    <span key={key}>{(countries.find(i => i.country_iso2 === country)).countryname} {key < row.countries.length - 1 ? ', ' : ''}</span>
                                                ))}</td>
                                                <td>{(new Date(row.created_at)).toLocaleDateString().replace(/\//g, '-')}</td>
                                                <td>{(new Date(row.expiry_date)).toLocaleDateString().replace(/\//g, '-')}</td>
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
                                    <div className="pagination justify-content-end align-items-center  border-top p-3">
                                        {/* {userdata.start + '-' + userdata.end + ' of ' + userdata.total} */}
                                        <span>{userdata.start + '-' + userdata.end }</span> <span> {' of ' + userdata.total}</span> 
                                        <LinkContainer to={`list?page=${userdata.page - 1}&country_iso2=${userdata.country_iso2}`}>
                                            <button className="btn btn-sm cdp-btn-secondary text-white mx-2" onClick={() => pageLeft()} disabled={userdata.page <= 1}>Prev</button>
                                        </LinkContainer>
                                        <LinkContainer to={`list?page=${userdata.page + 1}&country_iso2=${userdata.country_iso2}`}>
                                            <button className="btn btn-sm  text-white" onClick={() => pageRight()} disabled={userdata.end === userdata.total}>Next</button>
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

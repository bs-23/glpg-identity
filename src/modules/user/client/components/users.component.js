import React, { useEffect } from 'react'
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Dropdown from 'react-bootstrap/Dropdown';
import { LinkContainer } from 'react-router-bootstrap';
import { getUsers, deleteUser } from '../user.actions';

export default function Users() {
    const dispatch = useDispatch();

    const userdata = useSelector(state => state.userReducer.users);

    const params = new URLSearchParams(window.location.search);

    const getUserList = (page = params.get('page') ? params.get('page') : 1,
        country = params.get('country') ? params.get('country') : null) => {
        dispatch(getUsers(page, country));
    }

    useEffect(() => {
        getUserList();
    }, []);

    const onDeleteUser = id => {
        if (confirm("Are you sure?")) {
            dispatch(deleteUser(id)).then(res => {
                getUserList();
            });
        }
    };

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
                                    Filter
                            </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <LinkContainer to="list?page=1"><Dropdown.Item onClick={() => getUserList(1, null)}>None</Dropdown.Item></LinkContainer>
                                    <LinkContainer to="list?page=1&country=Ireland"><Dropdown.Item onClick={() => getUserList(1, "Ireland")}>Ireland</Dropdown.Item></LinkContainer>
                                    <LinkContainer to="list?page=1&country=Netherlands"><Dropdown.Item onClick={() => getUserList(1, "Netherlands")}>Netherlands</Dropdown.Item></LinkContainer>
                                    <LinkContainer to="list?page=1&country=Luxembourg"><Dropdown.Item onClick={() => getUserList(1, "Luxembourg")}>Luxembourg</Dropdown.Item></LinkContainer>
                                    <LinkContainer to="list?page=1&country=Germany"><Dropdown.Item onClick={() => getUserList(1, "Germany")}>Germany</Dropdown.Item></LinkContainer>
                                    <LinkContainer to="list?page=1&country=France"><Dropdown.Item onClick={() => getUserList(1, "France")}>France</Dropdown.Item></LinkContainer>
                                    <LinkContainer to="list?page=1&country=Monaco"><Dropdown.Item onClick={() => getUserList(1, "Monaco")}>Monaco</Dropdown.Item></LinkContainer>
                                    <LinkContainer to="list?page=1&country=Italy"><Dropdown.Item onClick={() => getUserList(1, "Italy")}>Italy</Dropdown.Item></LinkContainer>
                                    <LinkContainer to="list?page=1&country=United Kingdom"><Dropdown.Item onClick={() => getUserList(1, "United Kingdom")}>United Kingdom</Dropdown.Item></LinkContainer>
                                    <LinkContainer to="list?page=1&country=Belgium"><Dropdown.Item onClick={() => getUserList(1, "Belgium")}>Belgium</Dropdown.Item></LinkContainer>
                                    <LinkContainer to="list?page=1&country=Spain"><Dropdown.Item onClick={() => getUserList(1, "Spain")}>Spain</Dropdown.Item></LinkContainer>
                                    <LinkContainer to="list?page=1&country=Andorra"><Dropdown.Item onClick={() => getUserList(1, "Andorra")}>Andorra</Dropdown.Item></LinkContainer>
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
                                            <th className="py-2">Name</th>
                                            <th className="py-2">Email</th>
                                            <th className="py-2">Account Expiry Date</th>
                                            <th className="py-2">Status</th>
                                            <th className="py-2">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userdata.users.map(row => (
                                            <tr key={row.id}>
                                                <td><NavLink to={`/users/${row.id}`}>{row.name}</NavLink></td>
                                                <td>{row.email}</td>
                                                <td>{(new Date(row.expiary_date)).toLocaleDateString().replace(/\//g, '-')}</td>
                                                <td>
                                                    {row.status === 'active' ?
                                                        <span><i className="fa fa-xs fa-circle text-success pr-2"></i>Active</span> :
                                                        <span><i className="fa fa-xs fa-circle text-danger pr-2"></i>Inactive</span>
                                                    }
                                                </td>
                                                <td><button onClick={() => onDeleteUser(row.id)} className="btn btn-outline-danger btn-sm"><i class="far fa-trash-alt mr-2"></i> Delete</button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            <div className="pagination justify-content-end align-items-center mb-4 border-top pt-3">
                                    {userdata.start + '-' + userdata.end + ' of ' + userdata.total}
                                <LinkContainer to={`list?page=${userdata.page - 1}&country=${userdata.country}`}><button className="btn btn-sm cdp-btn-secondary text-white mx-2" onClick={() => pageLeft()} disabled={userdata.page <= 1}>Prev</button></LinkContainer>
                                <LinkContainer to={`list?page=${userdata.page + 1}&country=${userdata.country}`}><button className="btn btn-sm cdp-btn-secondary text-white" onClick={() => pageRight()} disabled={userdata.end === userdata.total}>Next</button></LinkContainer>
                                </div>
                            </React.Fragment>
                        }

                        {userdata['users'] && userdata['users'].length === 0 &&
                            <>No users found!</>
                        }
                    </div>
                </div>
            </div>
        </main>

    );
}

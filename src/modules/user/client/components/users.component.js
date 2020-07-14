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
                                <li className="breadcrumb-item active">CDP user list</li>
                            </ol>
                        </nav>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <div className="d-flex justify-content-between align-items-center">
                            <h2>CDP user list</h2>
                            <Dropdown className="ml-auto mr-2">
                                <Dropdown.Toggle variant="secondary" className="mt-2">
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

                            <NavLink to="/users/create" className="btn btn-primary">
                                Create new user
                            </NavLink>
                        </div>

                        {userdata['users'] && userdata['users'].length > 0 &&
                            <React.Fragment>
                                <table className="table">
                                    <thead className="table-secondary">
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Account Expiry Date</th>
                                            <th>Status</th>
                                            <th>Action</th>
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
                                                <td><button onClick={() => onDeleteUser(row.id)} className="btn btn-primary">Delete</button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="pagination justify-content-end mb-4">
                                    {userdata.start + '-' + userdata.end + ' of ' + userdata.total}
                                    <LinkContainer to={`list?page=${userdata.page - 1}&country=${userdata.country}`}><button className="btn btn-secondary mx-2" onClick={() => pageLeft()} disabled={userdata.page <= 1}>Prev</button></LinkContainer>
                                    <LinkContainer to={`list?page=${userdata.page + 1}&country=${userdata.country}`}><button className="btn btn-secondary" onClick={() => pageRight()} disabled={userdata.end === userdata.total}>Next</button></LinkContainer>
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

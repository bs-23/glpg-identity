import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { NavLink } from 'react-router-dom';

import { getUsers, deleteUser } from '../user.actions';

export default function Users() {
    const dispatch = useDispatch();

    const users = useSelector(state => state.userReducer.users);

    useEffect(() => {
        dispatch(getUsers());
    }, []);

    const onDeleteUser = id => {
        if(confirm("Are you sure?")) {
            dispatch(deleteUser(id));
        }
    };

    return (
        <main>
            <div className="app__content">
                <nav aria-label="breadcrumb">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                        <li className="breadcrumb-item active">Users</li>
                    </ol>
                </nav>

                <div className="container-fluid">
                    <div className="row">
                        <div className="col-12">
                            <div className="d-flex justify-content-between align-items-center">
                                <h2>User list</h2>

                                <NavLink to="/users/create" className="btn btn-primary ml-auto">
                                    Create new user
                                </NavLink>
                            </div>

                            { users.length > 0 &&
                                <table className="table">
                                    <thead className="table-secondary">
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>Application</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(row => (
                                            <tr key={row.id}>
                                                <td>{row.name}</td>
                                                <td>{row.email}</td>
                                                <td>{row.phone}</td>
                                                <td>{row.client_id}</td>
                                                <td><a onClick={() => onDeleteUser(row.id)} href="#">Delete</a></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            }

                            { users.length === 0 &&
                                <>No users found!</>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

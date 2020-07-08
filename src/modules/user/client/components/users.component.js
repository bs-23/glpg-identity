import React, { useEffect } from 'react'
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

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
                                            <td>{row.application_id}</td>
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
        </main>
    );
}

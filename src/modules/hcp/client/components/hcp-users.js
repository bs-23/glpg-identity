import React, { useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { getHcpProfiles } from '../hcp.actions';

export default function hcps() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getHcpProfiles())
    }, []);

    const hcps = useSelector(state => state.hcpReducer.hcps);

    return (
        <main>
            <div className="app__content">
                <nav aria-label="breadcrumb">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                        <li className="breadcrumb-item active">HCP Profiles</li>
                    </ol>
                </nav>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-12">
                            <div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <h2 className="">HCP Profiles</h2>
                                    <NavLink to="" className="btn btn-primary ml-auto">
                                        Create HCP Profile
                                    </NavLink>
                                </div>

                                { hcps.length > 0 &&
                                    <table className="table">
                                        <thead className="table-secondary">
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Phone</th>
                                                <th>Status</th>
                                                <th>Action</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {hcps.map(row => (
                                                <tr key={row.id}>
                                                    <td>{row.name}</td>
                                                    <td>{row.email}</td>
                                                    <td>{row.phone}</td>
                                                    <td>{row.is_active}</td>
                                                    <td></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                }

                                { hcps.length === 0 &&
                                    <>No profiles found!</>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

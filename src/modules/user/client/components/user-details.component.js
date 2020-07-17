import axios from "axios";
import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';

const UserDetails = (props) => {
    const [userInfo, setUserInfo] = useState({});

    useEffect(() => {
        const { id } = props.match.params;

        async function getInfo() {
            const response = await axios.get(`/api/users/${id}`);
            setUserInfo(response.data);
        }

        getInfo();
    }, [props]);

    return (
        <main className="app__content">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb rounded-0">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item"><NavLink to="/users">User Management</NavLink></li>
                                <li className="breadcrumb-item"><NavLink to="/users/list">User List</NavLink></li>
                                <li className="breadcrumb-item active">Profile Details</li>
                            </ol>
                        </nav>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12 col-sm-6">
                        <h3 className="mb-3">Profile Details</h3>
                        <div className="profile-detail p-3">
                            <h2>{userInfo.first_name + " " + userInfo.last_name}</h2>
                            <ul className="list-group list-group-flush">
                                <li className="list-group-item bg-transparent px-0"><span className="mr-2">Email:</span><span>{userInfo.email}</span></li>
                                <li className="list-group-item bg-transparent px-0"><span className="mr-2">Phone Number:</span><span>{userInfo.phone}</span></li>
                                <li className="list-group-item bg-transparent px-0"><span className="mr-2">Expiary Date:</span><span>{userInfo.expiry_date}</span></li>
                                <li className="list-group-item bg-transparent px-0"><span className="mr-2">Last Login:</span><span>{userInfo.last_login}</span></li>
                                <li className="list-group-item bg-transparent px-0"><span className="mr-2">Status:</span><span>Active</span></li>
                            </ul>

                        </div>
                    </div>
                </div>
            </div>
        </main>

    );
}

export default UserDetails;

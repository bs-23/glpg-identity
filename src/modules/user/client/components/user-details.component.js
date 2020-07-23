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
        <main className="app__content cdp-light-bg h-100">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb rounded-0">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item"><NavLink to="/users">Management of Customer Data platform</NavLink></li>
                                <li className="breadcrumb-item"><NavLink to="/users/list">CDP User List</NavLink></li>
                                <li className="breadcrumb-item active"><span>Profile Details</span></li>
                            </ol>
                        </nav>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <div className="shadow-sm bg-white">
                            <h2 className="d-flex align-items-center p-3 p-sm-5 page-title light">
                                <span className="page-title__text font-weight-bold">Profile Details</span>
                            </h2>
                            <div className="profile-detail p-3 py-sm-4 px-sm-5 mb-3 mb-sm-0">
                                <h2 className="profile-detail__name pb-3">{userInfo.first_name + " " + userInfo.last_name}</h2>
                                <div className="profile-detail__row pb-0 pb-sm-2 d-block d-sm-flex">
                                    <div className="profile-detail__col pb-3 pr-0 pr-sm-3">
                                        <span className="mr-2 d-block profile-detail__label">Email</span>
                                        <span className="profile-detail__value">{userInfo.email}</span>
                                    </div>
                                    <div className="profile-detail__col pb-3">
                                        <span className="mr-2 d-block profile-detail__label">Phone Number</span>
                                        <span className="profile-detail__value">{userInfo.phone}</span>
                                    </div>
                                </div>
                                <div className="profile-detail__row pb-0 pb-sm-2 d-block d-sm-flex">
                                    <div className="profile-detail__col pb-3 pr-0 pr-sm-3">
                                        <span className="mr-2 d-block profile-detail__label">Roles</span>
                                        <span className="profile-detail__value">{userInfo.roles}</span>
                                    </div>
                                    <div className="profile-detail__col pb-3">
                                        <span className="mr-2 d-block profile-detail__label">Expiary Date</span>
                                        <span className="profile-detail__value">{userInfo.expiry_date}</span>
                                    </div>
                                </div>
                                <div className="profile-detail__row pb-0 pb-sm-2 d-block d-sm-flex">
                                    <div className="profile-detail__col pb-3 pr-0 pr-sm-3">
                                        <span className="mr-2 d-block profile-detail__label">Last Login</span>
                                        <span className="profile-detail__value">{userInfo.last_login}</span>
                                    </div>
                                    <div className="profile-detail__col pb-3">
                                        <span className="mr-2 d-block profile-detail__label">Status</span>
                                        <span className="profile-detail__value">Active</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>

    );
}

export default UserDetails;

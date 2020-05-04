import React from "react";
import { useSelector } from "react-redux";

export default function Dashboard() {
    const loggedInUser = useSelector(state => state.userReducer.loggedInUser);

    return (
        <div className="container">
            <div className="row">
                <div className="col-md-12">
                    <h2 className="mt-5">Hello {loggedInUser.name}, this is your dashboard. <a href="/logout">Logout</a></h2>
                    <div className="mt-4">
                        <a href="/users/create" className="btn btn-primary mr-2">Create New Site Admin</a>
                        <a href="/users" className="btn btn-success">View All Site Admins</a>
                    </div>
                </div>
            </div>
        </div>
    );
}

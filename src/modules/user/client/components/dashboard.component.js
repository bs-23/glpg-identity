import React from 'react';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import ChangePasswordFormComponent from './change-password-form.component';

export default function Dashboard() {
    const loggedInUser = useSelector(state => state.userReducer.loggedInUser);

    return (
        <div className="container">
            <div className="row">
                <div className="col-md-12">
                    <h2 className="mt-5">
                        Hello {loggedInUser.name}, this is your dashboard.{' '}
                        <a href="/logout">Logout</a>
                    </h2>
                    <div className="mt-4">
                        <NavLink to="/users" className="btn btn-success mr-2">
                            View all users
                        </NavLink>
                        <NavLink to="/users/create" className="btn btn-primary">
                            Create new user
                        </NavLink>
                    </div>
                    <div>
                        <ChangePasswordFormComponent />
                    </div>
                </div>
            </div>
        </div>
    );
}

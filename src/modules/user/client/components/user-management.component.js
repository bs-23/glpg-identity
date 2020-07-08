import React from 'react';
import { NavLink } from 'react-router-dom';

const UserManagement = () => {
    return (
        <NavLink to="users/list" className="p-5 border shadow-sm m-2 h4 pb-0 mb-0">
            User Management
        </NavLink>
    );
}
 
export default UserManagement;

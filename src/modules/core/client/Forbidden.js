import React from "react";
import { NavLink } from 'react-router-dom';

export default function NoMatch() {
    return (
        <div>
            <div className="alert alert-danger col-md-5 col-md-offset-5"><strong>Forbidden!</strong> You are not authorized to view this page</div>
            <NavLink to="/">Back to Dashboard</NavLink>
        </div>

    );
}

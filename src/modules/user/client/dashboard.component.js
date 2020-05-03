import React from "react";
import { useSelector } from "react-redux";

export default function Dashboard() {
    const loggedInUser = useSelector(state => state.userReducer.loggedInUser);

    return (
        <h2>Hello {loggedInUser.name}, this is your dashboard. <a href="/logout">Logout</a></h2>
    );
}

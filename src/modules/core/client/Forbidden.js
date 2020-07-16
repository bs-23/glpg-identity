import React from "react";
import { NavLink } from 'react-router-dom';

export default function NoMatch() {
    return (
        <div className="app__content forbidden h-100">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-10">
                        <div className="forbidden__panel p-3 p-md-5 bg-white text-center mt-3 mt-md-5">
                            <h2 className="forbidden__header h1 font-weight-bold pb-3">403</h2>
                            <h4 className="forbidden__subheader h2 font-weight-bold pb-3">You are not permitted to see this </h4>
                            <p className="forbidden__text h3 pb-5">The page you are trying to access has restricted access. You need permission to access this. </p>
                            <NavLink to="/" className="btn cdp-btn-secondary text-white px-5 py-2">Back to Dashboard</NavLink>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

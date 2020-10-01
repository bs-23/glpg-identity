import React from "react";
import { NavLink } from 'react-router-dom';

export default function NoMatch() {
    return (
        <div className="app__content forbidden h-100">
            <div className="container d-flex align-items-center">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-12 col-lg-9">
                        <div className="forbidden__panel p-3 p-md-5 bg-white text-center">
                            <a href="/" className="forbidden__app-logo"> <img alt="CDP LOGO" src="/assets/CDP.png" height="64" /></a>
                            <h2 className="forbidden__header pb-3"><img alt="Access Forbidden" src="/assets/images/access_forbidden.svg" height="250" /></h2>
                            <h4 className="forbidden__subheader font-weight-bold pb-3">Access Forbidden!</h4>
                            <p className="forbidden__text pb-5">Sorry, the page you are trying to access has restrictions.<br className="d-none d-md-block" /> You don't have permission to access that.</p>
                            <NavLink to="/" className="btn cdp-btn-secondary text-white px-5 py-2">Back to Dashboard</NavLink>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { NavLink } from 'react-router-dom';
import Dropdown from 'react-bootstrap/Dropdown';
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { LinkContainer } from 'react-router-bootstrap';
import { getHcpProfiles, editHcpProfiles, hcpsSort } from '../hcp.actions';

export default function hcpUsers() {
    const dispatch = useDispatch();

    const hcps = useSelector(state => state.hcpReducer.hcps);

    const pageLeft = () => {
        if (hcps.page > 1) dispatch(getHcpProfiles(hcps.page - 1, hcps.status, hcps.country_iso2));
    };

    const pageRight = () => {
        if (hcps.end !== hcps.total) dispatch(getHcpProfiles(hcps.page + 1, hcps.status, hcps.country_iso2));
    };

    const sortHcp = (sortType, val) => {
        dispatch(hcpsSort(sortType, val));
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        dispatch(getHcpProfiles(
            params.get('page') ? params.get('page') : 1,
            params.get('status') ? params.get('status') : null,
            params.get('country_iso2') ? params.get('country_iso2') : null,
        ));

    }, []);

    return (
        <main className="app__content">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb rounded-0">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item active"><span>HCP Profiles</span></li>
                            </ol>
                        </nav>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <div>
                            <div className="d-flex justify-content-between align-items-center">
                                <h2 className="">HCP Profiles</h2>
                                <div>
                                    {hcps['countries'] &&
                                        <Dropdown className="d-inline-block show dropdown border border-secondary rounded pl-2 mr-2">
                                            User Country
                                            <Dropdown.Toggle variant="secondary" className="ml-2">
                                                {hcps.country_iso2 ? hcps.country_iso2 : 'All'}
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <LinkContainer to={`list?page=1&status=${hcps.status}&country_iso2=null`}><Dropdown.Item className={hcps.country_iso2 === null ? 'd-none' : ''} onClick={() => dispatch(getHcpProfiles(1, hcps.status, null))}>All</Dropdown.Item></LinkContainer>
                                                {hcps['countries'].map((country, index) => (
                                                    <LinkContainer key={index} to={`list?page=1&status=${hcps.status}&country_iso2=${country}`}><Dropdown.Item className={hcps.status === country ? 'd-none' : ''} onClick={() => dispatch(getHcpProfiles(1, hcps.status, country))}>{country}</Dropdown.Item></LinkContainer>
                                                ))}
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    }
                                    <Dropdown className="d-inline-block show dropdown border border-secondary rounded pl-2">
                                        User Status
                                        <Dropdown.Toggle variant="secondary" className="ml-2">
                                            {hcps.status ? hcps.status : 'All'}
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <LinkContainer to={`list?page=1&status=null&country_iso2=${hcps.country_iso2}`}><Dropdown.Item className={hcps.status === null ? 'd-none' : ''} onClick={() => dispatch(getHcpProfiles(1, null, hcps.country_iso2))}>All</Dropdown.Item></LinkContainer>
                                            <LinkContainer to={`list?page=1&status=Approved&country_iso2=${hcps.country_iso2}`}><Dropdown.Item className={hcps.status === 'Approved' ? 'd-none' : ''} onClick={() => dispatch(getHcpProfiles(1, 'Approved', hcps.country_iso2))}>Approved</Dropdown.Item></LinkContainer>
                                            <LinkContainer to={`list?page=1&status=Pending&country_iso2=${hcps.country_iso2}`}><Dropdown.Item className={hcps.status === 'Pending' ? 'd-none' : ''} onClick={() => dispatch(getHcpProfiles(1, 'Pending', hcps.country_iso2))}>Pending</Dropdown.Item></LinkContainer>
                                            <LinkContainer to={`list?page=1&status=Rejected&country_iso2=${hcps.country_iso2}`}><Dropdown.Item className={hcps.status === 'Rejected' ? 'd-none' : ''} onClick={() => dispatch(getHcpProfiles(1, 'Rejected', hcps.country_iso2))}>Rejected</Dropdown.Item></LinkContainer>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>

                            </div>

                            {hcps['users'] && hcps['users'].length > 0 &&
                                <React.Fragment>
                                    <table className="table">
                                        <thead className="table-secondary">
                                            <tr>
                                                <th>Email<span className="d-inline-flex flex-column ml-1"><i className="fa fa-caret-up" onClick={() => sortHcp('ASC', 'email')}></i><i className="fa fa-caret-down" onClick={() => sortHcp('DESC', 'email')}></i></span></th>
                                                <th>Date of Registration<span className="d-inline-flex flex-column ml-1"><i className="fa fa-caret-up" onClick={() => sortHcp('ASC', 'created_at')}></i><i className="fa fa-caret-down" onClick={() => sortHcp('DESC', 'created_at')}></i></span></th>
                                                <th>Name<span className="d-inline-flex flex-column ml-1"><i className="fa fa-caret-up" onClick={() => sortHcp('ASC', 'first_name')}></i><i className="fa fa-caret-down" onClick={() => sortHcp('DESC', 'first_name')}></i></span></th>
                                                <th>Status<span className="d-inline-flex flex-column ml-1"><i className="fa fa-caret-up" onClick={() => sortHcp('ASC', 'status')}></i><i className="fa fa-caret-down" onClick={() => sortHcp('DESC', 'status')}></i></span></th>
                                                <th>UUID <span className="d-inline-flex flex-column ml-1"><i className="fa fa-caret-up" onClick={() => sortHcp('ASC', 'uuid')}></i><i className="fa fa-caret-down" onClick={() => sortHcp('DESC', 'uuid')}></i></span></th>
                                                <th>Specialty</th>
                                                <th>Action</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {hcps['users'].map((row, index) => (
                                                <tr key={index}>
                                                    <td>{row.email}</td>
                                                    <td>{row.created_at}</td>
                                                    <td>{row.first_name + ' ' + row.last_name}</td>
                                                    <td>
                                                        {row.status === 'Approved' ? <span><i className="fa fa-xs fa-circle text-success pr-2"></i>Approved</span> :
                                                            row.status === 'Pending' ? <span><i className="fa fa-xs fa-circle text-warning pr-2"></i>Pending</span> :
                                                                row.status === 'Rejected' ? <span><i className="fa fa-xs fa-circle text-danger pr-2"></i>Rejected</span> : <span></span>
                                                        }
                                                    </td>
                                                    <td>{row.uuid}</td>
                                                    <td>{row.specialty_onekey}</td>
                                                    <td>
                                                        <span><i className="fa fa-caret-down"></i></span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {((hcps.page === 1 &&
                                        hcps.total > hcps.limit) ||
                                        (hcps.page > 1))
                                        && hcps['users'] &&
                                        < div className="pagination justify-content-end align-items-center mb-4 border-top pt-3">
                                            {hcps.start + '-' + hcps.end + ' of ' + hcps.total}
                                            <LinkContainer to={`list?page=${hcps.page - 1}&status=${hcps.status}&country_iso2=${hcps.country_iso2}`}>
                                                <button className="btn btn-sm cdp-btn-secondary text-white mx-2" onClick={() => pageLeft()} disabled={hcps.page <= 1}>Prev</button>
                                            </LinkContainer>
                                            <LinkContainer to={`list?page=${hcps.page + 1}&status=${hcps.status}&country_iso2=${hcps.country_iso2}`}>
                                                <button className="btn btn-sm cdp-btn-secondary text-white" onClick={() => pageRight()} disabled={hcps.end === hcps.total}>Next</button>
                                            </LinkContainer>
                                        </div>
                                    }
                                </React.Fragment>
                            }

                            {hcps['users'] && hcps['users'].length === 0 &&
                                <>No profiles found!</>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </main >
    );
}

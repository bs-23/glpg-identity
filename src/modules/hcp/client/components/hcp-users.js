import { NavLink } from 'react-router-dom';
import Dropdown from 'react-bootstrap/Dropdown';
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { LinkContainer } from 'react-router-bootstrap';
import { getHcpProfiles, editHcpProfiles, hcpsSort } from '../hcp.actions';

export default function hcpUsers() {
    const dispatch = useDispatch();

    const [state, setState] = useState({ id: '', first_name: '', last_name: '', telephone: '' });

    const addItem = (id, row) => {
        setState(prevState => ({
            ...prevState,
            id: id, first_name: row.first_name, last_name: row.last_name, telephone: row.telephone
        }));
    };

    const removeItem = () => {
        setState(prevState => ({
            ...prevState,
            id: '', first_name: '', last_name: '', telephone: ''
        }));
    };

    const handleChange = (e, id, type) => {
        const value = e.target.value;
        setState(prevState => ({
            ...prevState,
            id: 'id' + id,
            [type]: value
        }));
        e.target.value = value;
    };

    const handleSubmit = (id) => {
        const data = {
            first_name: state.first_name,
            last_name: state.last_name,
            telephone: state.telephone
        };

        dispatch(editHcpProfiles(data, id)).then(res => {
            removeItem();
        });
    };

    const hcps = useSelector(state => state.hcpReducer.hcps);

    const pageLeft = () => {
        if (hcps.page > 1) dispatch(getHcpProfiles(hcps.page - 1, hcps.status));
    };

    const pageRight = () => {
        if (hcps.end !== hcps.total) dispatch(getHcpProfiles(hcps.page + 1, hcps.status));
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
                                <li className="breadcrumb-item active">HCP Profiles</li>
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
                                        <Dropdown className="d-inline mr-2">
                                            <Dropdown.Toggle variant="secondary" className="mt-2">
                                                Country
                                    </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <LinkContainer to={`list?page=1&status=${hcps.status}&country_iso2=null`}><Dropdown.Item onClick={() => dispatch(getHcpProfiles(1, hcps.status, null))}>All</Dropdown.Item></LinkContainer>
                                                {hcps['countries'].map((country, index) => (
                                                    <LinkContainer key={index} to={`list?page=1&status=${hcps.status}&country_iso2=${country}`}><Dropdown.Item onClick={() => dispatch(getHcpProfiles(1, hcps.status, country))}>{country}</Dropdown.Item></LinkContainer>
                                                ))}
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    }
                                    <Dropdown className="d-inline">
                                        <Dropdown.Toggle variant="secondary" className="mt-2">
                                            Status
                                    </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <LinkContainer to={`list?page=1&status=null&country_iso2=${hcps.country_iso2}`}><Dropdown.Item onClick={() => dispatch(getHcpProfiles(1, null, hcps.country_iso2))}>All</Dropdown.Item></LinkContainer>
                                            <LinkContainer to={`list?page=1&status=Approved&country_iso2=${hcps.country_iso2}`}><Dropdown.Item onClick={() => dispatch(getHcpProfiles(1, 'Approved', hcps.country_iso2))}>Approved</Dropdown.Item></LinkContainer>
                                            <LinkContainer to={`list?page=1&status=Pending&country_iso2=${hcps.country_iso2}`}><Dropdown.Item onClick={() => dispatch(getHcpProfiles(1, 'Pending', hcps.country_iso2))}>Pending</Dropdown.Item></LinkContainer>
                                            <LinkContainer to={`list?page=1&status=Rejected&country_iso2=${hcps.country_iso2}`}><Dropdown.Item onClick={() => dispatch(getHcpProfiles(1, 'Rejected', hcps.country_iso2))}>Rejected</Dropdown.Item></LinkContainer>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>

                            </div>

                            {hcps['users'] && hcps['users'].length > 0 &&
                                <React.Fragment>
                                    <table className="table">
                                        <thead className="table-secondary">
                                            <tr>
                                                <th>Firstname<span className="d-inline-flex flex-column ml-1"><i className="fa fa-caret-up" onClick={() => sortHcp('ASC', 'first_name')}></i><i className="fa fa-caret-down" onClick={() => sortHcp('DESC', 'first_name')}></i></span></th>
                                                <th>Email<span className="d-inline-flex flex-column ml-1"><i className="fa fa-caret-up" onClick={() => sortHcp('ASC', 'email')}></i><i className="fa fa-caret-down" onClick={() => sortHcp('DESC', 'email')}></i></span></th>
                                                <th>Lastname<span className="d-inline-flex flex-column ml-1"><i className="fa fa-caret-up" onClick={() => sortHcp('ASC', 'last_name')}></i><i className="fa fa-caret-down" onClick={() => sortHcp('DESC', 'last_name')}></i></span></th>
                                                <th>Telephone<span className="d-inline-flex flex-column ml-1"><i className="fa fa-caret-up" onClick={() => sortHcp('ASC', 'telephone')}></i><i className="fa fa-caret-down" onClick={() => sortHcp('DESC', 'telephone')}></i></span></th>
                                                <th>UUID <span className="d-inline-flex flex-column ml-1"><i className="fa fa-caret-up" onClick={() => sortHcp('ASC', 'uuid')}></i><i className="fa fa-caret-down" onClick={() => sortHcp('DESC', 'uuid')}></i></span></th>
                                                <th>Status<span className="d-inline-flex flex-column ml-1"><i className="fa fa-caret-up" onClick={() => sortHcp('ASC', 'status')}></i><i className="fa fa-caret-down" onClick={() => sortHcp('DESC', 'status')}></i></span></th>
                                                <th>Action</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {hcps['users'].map((row, index) => (
                                                <tr key={index}>
                                                    {state.id === ('id' + index) ?
                                                        <React.Fragment>
                                                            <td><input type="text" value={state.first_name} onChange={e => handleChange(e, index, 'first_name')} /></td>
                                                            <td><input type="text" className="bg-secondary" value={row.email} readOnly /></td>
                                                            <td><input type="text" value={state.last_name} onChange={e => handleChange(e, index, 'last_name')} /></td>
                                                            <td><input type="text" value={state.telephone} onChange={e => handleChange(e, index, 'telephone')} /></td>
                                                            <td><input type="text" className="bg-secondary" value={row.uuid} readOnly /></td>
                                                        </React.Fragment>
                                                        :

                                                        <React.Fragment>
                                                            <td>{row.first_name}</td>
                                                            <td>{row.email}</td>
                                                            <td>{row.last_name}</td>
                                                            <td>{row.telephone}</td>
                                                            <td>{row.uuid}</td>
                                                        </React.Fragment>
                                                    }

                                                    <td>
                                                        {row.status === true ?
                                                            <span><i className="fa fa-xs fa-circle text-success pr-2"></i>Approved</span> :
                                                            <span><i className="fa fa-xs fa-circle text-danger pr-2"></i>Not Approved</span>
                                                        }
                                                    </td>

                                                    <td>
                                                        {state.id === ('id' + index) ?
                                                            <React.Fragment>
                                                                <i className="fa fa-check text-success px-2" onClick={() => handleSubmit(row.id)}></i>
                                                                <i className="fa fa-times text-danger px-2" onClick={() => removeItem()}></i>
                                                            </React.Fragment> :
                                                            <span><i className="fas fa-pencil-alt px-2" onClick={() => addItem('id' + index, row)}></i></span>
                                                        }
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {((hcps.page === 1 && hcps['users'] && hcps['users'].length > 19) ||
                                        (hcps.page > 1 && hcps['users'])) &&
                                        <div className="pagination justify-content-end mb-4">
                                            {hcps.start + '-' + hcps.end + ' of ' + hcps.total}
                                            <LinkContainer to={`hcps?page=${hcps.page - 1}&status=${hcps.status}`}><button className="btn btn-secondary mx-2" onClick={() => pageLeft()} disabled={hcps.page <= 1}>Prev</button></LinkContainer>
                                            <LinkContainer to={`hcps?page=${hcps.page + 1}&status=${hcps.status}`}><button className="btn btn-secondary" onClick={() => pageRight()} disabled={hcps.end === hcps.total}>Next</button></LinkContainer>
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

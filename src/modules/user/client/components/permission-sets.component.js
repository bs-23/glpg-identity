import axios from "axios";
import { useSelector } from "react-redux";
import { NavLink, Route, useRouteMatch, useHistory } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Dropdown from 'react-bootstrap/Dropdown';
import { LinkContainer } from 'react-router-bootstrap';
import PermissionSetForm from './permission-set-form.component';
import PermissionSetDetails from "./permission-sets-details";

export default function ManagePermissionSets() {
    const [permissionSets, setPermissionSets] = useState([]);
    const [permissionModalShow, setPermissionModalShow] = useState(false);
    const [permissionSetEditData, setPermissionSetEditData] = useState(null);
    const countries = useSelector(state => state.userReducer.countries);
    const match = useRouteMatch();
    const history = useHistory();

    const getPermissionSets = async () => {
        const response = await axios.get('/api/permissionSets');
        setPermissionSets(response.data);
    }

    const getCountryNamesFromCodes = (country_codes) => {
        if(!country_codes || !country_codes.length) return '';
        const country_names = [];
        country_codes.forEach(code => {
            const countryDetails = countries.find(c => c.country_iso2 === code);
            if(countryDetails) country_names.push(countryDetails.codbase_desc);
        });
        return country_names.sort().join(', ');
    }

    const getServiceCategoryNames = (data) => {
        if(!data.ps_sc) return '';
        return data.ps_sc.map(item => item.serviceCategory.title).sort().join(', ');
    }
    const getApplicationNames = (data) => {
        if(!data.ps_app) return '';
        return data.ps_app.map(item => item.application.name).sort().join(', ');
    }

    const handleFormSubmitSuccess = () => {
        getPermissionSets();
        setPermissionSetEditData(null);
        setPermissionModalShow(false);
    }

    const preparePermissionSetEditData = (data) => {
        const { id, title, description, countries } = data;
        const serviceCategories = data.ps_sc ? data.ps_sc.map(item => item.serviceCategory.id ) : [];
        const applications = data.ps_app ? data.ps_app.map(item => item.application.id ) : [];
        const editObject = { id, title, description, countries, serviceCategories, applications };
        return editObject;
    }

    const handlePermissionSetEditClick = (data) => {
        const editObject = preparePermissionSetEditData(data)
        setPermissionSetEditData(editObject);
        setPermissionModalShow(true);
    }

    useEffect(() => {
        getPermissionSets();
    }, []);

    return (
        <main className="app__content cdp-light-bg">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb rounded-0 my-0">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item"><NavLink to="/users">Management of Customer Data Platform</NavLink></li>
                                <li className="breadcrumb-item active"><span>Manage Permission Sets</span></li>
                            </ol>
                        </nav>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12 col-sm-12 pt-3">
                        <div className="d-flex justify-content-between align-items-center mb-3 mt-4">
                            <h4 className="cdp-text-primary font-weight-bold mb-0">Manage Permission Sets</h4>
                            <button className="btn cdp-btn-secondary text-white ml-auto " onClick={() => { setPermissionModalShow(true) }}>
                                <i className="icon icon-plus pr-1"></i> Add New Permission Set
                            </button>
                        </div>

                        {permissionSets.length > 0 &&
                            <div className="table-responsive shadow-sm bg-white">
                                <table className="table table-hover table-sm mb-0 cdp-table">
                                    <thead className="cdp-bg-primary text-white cdp-table__header">
                                        <tr>
                                            <th className="py-2" width="15%">Title</th>
                                            <th className="py-2" width="10%">Type</th>
                                            <th className="py-2" width="25%">Description</th>
                                            <th className="py-2" width="10%">Applications</th>
                                            <th className="py-2" width="15%">Countries</th>
                                            <th className="py-2" width="25%">Service Categories</th>
                                            <th className="py-2" width="10%">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="cdp-table__body bg-white">
                                        {permissionSets.map(row => (
                                            <tr key={row.id}>
                                                <td>{row.title}</td>
                                                <td className="text-capitalize">{row.type}</td>
                                                <td>{row.description}</td>
                                                <td>{getApplicationNames(row)}</td>
                                                <td>{getCountryNamesFromCodes(row.countries)}</td>
                                                <td>{getServiceCategoryNames(row)}</td>
                                                <td>
                                                    {/* <button className="btn cdp-btn-outline-primary btn-sm" onClick={() => handlePermissionSetEditClick(row)} disabled={readOnlyPermissionSets.includes(row.slug)}> <i className="icon icon-edit-pencil pr-2"></i>Edit</button>
                                                    <button className="btn cdp-btn-outline-primary btn-sm" onClick={() => history.push(`${match.path}/${row.id}`)} > <i className="icon icon-edit-pencil pr-2"></i>Details</button> */}
                                                    <Dropdown className="ml-auto dropdown-customize">
                                                        <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle btn-sm py-0 px-1">
                                                        </Dropdown.Toggle>
                                                        <Dropdown.Menu>
                                                            <LinkContainer to="#"><Dropdown.Item disabled={row.type === 'standard'} onClick={() => handlePermissionSetEditClick(row)}>Edit</Dropdown.Item></LinkContainer>
                                                            <LinkContainer to={`${match.url}/${row.id}`}><Dropdown.Item onClick={() => null}>Details</Dropdown.Item></LinkContainer>
                                                        </Dropdown.Menu>
                                                    </Dropdown>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        }

                        {permissionSets.length === 0 &&
                            <><div className="row justify-content-center mt-5 pt-5 mb-3">
                                <div className="col-12 col-sm-6 py-4 bg-white shadow-sm rounded text-center">
                                    <i class="icon icon-team icon-6x cdp-text-secondary"></i>
                                    <h3 className="font-weight-bold cdp-text-primary pt-4">No Permission Set Found!</h3>
                                </div>
                            </div></>
                        }
                        <Modal
                            show={permissionModalShow}
                            onHide={() => { setPermissionModalShow(false); setPermissionSetEditData(null); }}
                            dialogClassName="modal-90w modal-customize"
                            aria-labelledby="example-custom-modal-styling-title"
                            size="lg"
                        >
                            <Modal.Header closeButton>
                                <Modal.Title id="example-custom-modal-styling-title">
                                    {permissionSetEditData ? 'Update Permission Set' : 'Create New Permission Set'}
                                </Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <PermissionSetForm onSuccess={handleFormSubmitSuccess} preFill={permissionSetEditData} />
                            </Modal.Body>
                        </Modal>
                        <Route path={`${match.path}/:id`} >
                            {(props) => <Modal
                                show={props.match && props.match.isExact}
                                onHide={() => history.push(match.url)}
                                dialogClassName="modal-90w modal-customize"
                                aria-labelledby="example-custom-modal-styling-title"
                                size="lg"
                                centered
                            >
                                <Modal.Header closeButton>
                                    <Modal.Title id="example-custom-modal-styling-title">
                                        Permission Set Details
                                    </Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <PermissionSetDetails permissionSetId={props.match && props.match.params.id}/>
                                </Modal.Body>
                            </Modal>}
                        </Route>
                    </div>
                </div>
            </div>
        </main >
    )
}

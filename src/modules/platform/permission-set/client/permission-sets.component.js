import axios from "axios";
import { useSelector } from "react-redux";
import { NavLink, Route, useRouteMatch, useHistory, useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Dropdown from 'react-bootstrap/Dropdown';
import { LinkContainer } from 'react-router-bootstrap';
import PermissionSetForm from './permission-set-form.component';
import PermissionSetDetails from "./permission-sets-details";
import Faq from '../../../platform/faq/client/faq.component';

export default function ManagePermissionSets() {
    const [permissionSets, setPermissionSets] = useState([]);
    const [permissionModalShow, setPermissionModalShow] = useState(false);
    const [permissionSetEditID, setPermissionSetEditID] = useState(null);
    const countries = useSelector(state => state.countryReducer.countries);
    const match = useRouteMatch();
    const history = useHistory();
    const location = useLocation();
    const [showFaq, setShowFaq] = useState(false);
    const handleCloseFaq = () => setShowFaq(false);
    const handleShowFaq = () => setShowFaq(true);

    const getPermissionSets = async () => {
        const response = await axios.get('/api/permissionSets');
        setPermissionSets(response.data);
    }

    const getCountryNamesFromCodes = (country_codes) => {
        if (!country_codes || !country_codes.length) return '';
        const country_names = [];
        country_codes.forEach(code => {
            const countryDetails = countries.find(c => c.country_iso2 === code);
            if (countryDetails) country_names.push(countryDetails.codbase_desc);
        });
        return country_names.sort().join(', ');
    }

    const getServiceCategoryNames = (data) => {
        if (!data.ps_sc) return '';
        return data.ps_sc.map(item => item.service.title).sort().join(', ');
    }

    const getApplicationNames = (data) => {
        if (!data.ps_app) return '';
        return data.ps_app.map(item => item.application.name).sort().join(', ');
    }

    const handleFormSubmitSuccess = () => {
        getPermissionSets();
        setPermissionSetEditID(null);
        setPermissionModalShow(false);
    }

    const handlePermissionSetEditClick = (data) => {
        setPermissionSetEditID(data.id);
        setPermissionModalShow(true);
    }

    const handleCreateModalHide = () => {
        setPermissionModalShow(false);
        setPermissionSetEditID(null);
    }

    useEffect(() => {
        if (location.state && location.state.showCreateModal) setPermissionModalShow(true);
        getPermissionSets();
    }, []);

    return (
        <main className="app__content cdp-light-bg">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0">
                        <nav className="breadcrumb justify-content-between align-items-center" aria-label="breadcrumb">
                            <ol className="rounded-0 m-0 p-0 d-none d-sm-flex">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item"><NavLink to="/platform">Management of Customer Data Platform</NavLink></li>
                                <li className="breadcrumb-item active"><span>Manage Permission Sets</span></li>
                            </ol>
                            <Dropdown className="dropdown-customize breadcrumb__dropdown d-block d-sm-none ml-2">
                                <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle btn d-flex align-items-center border-0">
                                    <i className="fas fa-arrow-left mr-2"></i> Back
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item className="px-2" href="/"><i className="fas fa-link mr-2"></i> Dashboard</Dropdown.Item>
                                    <Dropdown.Item className="px-2" href="/platform"><i className="fas fa-link mr-2"></i> Management of Customer Data platform</Dropdown.Item>
                                    <Dropdown.Item className="px-2" active><i className="fas fa-link mr-2"></i> Manage Permission Sets</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                            <span className="ml-auto mr-3"><i type="button" onClick={handleShowFaq} className="icon icon-help breadcrumb__faq-icon cdp-text-secondary"></i></span>
                        </nav>
                        <Modal show={showFaq} onHide={handleCloseFaq} size="lg" centered>
                            <Modal.Header closeButton>
                                <Modal.Title>Questions You May Have</Modal.Title>
                            </Modal.Header>
                            <Modal.Body className="faq__in-modal"><Faq topic="manage-permission-set" /></Modal.Body>
                        </Modal>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12 col-sm-12 pt-3">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h4 className="cdp-text-primary font-weight-bold mb-0">Manage Permission Sets</h4>
                            <button className="btn cdp-btn-secondary text-white ml-auto " onClick={() => { setPermissionModalShow(true) }}>
                                <i className="icon icon-plus"></i> <span className="d-none d-sm-inline-block pl-1">Add New Permission Set</span>
                            </button>
                        </div>

                        {permissionSets.length > 0 &&
                            <div className="table-responsive shadow-sm bg-white mb-3 cdp-table__responsive-wrapper">
                            <table className="table table-hover table-sm mb-0 cdp-table cdp-table__responsive">
                                    <thead className="cdp-bg-primary text-white cdp-table__header">
                                        <tr>
                                            <th className="py-2" width="15%">Title</th>
                                            <th className="py-2" width="6%">Type</th>
                                            <th className="py-2" width="15%">Description</th>
                                            <th className="py-2" width="9%">Applications</th>
                                            <th className="py-2" width="17%">Countries</th>
                                            <th className="py-2" width="32%">Service Categories</th>
                                            <th className="py-2" width="5%">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="cdp-table__body bg-white">
                                        {permissionSets.map(row => (
                                            <tr key={row.id}>
                                                <td data-for="Title">{row.title}</td>
                                                <td data-for="Type" className="text-capitalize">{row.type}</td>
                                                <td data-for="Description">{row.description}</td>
                                                <td data-for="Applications">{getApplicationNames(row)}</td>
                                                <td data-for="Countries">{getCountryNamesFromCodes(row.countries)}</td>
                                                <td data-for="Service Categories">{getServiceCategoryNames(row)}</td>
                                                <td data-for="Action">
                                                    <Dropdown className="ml-auto dropdown-customize">
                                                        <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle btn-sm py-0 px-2 px-sm-1">
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
                            onHide={handleCreateModalHide}
                            dialogClassName="modal-90w modal-customize"
                            aria-labelledby="example-custom-modal-styling-title"
                            size="lg"
                        >
                            <Modal.Header closeButton>
                                <Modal.Title id="example-custom-modal-styling-title">
                                    {permissionSetEditID ? 'Rights of this permission set' : 'Create New Permission Set'}
                                </Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <PermissionSetForm onSuccess={handleFormSubmitSuccess} permissionSetId={permissionSetEditID} />
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
                                        Rights of this permission set
                                    </Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <PermissionSetDetails permissionSetId={props.match && props.match.params.id} />
                                </Modal.Body>
                            </Modal>}
                        </Route>
                    </div>
                </div>
            </div>
        </main >
    )
}

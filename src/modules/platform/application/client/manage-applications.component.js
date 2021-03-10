import axios from "axios";
import { Link, NavLink } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useToasts } from "react-toast-notifications";
import Dropdown from 'react-bootstrap/Dropdown';
import { LinkContainer } from 'react-router-bootstrap';
// import Faq from '../../../platform/faq/client/faq.component';
import Modal from 'react-bootstrap/Modal';
import { getApplications } from './application.actions';
import { useDispatch, useSelector } from "react-redux";
import ApplicationForm from './application-form.component';
import ApplicationDetailsModal from "./application-details.component";

export default function ManageApplications() {
    const [modalShow, setModalShow] = useState({
        createApplication: false,
        applicationDetails: false
    });
    const [isEditing, setIsEditing] = useState(false);
    // const [permissionSetDetailID, setPermissionSetDetailID] = useState(null);
    const [applicationId, setApplicationId] = useState(null);
    const [showFaq, setShowFaq] = useState(false);
    const dispatch = useDispatch();

    const applications = useSelector(state => state.applicationReducer.applications);

    const handleCloseFaq = () => setShowFaq(false);
    const handleShowFaq = () => setShowFaq(true);

    const handleCreateApplicationSuccess = () => {
        dispatch(getApplications());
        setIsEditing(false);
        setModalShow({ ...modalShow, createApplication: false });
    }

    const handleApplicationModalHide = () => {
        setModalShow({ ...modalShow, createApplication: false });
        setIsEditing(false);
    }

    const handleApplicationDetailHide = () => {
        setModalShow({ ...modalShow, applicationDetails: false });
        setApplicationId(null);
    }

    const handlepEditClick = (data) => {
        setIsEditing(true);
        setApplicationId(data.id);
        setModalShow({ ...modalShow, createApplication: true });
    }

    useEffect(() => {
        dispatch(getApplications());
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
                                <li className="breadcrumb-item active"><span>Manage Applications</span></li>
                            </ol>
                            <Dropdown className="dropdown-customize breadcrumb__dropdown d-block d-sm-none ml-2">
                                <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle btn d-flex align-items-center border-0">
                                    <i className="fas fa-arrow-left mr-2"></i> Back
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item className="px-2" href="/"><i className="fas fa-link mr-2"></i> Dashboard</Dropdown.Item>
                                    <Dropdown.Item className="px-2" href="/platform"><i className="fas fa-link mr-2"></i> Management of Customer Data platform</Dropdown.Item>
                                    <Dropdown.Item className="px-2" active><i className="fas fa-link mr-2"></i> Manage Profiles</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                            <span className="ml-auto mr-3"><i onClick={handleShowFaq} className="icon icon-help breadcrumb__faq-icon cdp-text-secondary cursor-pointer"></i></span>
                        </nav>
                        {/* <Modal show={showFaq} onHide={handleCloseFaq} size="lg" centered>
                            <Modal.Header closeButton>
                                <Modal.Title>Questions You May Have</Modal.Title>
                            </Modal.Header>
                            <Modal.Body className="faq__in-modal"><Faq topic="manage-profile" /></Modal.Body>
                        </Modal> */}
                    </div>
                </div>
                <div className="row">
                    <div className="col-12 col-sm-12">
                        <div className="d-flex justify-content-between align-items-center py-3 cdp-table__responsive-sticky-panel">
                            <h4 className="cdp-text-primary font-weight-bold mb-0">Manage Applications</h4>
                            <button className="btn cdp-btn-secondary text-white ml-auto " onClick={() => setModalShow({ ...modalShow, createApplication: true })}>
                                <i className="icon icon-plus pr-1"></i> Add New Application
                            </button>
                        </div>

                        {applications.length > 0 &&
                            <div className="table-responsive shadow-sm bg-white mb-3 cdp-table__responsive-wrapper">
                            <table className="table table-hover table-sm mb-0 cdp-table cdp-table__responsive">
                                    <thead className="cdp-bg-primary text-white cdp-table__header">
                                        <tr>
                                            <th width="20%" className="py-2">Title</th>
                                            <th width="20%" className="py-2">Email</th>
                                            <th width="10%" className="py-2">Type</th>
                                            <th width="10%" className="py-2">Is Active</th>
                                            <th width="30%" className="py-2">Description</th>
                                            <th width="20%" className="py-2">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="cdp-table__body bg-white">
                                        {applications.map(row => (
                                            <tr key={row.id}>
                                                <td data-for="Title">{row.name}</td>
                                                <td data-for="Type">{row.email}</td>
                                                <td data-for="Description">{row.type}</td>
                                                <td data-for="Is Active">{row.is_active ? 'Active' : 'Inactive'}</td>
                                                <td data-for="Is Active">{row.description || '--'}</td>
                                                <td data-for="Action">
                                                    <Dropdown className="dropdown-customize">
                                                        <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle btn-sm py-0 px-1">
                                                        </Dropdown.Toggle>
                                                        <Dropdown.Menu>
                                                            <LinkContainer to="#">
                                                                <Dropdown.Item onClick={() => handlepEditClick(row)}>Edit</Dropdown.Item>
                                                            </LinkContainer>
                                                            <LinkContainer to="#">
                                                                <Dropdown.Item
                                                                    onClick={() => {
                                                                        setApplicationId(row.id);
                                                                        setModalShow({
                                                                            ...modalShow,
                                                                            applicationDetails: true
                                                                        })}
                                                                    }
                                                                >
                                                                    Details
                                                                </Dropdown.Item>
                                                            </LinkContainer>
                                                        </Dropdown.Menu>
                                                    </Dropdown>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        }

                        {applications.length === 0 &&
                            <><div className="row justify-content-center mt-5 pt-5 mb-3">
                                <div className="col-12 col-sm-6 py-4 bg-white shadow-sm rounded text-center">
                                    <i class="icon icon-team icon-6x cdp-text-secondary"></i>
                                    <h3 className="font-weight-bold cdp-text-primary pt-4">No Application Found!</h3>
                                </div>
                            </div></>
                        }

                        <Modal
                            show={modalShow.createApplication}
                            onHide={handleApplicationModalHide}
                            dialogClassName="modal-90w modal-customize"
                            aria-labelledby="example-custom-modal-styling-title"
                            centered
                        >
                            <Modal.Header closeButton>
                                <Modal.Title id="example-custom-modal-styling-title">
                                    {isEditing ? "Update Profile" : "Create New Profile"}
                                </Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <ApplicationForm
                                    isEditing={isEditing}
                                    applicationId={applicationId}
                                    onSuccess={handleCreateApplicationSuccess}
                                />
                            </Modal.Body>
                        </Modal>
                        <ApplicationDetailsModal
                            applicationId={applicationId}
                            show={modalShow.applicationDetails}
                            onHide={handleApplicationDetailHide}
                        />
                    </div>
                </div>
            </div>
        </main >
    )
}

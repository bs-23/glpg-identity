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
import { ApplicationLog } from '../../../platform';

export default function ManageApplications() {
    const [modalShow, setModalShow] = useState({
        createApplication: false,
        applicationDetails: false,
        applicationLog: false
    });
    const [isEditing, setIsEditing] = useState(false);
    const [applicationId, setApplicationId] = useState(null);
    const [showFaq, setShowFaq] = useState(false);
    const [sort, setSort] = useState({ value: null, type: 'ASC' });
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

    const handleEditClick = (data) => {
        setIsEditing(true);
        setApplicationId(data.id);
        setModalShow({ ...modalShow, createApplication: true });
    }

    useEffect(() => {
        const query = new URLSearchParams('');

        if (sort.value) {
            query.append('orderBy', sort.value);
            if (sort.type === 'DESC') query.append('orderType', sort.type);
            dispatch(getApplications(query.toString() ?  '?' + query.toString() : ''));
        }
    }, [sort]);

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
                                <li className="breadcrumb-item active"><span>Manage Service Accounts</span></li>
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
                            <h4 className="cdp-text-primary font-weight-bold mb-0">Manage Service Accounts</h4>
                            <button className="btn cdp-btn-secondary text-white ml-auto " onClick={() => setModalShow({ ...modalShow, createApplication: true })}>
                                <i className="icon icon-plus"></i> <span className="d-none d-sm-inline-block pl-1">Add New Service Account</span>
                            </button>
                        </div>

                        {applications.length > 0 &&
                            <div className="table-responsive shadow-sm bg-white mb-3 cdp-table__responsive-wrapper">
                            <table className="table table-hover table-sm mb-0 cdp-table cdp-table__responsive">
                                    <thead className="cdp-bg-primary text-white cdp-table__header">
                                        <tr>
                                            <th width="20%" className="py-2">
                                                <span className={sort.value === 'name' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : "cdp-table__col-sorting"} onClick={() => setSort({ value: 'name', type: sort.type === 'ASC' ? 'DESC' : 'ASC' })}>
                                                    Name
                                                    <i className="icon icon-sort cdp-table__icon-sorting"></i>
                                                </span>
                                            </th>
                                            <th width="20%" className="py-2">
                                                <span className={sort.value === 'email' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : "cdp-table__col-sorting"} onClick={() => setSort({ value: 'email', type: sort.type === 'ASC' ? 'DESC' : 'ASC' })}>
                                                    Email
                                                    <i className="icon icon-sort cdp-table__icon-sorting"></i>
                                                </span>
                                            </th>
                                            <th width="10%" className="py-2">
                                                <span className={sort.value === 'type' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : "cdp-table__col-sorting"} onClick={() => setSort({ value: 'type', type: sort.type === 'ASC' ? 'DESC' : 'ASC' })}>
                                                    Type
                                                    <i className="icon icon-sort cdp-table__icon-sorting"></i>
                                                </span>
                                            </th>
                                            <th width="5%" className="py-2">
                                                <span className={sort.value === 'is_active' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : "cdp-table__col-sorting"} onClick={() => setSort({ value: 'is_active', type: sort.type === 'ASC' ? 'DESC' : 'ASC' })}>
                                                    Is Active
                                                    <i className="icon icon-sort cdp-table__icon-sorting"></i>
                                                </span>
                                            </th>
                                            <th width="30%" className="py-2">
                                                <span className={sort.value === 'description' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : "cdp-table__col-sorting"} onClick={() => setSort({ value: 'description', type: sort.type === 'ASC' ? 'DESC' : 'ASC' })}>
                                                    Description
                                                    <i className="icon icon-sort cdp-table__icon-sorting"></i>
                                                </span>
                                            </th>
                                            <th width="5%" className="py-2">
                                                <span className={sort.value === 'created_at' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : "cdp-table__col-sorting"} onClick={() => setSort({ value: 'created_at', type: sort.type === 'ASC' ? 'DESC' : 'ASC' })}>
                                                    Creation Date
                                                    <i className="icon icon-sort cdp-table__icon-sorting"></i>
                                                </span>
                                            </th>
                                            <th width="5%" className="py-2">
                                                <span className={sort.value === 'created_by' ? `cdp-table__col-sorting sorted ${sort.type.toLowerCase()}` : "cdp-table__col-sorting"} onClick={() => setSort({ value: 'created_by', type: sort.type === 'ASC' ? 'DESC' : 'ASC' })}>
                                                    Created By
                                                    <i className="icon icon-sort cdp-table__icon-sorting"></i>
                                                </span>
                                            </th>
                                            <th width="5%" className="py-2">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="cdp-table__body bg-white">
                                        {(applications || []).map(row => (
                                            <tr key={row.id}>
                                                <td data-for="Title">{row.name}</td>
                                                <td data-for="Email">{row.email}</td>
                                                <td data-for="Type">{row.type}</td>
                                                <td data-for="Is Active">{row.is_active ? 'Active' : 'Inactive'}</td>
                                                <td data-for="Description">{row.description || '--'}</td>
                                                <td data-for="Creation Date">{row.created_at ? (new Date(row.created_at)).toLocaleDateString('en-GB').replace(/\//g, '.') : '--'}</td>
                                                <td data-for="Created By">{row.createdByUser.first_name + ' ' + row.createdByUser.last_name}</td>
                                                <td data-for="Action">
                                                    <Dropdown className="dropdown-customize">
                                                        <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle btn-sm py-0 px-1">
                                                        </Dropdown.Toggle>
                                                        <Dropdown.Menu>
                                                            <LinkContainer to="#">
                                                                <Dropdown.Item onClick={() => handleEditClick(row)}>Edit</Dropdown.Item>
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
                                                            {/* <LinkContainer to="#">
                                                                <Dropdown.Item
                                                                    onClick={() => {
                                                                        setApplicationId(row.id);
                                                                        setModalShow({ ...modalShow, applicationLog: true })}
                                                                    }
                                                                >
                                                                    Log
                                                                </Dropdown.Item>
                                                            </LinkContainer> */}
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
                            size="lg"
                            centered
                            size="xl"
                        >
                            <Modal.Header closeButton>
                                <Modal.Title id="example-custom-modal-styling-title">
                                    {isEditing ? "Update Service Account" : "Create New Service Account"}
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

                        <Modal
                            show={modalShow.applicationLog}
                            onHide={() => { setModalShow({ ...modalShow, applicationLog: false }) }}
                            dialogClassName="modal-90w modal-customize"
                            aria-labelledby="example-custom-modal-styling-title"
                            size="lg"
                            centered
                            size="xl"
                        >
                            <Modal.Header closeButton>
                                <Modal.Title id="example-custom-modal-styling-title">
                                    Application Log
                                </Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <ApplicationLog id={applicationId} />
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
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { NavLink } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { Form, Formik, Field, FieldArray, ErrorMessage } from "formik";
import { getRoles, createRole } from "../user.actions";
import { roleSchema } from "../user.schema";
import { useToasts } from "react-toast-notifications";
import Modal from 'react-bootstrap/Modal';
import PermissionSetForm from './permission-set-form.component';

export default function RoleForm() {
    const [permissionSets, setPermissionSets] = useState([]);
    const [permissionModalShow, setPermissionModalShow] = useState(false);
    const [permissions, setPermissions] = useState([]);
    const [editData, setEditData] = useState({});
    const [selected, setselected] = useState([]);
    const [show, setShow] = useState(false);
    const roles = useSelector(state => state.userReducer.roles);
    const countries = useSelector(state => state.userReducer.countries);
    const dispatch = useDispatch();
    const { addToast } = useToasts();

    const setEdit = (row) => {
        const list = (row.rolePermission).map(obj => {
            return obj.permissionId;
        });
        setselected(list);

        setShow(true); setEditData(row);
    }

    const selectPermission = (permission_id, alreadySelected) => {
        if (!alreadySelected) {
            const items = [...selected, permission_id];
            setselected(items);
        }
        else {
            const items = [...selected];
            const idx = items.findIndex(i => i === permission_id);
            items.splice(idx, 1);
            setselected(items);
        }
    }

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
        if(!data.permissionSet_serviceCategory) return '';
        return data.permissionSet_serviceCategory.map(item => item.serviceCategory.title).sort().join(', ');
    }

    const handleFormSubmitSuccess = () => {
        getPermissionSets();
        setPermissionModalShow(false);
    }

    useEffect(() => {
        async function getPermissions() {
            const response = await axios.get('/api/permissions');
            setPermissions(response.data);
        }
        getPermissions();
        getPermissionSets();
        dispatch(getRoles());
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
                                <li className="breadcrumb-item active"><span>Define Roles</span></li>
                            </ol>
                        </nav>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12 col-sm-12 pt-3">



                       

                        {roles && roles.length === 0 &&
                            <><div className="row justify-content-center mt-5 pt-5 mb-3">
                                <div className="col-12 col-sm-6 py-4 bg-white shadow-sm rounded text-center">
                                    <i class="icon icon-team icon-6x cdp-text-secondary"></i>
                                    <h3 className="font-weight-bold cdp-text-primary pt-4">No Role Found!</h3>
                                </div>
                            </div></>
                        }

                        <div className="d-flex justify-content-between align-items-center mb-3 mt-4">
                            <h4 className="cdp-text-primary font-weight-bold mb-0">Define Permission Sets</h4>
                            <button className="btn cdp-btn-secondary text-white ml-auto " onClick={() => { setPermissionModalShow(true) }}>
                                <i className="icon icon-plus pr-1"></i> Add New Permission Set
                            </button>
                        </div>

                        {permissionSets.length > 0 &&
                            <div className="table-responsive shadow-sm bg-white">
                                <table className="table table-hover table-sm mb-0 cdp-table">
                                    <thead className="cdp-bg-primary text-white cdp-table__header">
                                        <tr>
                                            <th className="py-2">Title</th>
                                            <th className="py-2">Application</th>
                                            <th className="py-2">Countries</th>
                                            <th className="py-2">Service Categories</th>
                                            <th className="py-2">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="cdp-table__body bg-white">
                                        {permissionSets.map(row => (
                                            <tr key={row.id}>
                                                <td>{row.title}</td>
                                                <td>{ row.application ? row.application.name : '' }</td>
                                                <td>{ getCountryNamesFromCodes(row.countries) }</td>
                                                <td>{getServiceCategoryNames(row)}</td>
                                                <td><button className="btn cdp-btn-outline-primary btn-sm" onClick={() => setEdit(row)}> <i className="icon icon-edit-pencil pr-2"></i>Edit Permission Set</button></td>
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
                            onHide={() => setPermissionModalShow(false)}
                            dialogClassName="modal-90w modal-customize"
                            aria-labelledby="example-custom-modal-styling-title"
                            size="lg"
                        >
                            <Modal.Header closeButton>
                                <Modal.Title id="example-custom-modal-styling-title">
                                    Create New Permission Set
                                </Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <PermissionSetForm onSuccess={handleFormSubmitSuccess} />
                            </Modal.Body>
                        </Modal>

                    </div>
                </div>
            </div>
        </main >
    )
}

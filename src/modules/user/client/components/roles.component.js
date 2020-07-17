import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { NavLink } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { Form, Formik, Field, ErrorMessage } from "formik";
import { getRoles, createRole } from "../user.actions";
import { roleSchema } from "../user.schema";
import { useToasts } from "react-toast-notifications";
import Modal from 'react-bootstrap/Modal';

export default function RoleForm() {
    const dispatch = useDispatch();
    const [permissions, setPermissions] = useState([]);
    const roles = useSelector(state => state.userReducer.roles);
    const { addToast } = useToasts();
    const [show, setShow] = useState(false);
    const [editData, setEditData] = useState({});
    const [selected, setselected] = useState(["b217c5c0-0dec-4663-92fe-7f75b8a378e6", "d8e50ff2-64e2-4c98-ae4e-cf554721b5ed"]);

    const setEdit = (row) => {

        const list = (row.rolePermission).map(obj => {
            return obj.permissionId;
        });
        setselected(list);

        setShow(true); setEditData(row);
    }
    useEffect(() => {
        async function getPermissions() {
            const response = await axios.get('/api/permissions');
            setPermissions(response.data);
        }
        getPermissions();

        dispatch(getRoles());
    }, []);

    return (
        <main className="app__content">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb rounded-0 my-0">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item"><NavLink to="/users">User Management</NavLink></li>
                                <li className="breadcrumb-item active">Roles</li>
                            </ol>
                        </nav>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12 col-sm-12 py-3 d-flex justify-content-between align-items-center">
                        <h2>Manage User Roles</h2>
                        <button className="btn cdp-btn-primary btn-sm text-white" onClick={() => { setShow(true); setEditData({}); }}>
                            Add New Role
                        </button>

                        <Modal
                            show={show}
                            onHide={() => setShow(false)}
                            dialogClassName="modal-90w"
                            aria-labelledby="example-custom-modal-styling-title"
                        >
                            <Modal.Header closeButton>
                                <Modal.Title id="example-custom-modal-styling-title">
                                    {editData.id ? 'Edit Role' : 'Add New Role'}
                                </Modal.Title>
                            </Modal.Header>

                            <Modal.Body>
                                <div className="add-role p-3">
                                    <Formik
                                        initialValues={{
                                            name: editData.name,
                                            description: editData.description,
                                            permissions: selected
                                        }}
                                        displayName="UserForm"
                                        validationSchema={roleSchema}
                                        onSubmit={(values, actions) => {
                                            if (editData && editData.id) {

                                                axios.put(`/api/roles/${editData.id}`, values)
                                                    .then(function (response) {
                                                        console.log(response);
                                                        dispatch(getRoles());
                                                    })
                                                    .catch(function (error) {
                                                        console.log(error);
                                                    });

                                            } else {
                                                dispatch(createRole(values)).then(res => {
                                                    actions.resetForm();
                                                    addToast('Role created successfully', {
                                                        appearance: 'success',
                                                        autoDismiss: true
                                                    });
                                                }).catch(err => {
                                                    const errorMessage = typeof err.response.data === 'string' ? err.response.data : err.response.statusText;
                                                    addToast(errorMessage, {
                                                        appearance: 'error',
                                                        autoDismiss: true
                                                    });
                                                });
                                            }
                                            setShow(false);
                                            actions.setSubmitting(false);
                                        }}
                                    >
                                        {formikProps => (
                                            <Form onSubmit={formikProps.handleSubmit}>
                                                <div className="row">
                                                    <div className="col-12 col-sm-12">
                                                        <div className="form-group">
                                                            <label htmlFor="role_name">Role Name</label>
                                                            <Field data-testid="role_name" className="form-control" type="name" name="name" />
                                                            <div className="invalid-feedback" data-testid="lastNameError"><ErrorMessage name="name" /></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-12 col-sm-12">
                                                        <div className="form-group">
                                                            <label htmlFor="role_description">Role Description</label>
                                                            <Field data-testid="role_description" className="form-control" as="textarea" type="name" name="description" />
                                                            <div className="invalid-feedback" data-testid="RoleDescriptionNameError"><ErrorMessage name="description" /></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-12 col-sm-12">
                                                        <div className="form-group">
                                                            <label htmlFor="permissions">Assign Service Category</label>
                                                            <Field data-testid="permission" as="select" name="permissions" className="form-control" multiple >
                                                                {permissions.map(item => <option key={item.id} value={item.id} onClick={() => setselected([item.id])}>{item.title}</option>)}
                                                            </Field>
                                                            <div className="invalid-feedback">
                                                                <ErrorMessage name="permissions" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button type="submit" className="btn btn-block text-white cdp-btn-secondary mt-4 p-2" disabled={formikProps.isSubmitting}>Submit</button>
                                            </Form>
                                        )}
                                    </Formik>
                                </div>
                            </Modal.Body>
                        </Modal>
                    </div>
                    <div className="col-12 col-sm-12 py-3 d-flex justify-content-between align-items-center">
                        {roles && roles.length > 0 &&
                            <table className="table table-hover table-sm mb-0">
                                <thead className="cdp-light-bg">
                                    <tr>
                                        <th className="py-2">Role Name</th>
                                        <th className="py-2">Description</th>
                                        <th className="py-2">Assigned Service Category</th>
                                        <th className="py-2">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {roles.map(row => (
                                        <tr key={row.id}>
                                            <td>{row.name}</td>
                                            <td>{row.description}</td>
                                            {/* <td>{JSON.stringify(row.rolePermission)}</td> */}
                                            <td>{(row.rolePermission).map((item, index) => (
                                                <span key={index}>{(permissions.find(i => i.id === item.permissionId)).title}{index < row.rolePermission.length - 1 ? ',' : ''}</span>
                                            ))}</td>
                                            <td><button className="btn btn-outline-primary btn-sm" onClick={() => setEdit(row)}> <i className="far fa-user-circle pr-1"></i>Edit</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        }

                        {roles && roles.length === 0 &&
                            <><div className="alert alert-info mt-5">No role found!</div></>
                        }
                    </div>
                </div>
            </div>
        </main >
    )
}

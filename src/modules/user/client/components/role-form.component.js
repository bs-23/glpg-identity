import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useHistory } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { Form, Formik, Field, ErrorMessage } from "formik";
import { getRoles } from "../user.actions";
import { registerSchema } from "../user.schema";
import { useToasts } from "react-toast-notifications";
import Modal from 'react-bootstrap/Modal';

export default function RoleForm() {
    const dispatch = useDispatch();
    const [permissions, setPermissions] = useState([]);
    const roles = useSelector(state => state.userReducer.roles);
    const history = useHistory()
    const { addToast } = useToasts();
    const [show, setShow] = useState(false);

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
                                <li className="breadcrumb-item"><NavLink to="/users/list">User List</NavLink></li>
                                <li className="breadcrumb-item active">Add new</li>
                            </ol>
                        </nav>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12 col-sm-12 py-3 d-flex justify-content-between align-items-center">
                        <h2>Create new Role</h2>
                        <button className="btn cdp-btn-primary btn-sm text-white" onClick={() => setShow(true)}>
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
                                    Add New Role
                            </Modal.Title>
                            </Modal.Header>
                            <Modal.Body>

                                <div className="add-role p-3">
                                    <Formik
                                        initialValues={{
                                            role_name: "",
                                            role_description: "",
                                            permissions: [],
                                        }}
                                        displayName="UserForm"
                                        validationSchema={registerSchema}
                                        onSubmit={(values, actions) => {
                                            dispatch(createUser(values))
                                                .then(res => {
                                                    actions.resetForm();
                                                    addToast('User created successfully', {
                                                        appearance: 'success',
                                                        autoDismiss: true
                                                    });
                                                    history.push(`/users/${res.value.data.id}`)
                                                }).catch(err => {
                                                    const errorMessage = typeof err.response.data === 'string' ? err.response.data : err.response.statusText
                                                    addToast(errorMessage, {
                                                        appearance: 'error',
                                                        autoDismiss: true
                                                    });
                                                });
                                            actions.setSubmitting(false);
                                        }}
                                    >
                                        {formikProps => (
                                            <Form onSubmit={formikProps.handleSubmit}>
                                                <div className="row">
                                                    <div className="col-12 col-sm-12">
                                                        <div className="form-group">
                                                            <label htmlFor="role_name">Role Name: </label>
                                                            <Field data-testid="role_name" className="form-control" type="name" name="role_name" />
                                                            <div className="invalid-feedback" data-testid="lastNameError"><ErrorMessage name="role_name" /></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-12 col-sm-12">
                                                        <div className="form-group">
                                                            <label htmlFor="role_description">Role Description: </label>
                                                            <Field data-testid="role_description" className="form-control" as="textarea" type="name" name="role_description" />
                                                            <div className="invalid-feedback" data-testid="RoleDescriptionNameError"><ErrorMessage name="role_description" /></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-12 col-sm-12">
                                                        <div className="form-group">
                                                            <label htmlFor="permissions">Assign Service Category</label>
                                                            <Field data-testid="permission" as="select" name="permissions" className="form-control" multiple>
                                                                {permissions.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
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
                                        <th className="py-2">First Name</th>
                                        <th className="py-2">Last Name</th>
                                        <th className="py-2">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {roles.map(row => (
                                        <tr key={row.id}>
                                            <td>{row.name}</td>
                                            <td>{row.description}</td>
                                            <td></td>
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

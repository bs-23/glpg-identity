import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { NavLink } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { Form, Formik, Field, FieldArray, ErrorMessage } from "formik";
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
    const [selected, setselected] = useState([]);

    const setEdit = (row) => {
        const list = (row.rolePermission).map(obj => {
            return obj.permissionId;
        });
        setselected(list);

        setShow(true); setEditData(row);
    }

    const selectPermission = (permission_id, alreadySelected) => {
        if(!alreadySelected) {
            const items = [...selected, permission_id];
            setselected(items);
        }
        else{
            const items = [...selected];
            const idx = items.findIndex(i => i === permission_id);
            items.splice(idx, 1);
            setselected(items);
        }
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
        <main className="app__content cdp-light-bg">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb rounded-0 my-0">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item"><NavLink to="/users">Management of Customer Data platform</NavLink></li>
                                <li className="breadcrumb-item active"><span>Manage User Roles</span></li>
                            </ol>
                        </nav>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12 col-sm-12 pt-3">
                        <div className="d-flex justify-content-between align-items-center mb-3 mt-4">
                            <h4 className="cdp-text-primary font-weight-bold mb-0">Manage User Roles</h4>
                            <button className="btn cdp-btn-secondary text-white ml-auto " onClick={() => { setShow(true); setEditData({}); setselected([]); }}>
                                <i className="fas fa-plus pr-1"></i> Add New Role
                            </button>
                        </div>

                        <Modal
                            show={show}
                            onHide={() => setShow(false)}
                            dialogClassName="modal-90w modal-customize"
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
                                            name: editData.name ? editData.name : '',
                                            description: editData.description ? editData.description : '',
                                            permissions: editData.rolePermission ? selected : []
                                        }}
                                        displayName="UserForm"
                                        validationSchema={roleSchema}
                                        onSubmit={(values, actions) => {
                                            console.log("=================== ====================>", {...values, permissions: editData.rolePermission ? selected : []} );
                                            if (editData && editData.id) {

                                                axios.put(`/api/roles/${editData.id}`, {...values, permissions: editData.rolePermission ? selected : []} )
                                                    .then(function (response) {
                                                        dispatch(getRoles());
                                                    })
                                                    .catch(function (error) {
                                                        console.log(error);
                                                    });

                                            } else {
                                                dispatch(createRole(values)).then(res => {
                                                    dispatch(getRoles());

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
                                            actions.resetForm();

                                        }}
                                    >
                                        {formikProps => (
                                            <Form onSubmit={formikProps.handleSubmit}>
                                                <div className="row">
                                                    <div className="col-12 col-sm-12">
                                                        <div className="form-group">
                                                            <label className="font-weight-bold" htmlFor="role_name">Role Name <span className="text-danger">*</span></label>
                                                            <Field data-testid="role_name" className="form-control" type="name" name="name" />
                                                            <div className="invalid-feedback" data-testid="lastNameError"><ErrorMessage name="name" /></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-12 col-sm-12">
                                                        <div className="form-group">
                                                            <label className="font-weight-bold" htmlFor="role_description">Role Description</label>
                                                            <Field data-testid="role_description" className="form-control" as="textarea" type="name" name="description" />
                                                            <div className="invalid-feedback" data-testid="RoleDescriptionNameError"><ErrorMessage name="description" /></div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="row">
                                                    <div className="col-12 col-sm-12">
                                                        <div className="form-group">
                                                            <label className="font-weight-bold" >Assign Service Category <span className="text-danger">*</span></label>
                                                            <FieldArray 
                                                                name="permissions"
                                                                render ={arrayHelpers => (
                                                                    <ul className="list-unstyled pl-0 py-2 mb-0">
                                                                        {
                                                                            permissions.map(permission => 
                                                                                <li key={permission.id} className="">
                                                                                    <label className="d-flex justify-content-between align-items-center">
                                                                                        <span className="switch-label">{permission.title}</span>
                                                                                        <span className="switch">
                                                                                            <input 
                                                                                                name="permissions"
                                                                                                type="checkbox" 
                                                                                                value={permission}
                                                                                                checked={ selected.includes(permission.id) } 
                                                                                                onChange={e => {
                                                                                                    if(e.target.checked){
                                                                                                        arrayHelpers.push(permission.id)
                                                                                                    }
                                                                                                    else{
                                                                                                        const idx = permissions.indexOf(p => p.id === permission.id)
                                                                                                        arrayHelpers.remove(idx);
                                                                                                    }
                                                                                                }}
                                                                                                onClick={() => { selectPermission(permission.id, selected.find(s=> s === permission.id) ? true : false) } }  
                                                                                            />
                                                                                            <span className="slider round"></span>
                                                                                        </span>
                                                                                    </label>
                                                                                </li>
                                                                            )
                                                                            
                                                                        }
                                                                    </ul>
                                                                )}
                                                            />
                                                            
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
                    
                    {permissions.length && roles && roles.length > 0 &&
                        <table className="table table-hover table-sm mb-0 cdp-table shadow-sm">
                            <thead className="cdp-bg-primary text-white cdp-table__header">
                                <tr>
                                    <th className="py-2">Role Name</th>
                                    <th className="py-2">Description</th>
                                    <th className="py-2">Assigned Service Category</th>
                                    <th className="py-2">Action</th>
                                </tr>
                            </thead>
                            <tbody className="cdp-table__body bg-white">
                                {roles.map(row => (
                                    <tr key={row.id}>
                                        <td>{row.name}</td>
                                        <td>{row.description}</td>
                                        {/* <td>{JSON.stringify(row.rolePermission)}</td> */}
                                        <td>{(row.rolePermission) && (row.rolePermission).map((item, index) => (
                                            <span key={index}>{(permissions.find(i => i.id === item.permissionId)).title}{index < row.rolePermission.length - 1 ? ', ' : ''}</span>
                                        ))}</td>
                                        <td><button className="btn cdp-btn-outline-primary btn-sm" onClick={() => setEdit(row)}> <i className="fas fa-pen pr-2"></i>Edit Role</button></td>
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

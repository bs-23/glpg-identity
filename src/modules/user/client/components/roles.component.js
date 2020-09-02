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
    const [permissions, setPermissions] = useState([]);
    const [editData, setEditData] = useState({});
    const [selected, setselected] = useState([]);
    const [show, setShow] = useState(false);
    const roles = useSelector(state => state.userReducer.roles);
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
                    </div>
                </div>
            </div>
        </main >
    )
}

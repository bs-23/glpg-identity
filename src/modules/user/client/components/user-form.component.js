import axios from "axios";
import { useDispatch } from "react-redux";
import { NavLink, useHistory } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { Form, Formik, Field, FieldArray, ErrorMessage } from "formik";
import { createUser } from "../user.actions";
import { registerSchema } from "../user.schema";
import { useToasts } from "react-toast-notifications";


export default function UserForm() {
    const dispatch = useDispatch();
    const [countries, setCountries] = useState([]);
    const [roles, setRoles] = useState([]);
    const [applications, setApplications] = useState([]);
    const [selectedRoles, setSelectedRoles] = useState([]);
    const history = useHistory()
    const { addToast } = useToasts()

    useEffect(() => {
        async function getCountries() {
            const response = await axios.get('/api/countries');
            setCountries(response.data);
        }
        async function getAppplications() {
            const response = await axios.get('/api/applications');
            setApplications(response.data);
        }
        async function getRoles() {
            const response = await axios.get('/api/roles');
            setRoles(response.data);
        }
        getCountries();
        getAppplications();
        getRoles();
    }, []);

    const selectRole = (role_id, alreadySelected) => {
        if(!alreadySelected) {
            const items = [...selectedRoles, role_id];
            setSelectedRoles(items);
        }
        else{
            const items = [...selectedRoles];
            // const idx = items.findIndex(i => i === role_id);
            const idx = items.indexOf(role_id);
            items.splice(idx, 1);
            setSelectedRoles(items);
        }
    }

    return (
        <main className="app__content cdp-light-bg">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb rounded-0">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item"><NavLink to="/users">Management of Customer Data platform</NavLink></li>
                                <li className="breadcrumb-item"><NavLink to="/users/list">CDP User List</NavLink></li>
                                <li className="breadcrumb-item active"><span>Add New User</span></li>
                            </ol>
                        </nav>
                    </div>
                </div>
                {applications.length > 0 && countries &&
                <div className="row">
                    <div className="col-12">
                        <div className="shadow-sm bg-white">
                            <h2 className="d-flex align-items-center p-3 p-sm-5 page-title light">
                                <span className="page-title__text font-weight-bold">Create New User</span>
                            </h2>
                            <div className="add-user p-3">
                                <Formik
                                    initialValues={{
                                        first_name: "",
                                        last_name: "",
                                        email: "",
                                        countries: [],
                                        roles: [],
                                        application_id: applications[0].id,
                                        phone: ""
                                    }}
                                    displayName="UserForm"
                                    validationSchema={registerSchema}
                                    onSubmit={(values, actions) => {
                                        console.log(values);
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
                                                <div className="col-12 col-lg-6">
                                                    <div className="row">
                                                        <div className="col-12 col-sm-6">
                                                            <div className="form-group">
                                                                <label className="font-weight-bold" htmlFor="first_name">First Name</label>
                                                                <Field data-testid="first_name" className="form-control" type="name" name="first_name" />
                                                                <div className="invalid-feedback" data-testid="firstNameError"><ErrorMessage name="first_name" /></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-12 col-sm-6">
                                                            <div className="form-group">
                                                                <label className="font-weight-bold" htmlFor="last_name">Last Name</label>
                                                                <Field data-testid="last_name" className="form-control" type="name" name="last_name" />
                                                                <div className="invalid-feedback" data-testid="lastNameError"><ErrorMessage name="last_name" /></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-12 col-sm-6">
                                                            <div className="form-group">
                                                                <label className="font-weight-bold" htmlFor="email">Email</label>
                                                                <Field data-testid="email" className="form-control" type="email" name="email" autoComplete="username" />
                                                                <div className="invalid-feedback" data-testid="emailError"><ErrorMessage name="email" /></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-12 col-sm-6">
                                                            <div className="form-group">
                                                                <label className="font-weight-bold" htmlFor="phone">Phone Number <span className="optional font-weight-normal">(Optional)</span></label>
                                                                <Field data-testid="phone" className="form-control" type="text" name="phone" />
                                                                <div className="invalid-feedback">
                                                                    <ErrorMessage name="phone" data-testid="phoneError" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-12 col-sm-6">
                                                            <div className="form-group">
                                                                <label className="font-weight-bold" htmlFor="application_id">Select Application</label>
                                                                <Field data-testid="application" as="select" name="application_id" className="form-control">
                                                                    {applications.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                                                                </Field>
                                                            </div>
                                                        </div>
                                                        <div className="col-12 col-sm-6">
                                                            <div className="form-group">
                                                                {/* <label className="font-weight-bold" htmlFor="roles">Select Roles</label> */}
                                                                {/* <Field data-testid="role" as="select" name="roles" className="form-control" multiple>
                                                                    {roles.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                                                                </Field> */}

                                                                <div className="row">
                                                                    <div className="col-12 col-sm-12">
                                                                        <div className="form-group">
                                                                            <label className="font-weight-bold" >Select Roles</label>
                                                                            <FieldArray 
                                                                                name="roles"
                                                                                render ={arrayHelpers => (
                                                                                    <ul className="list-unstyled pl-0 py-3">
                                                                                        {
                                                                                            roles.map(role => 
                                                                                                <li key={role.id} className="">
                                                                                                    <label className="d-flex justify-content-between align-items-center">
                                                                                                        <span>{role.name}</span>
                                                                                                        <span className="switch">
                                                                                                            <input 
                                                                                                                name="roles"
                                                                                                                type="checkbox" 
                                                                                                                value={role}
                                                                                                                checked={  selectedRoles.includes(role.id) } 
                                                                                                                onChange={e => {
                                                                                                                    if(e.target.checked){
                                                                                                                        arrayHelpers.push(role.id);
                                                                                                                    }
                                                                                                                    else{
                                                                                                                        const idx = roles.indexOf(r => r.id === role.id);
                                                                                                                        arrayHelpers.remove(idx);
                                                                                                                    }
                                                                                                                }}
                                                                                                                onClick={() => { selectRole(role.id, selectedRoles.find(s=> s === role.id) ? true : false) } }  
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
                                                                                <ErrorMessage name="roles" />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                {/* <div className="invalid-feedback">
                                                                    <ErrorMessage name="roles" />
                                                                </div> */}
                                                            </div>
                                                        </div>
                                                        <div className="col-12 col-sm-6">
                                                            <div className="form-group">
                                                                <label className="font-weight-bold" htmlFor="countries">Select Countries</label>
                                                                <Field data-testid="country" as="select" name="countries" className="form-control" multiple>
                                                                    {countries.map(item => <option key={item.countryid} value={item.country_iso2}>{item.countryname}</option>)}
                                                                </Field>
                                                                <div className="invalid-feedback">
                                                                    <ErrorMessage name="countries" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button type="submit" className="btn btn-block text-white cdp-btn-secondary mt-4 p-2" >Submit</button>
                                                </div>
                                            </div>
                                        </Form>
                                    )}
                                </Formik>
                            </div>
                        </div>
                    </div>
                </div>
                }
            </div>
        </main>
    )
}

import axios from "axios";
import { useDispatch } from "react-redux";
import { NavLink, useHistory } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { Form, Formik, Field, ErrorMessage } from "formik";
import { createUser } from "../user.actions";
import { registerSchema } from "../user.schema";


export default function UserForm() {
    const dispatch = useDispatch();
    const [countries, setCountries] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const history = useHistory()

    useEffect(() => {
        async function getCountries() {
            const response = await axios.get('/api/countries');
            setCountries(response.data);
        }
        async function getPermissions() {
            const response = await axios.get('/api/permissions');
            setPermissions(response.data);
        }
        getCountries();
        getPermissions();
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
                    <div className="col-12 col-sm-6 py-3">
                        <h2 className="mb-3">Create new user</h2>
                        <div className="add-user p-3">
                            <Formik
                                initialValues={{
                                    first_name: "",
                                    last_name: "",
                                    email: "",
                                    countries: [],
                                    permissions: [],
                                    phone: "",
                                    expiary_date: ""
                                }}
                                displayName="UserForm"
                                validationSchema={registerSchema}
                                onSubmit={(values, actions) => {
                                    dispatch(createUser(values))
                                        .then(res => {
                                            actions.resetForm();
                                            history.push(`/users/${res.value.data.id}`)
                                        });
                                    actions.setSubmitting(false);
                                }}
                            >
                                {formikProps => (
                                    <Form onSubmit={formikProps.handleSubmit}>
                                        <div className="row">
                                            <div className="col-12 col-sm-6">
                                                <div className="form-group">
                                                    <label htmlFor="first_name">First Name</label>
                                                    <Field data-testid="first_name" className="form-control" type="name" name="first_name" />
                                                    <div className="invalid-feedback" data-testid="firstNameError"><ErrorMessage name="first_name" /></div>
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-6">
                                                <div className="form-group">
                                                    <label htmlFor="last_name">Last Name</label>
                                                    <Field data-testid="last_name" className="form-control" type="name" name="last_name" />
                                                    <div className="invalid-feedback" data-testid="lastNameError"><ErrorMessage name="last_name" /></div>
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-6">
                                                <div className="form-group">
                                                    <label htmlFor="email">Email</label>
                                                    <Field data-testid="email" className="form-control" type="email" name="email" autoComplete="username" />
                                                    <div className="invalid-feedback" data-testid="emailError"><ErrorMessage name="email" /></div>
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-6">
                                                <div className="form-group">
                                                    <label htmlFor="phone">Phone:</label>
                                                    <Field data-testid="phone" className="form-control" type="text" name="phone" />
                                                    <div className="invalid-feedback">
                                                        <ErrorMessage name="phone" data-testid="phoneError" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-12 col-sm-6">
                                                <div className="form-group">
                                                    <label htmlFor="expiary_date">Valid Until</label>
                                                    <Field className="form-control" type="date" name="expiary_date" />
                                                    <div className="invalid-feedback">
                                                        <ErrorMessage name="expiary_date" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-12 col-sm-6">
                                                <div className="form-group">
                                                    <label htmlFor="countries">Select Countries</label>
                                                    <Field data-testid="country" as="select" name="countries" className="form-control" multiple>
                                                        {countries.map(item => <option key={item.countryid} value={item.country_iso2}>{item.countryname}</option>)}
                                                    </Field>
                                                    <div className="invalid-feedback">
                                                        <ErrorMessage name="countries" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-6">
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
                    </div>
                </div>
            </div>
        </main>
    )
}

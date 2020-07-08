import axios from "axios";
import { useDispatch } from "react-redux";
import { NavLink } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { Form, Formik, Field, ErrorMessage } from "formik";
import { createUser } from "../user.actions";
import { registerSchema } from "../user.schema";

export default function UserForm() {
    const permissionList = [
        { id: 0, value: 'User Management' },
        { id: 1, value: 'HCP Management' },
        { id: 2, value: 'Persona Management' },
        { id: 4, value: 'Email Campaign' }
    ];

    const dispatch = useDispatch();
    const [countries, setCountries] = useState([]);

    useEffect(() => {
        async function getCountries() {
            const response = await axios.get('/api/cdp/countries');
            setCountries(response.data);
        }
        getCountries();
    }, []);

    return (
        <main className="app__content">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb rounded-0">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item"><NavLink to="/users">User Management</NavLink></li>
                                <li className="breadcrumb-item active">Add new</li>
                            </ol>
                        </nav>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <div>
                            <div className="d-flex justify-content-between align-items-center">
                                <h2 className="mb-3">Create new user</h2>
                            </div>

                            <div className="row">
                                <div className="col-12 col-sm-6">
                                    <Formik
                                        initialValues={{
                                            name: "",
                                            email: "",
                                            password: "",
                                            countries: [],
                                            permissions: [],
                                            phone: ""
                                        }}
                                        displayName="UserForm"
                                        validationSchema={registerSchema}
                                        onSubmit={(values, actions) => {
                                            dispatch(createUser(values));
                                            actions.resetForm();
                                            actions.setSubmitting(false);
                                        }}
                                    >
                                        {formikProps => (
                                            <Form onSubmit={formikProps.handleSubmit}>
                                                <div className="form-group">
                                                    <Field data-testid="name" className="form-control" type="name" name="name" placeholder="Name" />
                                                    <div className="invalid-feedback" data-testid="nameError"><ErrorMessage name="name" /></div>
                                                </div>
                                                <div className="form-group">
                                                    <Field data-testid="email" className="form-control" type="email" name="email" placeholder="Email address" autoComplete="username" />
                                                    <div className="invalid-feedback" data-testid="emailError"><ErrorMessage name="email" /></div>
                                                </div>
                                                <div className="form-group">
                                                    <Field data-testid="password" className="form-control" type="password" name="password" placeholder="Password" autoComplete="current-password" />
                                                    <div className="invalid-feedback" data-testid="passwordError"><ErrorMessage name="password" /></div>
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="country">Select Countries:</label>
                                                    <Field data-testid="country" as="select" name="countries" className="form-control" multiple>
                                                        {countries.map(item => <option key={item.countryid} value={item.countryid}>{item.countryname}</option>)}
                                                    </Field>
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="permissions">Grant Permissions:</label>
                                                    <Field data-testid="permission" as="select" name="permissions" className="form-control" multiple>
                                                        {permissionList.map(item => <option key={item.id} value={item.value}>{item.value}</option>)}
                                                    </Field>
                                                </div>
                                                <div className="form-group">
                                                    <Field data-testid="phone" className="form-control" type="text" name="phone" placeholder="Phone" />
                                                    <div className="invalid-feedback">
                                                        <ErrorMessage name="phone" data-testid="phoneError" />
                                                    </div>
                                                </div>
                                                <button type="submit" className="btn btn-info btn-block" disabled={formikProps.isSubmitting}>Submit</button>
                                            </Form>
                                        )}
                                    </Formik>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

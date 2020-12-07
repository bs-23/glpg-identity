import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useHistory } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { Form, Formik, Field, ErrorMessage } from "formik";
import { createUser } from "../user.actions";
import { registerSchema } from "../user.schema";
import { useToasts } from "react-toast-notifications";
import Dropdown from 'react-bootstrap/Dropdown';
import CountryCodes from 'country-codes-list';

export default function UserForm() {
    const dispatch = useDispatch();
    const [selectedCountryCode, setSelectedCountryCode] = useState(0);
    const [profiles, setProfiles] = useState([]);
    const [roles, setRoles] = useState([]);
    const history = useHistory();
    const { addToast } = useToasts();

    const CountryCodesObject = CountryCodes.customList('countryCode', '+{countryCallingCode}');
    const countries = useSelector(state => state.countryReducer.countries);

    const generateCountryIconPath = (country) => {
        if(country) return `/assets/flag/flag-${country.toLowerCase().replace(/ /g, "-")}.svg`;
        return `/assets/flag/flag-placeholder.svg`;
    }

    useEffect(() => {
        async function getProfile() {
            const response = await axios.get('/api/profiles');
            setProfiles(response.data.filter(item => item.slug !== 'system_admin'));
        }
        async function getRole() {
            const response = await axios.get('/api/roles');
            setRoles(response.data);

        }
        getProfile();
        getRole();
    }, []);

    return (
        <main className="app__content cdp-light-bg">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb rounded-0">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item"><NavLink to="/platform/">Management of Customer Data platform</NavLink></li>
                                <li className="breadcrumb-item"><NavLink to="/platform/users">CDP User List</NavLink></li>
                                <li className="breadcrumb-item active"><span>Add New User</span></li>
                            </ol>
                        </nav>
                    </div>
                </div>
                {countries && countries.length &&
                    <div className="row">
                        <div className="col-12">
                            <div className="shadow-sm bg-white mb-3">
                                <h2 className="d-flex align-items-center p-3 px-sm-4 py-sm-4 page-title light">
                                    <span className="page-title__text font-weight-bold py-3">Create New User</span>
                                </h2>
                                <div className="add-user p-3">
                                    <Formik
                                        initialValues={{
                                            first_name: "",
                                            last_name: "",
                                            email: "",
                                            country_code: countries[selectedCountryCode] ? CountryCodesObject[countries[selectedCountryCode].country_iso2] : "",
                                            phone: '',
                                            profile: '',
                                            role: '',
                                            permission_sets: []
                                        }}
                                        displayName="UserForm"
                                        validationSchema={registerSchema}
                                        onSubmit={(values, actions) => {
                                            values.country_code = CountryCodesObject[countries[selectedCountryCode].country_iso2];
                                            dispatch(createUser(values))
                                                .then(res => {
                                                    actions.resetForm();
                                                    addToast('User created successfully', {
                                                        appearance: 'success',
                                                        autoDismiss: true
                                                    });
                                                    history.push(`/platform/users/${res.value.data.id}`)
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
                                                <div className="col-12 col-lg-8 col-xl-6">
                                                        <div className="row">
                                                            <div className="col-12 col-sm-6">
                                                                <div className="form-group">
                                                                    <label className="font-weight-bold" htmlFor="first_name">First Name <span className="text-danger">*</span></label>
                                                                    <Field data-testid="first_name" className="form-control" type="name" name="first_name" />
                                                                    <div className="invalid-feedback" data-testid="firstNameError"><ErrorMessage name="first_name" /></div>
                                                                </div>
                                                            </div>
                                                            <div className="col-12 col-sm-6">
                                                                <div className="form-group">
                                                                    <label className="font-weight-bold" htmlFor="last_name">Last Name <span className="text-danger">*</span></label>
                                                                    <Field data-testid="last_name" className="form-control" type="name" name="last_name" />
                                                                    <div className="invalid-feedback" data-testid="lastNameError"><ErrorMessage name="last_name" /></div>
                                                                </div>
                                                            </div>
                                                            <div className="col-12 col-sm-6">
                                                                <div className="form-group">
                                                                    <label className="font-weight-bold" htmlFor="email">Email <span className="text-danger">*</span></label>
                                                                    <Field data-testid="email" className="form-control" type="email" name="email" autoComplete="username" />
                                                                    <div className="invalid-feedback" data-testid="emailError"><ErrorMessage name="email" /></div>
                                                                </div>
                                                            </div>
                                                            <div className="col-12 col-sm-6">
                                                                <div className="form-group">
                                                                    <label className="font-weight-bold" htmlFor="phone">Phone Number</label>
                                                                    <div className="phone-list">
                                                                        <div className="input-group phone-input">
                                                                            <span className="input-group-btn">
                                                                                <Dropdown>
                                                                                    {
                                                                                        countries.map( (country, index) => {
                                                                                            return index === selectedCountryCode ? (
                                                                                            <Dropdown.Toggle key={index} variant="" className="p-1 pt-2 px-2 pr-0 d-flex align-items-center rounded-0">
                                                                                                <img height="20" width="20" src={generateCountryIconPath(country.codbase_desc)} title={country.codbase_desc} />
                                                                                                <span className="country-phone-code pl-1">{ CountryCodesObject[country.country_iso2] }</span>
                                                                                            </Dropdown.Toggle>) : null
                                                                                        })
                                                                                    }
                                                                                    <Dropdown.Menu>
                                                                                        {
                                                                                            countries.map( (country, index) => {
                                                                                                return index === selectedCountryCode ? null :
                                                                                                (<Dropdown.Item onClick={() => {
                                                                                                    setSelectedCountryCode(index);
                                                                                                    const countryCode = CountryCodesObject[countries[index].country_iso2];
                                                                                                    formikProps.setFieldValue('country_code', countryCode);
                                                                                                }} key={index} className="px-2 d-flex align-items-center">
                                                                                                    <img height="20" width="20" src={generateCountryIconPath(country.codbase_desc)} title={country.codbase_desc} />
                                                                                                    <span className="country-name pl-2">{ country.codbase_desc }</span>
                                                                                                    <span className="country-phone-code pl-1">{ CountryCodesObject[country.country_iso2] }</span>
                                                                                                </Dropdown.Item>)
                                                                                            })
                                                                                        }
                                                                                    </Dropdown.Menu>
                                                                                </Dropdown>
                                                                            </span>
                                                                            <Field data-testid="phone" className="form-control rounded" type="text" name="phone" />
                                                                        </div>
                                                                    </div>
                                                                <div className="invalid-feedback">
                                                                    <ErrorMessage name="phone" data-testid="phoneError" />
                                                                </div>
                                                            </div>

                                                            </div>
                                                            <div className="col-12 col-sm-6">
                                                                <div className="form-group">
                                                                    <label className="font-weight-bold" htmlFor="profile">Profile Type <span className="text-danger">*</span></label>
                                                                    <Field as="select" name="profile" className="form-control">
                                                                        <option className="p-2" value={''}> Select a profile </option>)
                                                                        {profiles ? profiles.map(profile => (<option className="p-2" key={profile.id} value={profile.id}>{profile.title}</option>)) : null}
                                                                    </Field>
                                                                    <div className="invalid-feedback">
                                                                        <ErrorMessage name="profile" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-12 col-sm-6">
                                                                {roles && roles.length ? <div className="form-group">
                                                                    <label className="font-weight-bold" htmlFor="role">User Role</label>
                                                                    <Field as="select" name="role" className="form-control">
                                                                        <option className="p-2" defaultValue value={""}> Select a role </option>
                                                                        {roles ? roles.map(role => <option className="p-2" key={role.id} value={role.id}>{role.title}</option>) : null }
                                                                    </Field>
                                                                    <div className="invalid-feedback">
                                                                        <ErrorMessage name="role" />
                                                                </div>
                                                            </div> : <div className="pt-sm-3 mt-sm-2">No roles are found. <NavLink className="link-secondary" to="/platform/roles">Please click here to manage roles</NavLink></div>}
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

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
    const [phoneFieldRef, setPhoneFieldRef] = useState(null);
    const [profiles, setProfiles] = useState([]);
    const [roles, setRoles] = useState([]);
    const history = useHistory();
    const { addToast } = useToasts();
    const countryList = CountryCodes.all();

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
        <main className="app__content">
            <div className="container-fluid">
                {countryList && countryList.length &&
                    <div className="row">
                        <div className="col-12">
                            <div className="bg-white">
                                <div className="add-user p-3">
                                    <Formik
                                        initialValues={{
                                            first_name: "",
                                            last_name: "",
                                            email: "",
                                            country_code: countryList[selectedCountryCode] ? `+${countryList[selectedCountryCode].countryCallingCode}`: "",
                                            phone: '',
                                            profile: '',
                                            role: '',
                                            permission_sets: []
                                        }}
                                        displayName="UserForm"
                                        validationSchema={registerSchema}
                                        onSubmit={(values, actions) => {
                                            values.country_code = `+${countryList[selectedCountryCode].countryCallingCode}`;
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
                                                    <div className="col-12 col-lg-12 col-xl-12">
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
                                                                                    countryList.map((country, index) => {

                                                                                        return (index === selectedCountryCode ?
                                                                                            <Dropdown.Toggle key={index} variant="" className="p-1 pt-2 px-2 pr-0 d-flex align-items-center rounded-0">
                                                                                                <span height="20" width="25">{country.flag} </span>
                                                                                                <span className="country-phone-code pl-1">{`+${country.countryCallingCode}`}</span>
                                                                                            </Dropdown.Toggle> : null)
                                                                                    })
                                                                                    }
                                                                                    <Dropdown.Menu>
                                                                                        {
                                                                                        countryList.map((country, index) => {
                                                                                            return index === selectedCountryCode ? null :
                                                                                                    (<Dropdown.Item onClick={() => {
                                                                                                        setSelectedCountryCode(index);
                                                                                                        const countryCode = country.countryCallingCode;
                                                                                                        formikProps.setFieldValue('country_code', countryCode);
                                                                                                    phoneFieldRef.focus();
                                                                                                    }} key={index} className="px-2 d-flex align-items-center">
                                                                                                    <span height="20" width="20">{country.flag} </span>
                                                                                                    <span className="country-name pl-2">{country.countryNameEn}</span>
                                                                                                    <span className="country-phone-code pl-1">{`+${country.countryCallingCode}`}</span>
                                                                                                    </Dropdown.Item>)
                                                                                        })
                                                                                        }
                                                                                    </Dropdown.Menu>
                                                                                </Dropdown>
                                                                            </span>
                                                                        <Field innerRef={(ele) => setPhoneFieldRef(ele)} data-testid="phone" className="form-control rounded" type="text" name="phone"/>
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
                                                                        {roles ? roles.map(role => <option className="p-2" key={role.id} value={role.id}>{role.title}</option>) : null}
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

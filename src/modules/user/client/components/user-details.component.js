import axios from "axios";
import React, { useEffect, useState } from 'react';
import { Form, Formik, Field, FieldArray, ErrorMessage } from "formik";
import { NavLink } from 'react-router-dom';

const UserDetails = (props) => {
    const [userInfo, setUserInfo] = useState({});
    const [countries, setCountries] = useState([]);
    const nullValueToken = '--'

    useEffect(() => {
        const { id } = props.match.params;

        async function getInfo() {
            const response = await axios.get(`/api/users/${id}`);
            setUserInfo(response.data);
        }

        async function getCountries() {
            const response = await axios.get('/api/countries');
            setCountries(response.data);
        }

        getInfo();
        getCountries();
    }, [props]);

    return (
        <main className="app__content cdp-light-bg h-100">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb rounded-0">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item"><NavLink to="/users">Management of Customer Data platform</NavLink></li>
                                <li className="breadcrumb-item"><NavLink to="/users/list">CDP User List</NavLink></li>
                                <li className="breadcrumb-item active"><span>Profile Details</span></li>
                            </ol>
                        </nav>
                    </div>
                </div>
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-12 col-sm-12 col-lg-10">
                            <div className="shadow-sm bg-white rounded mt-5">
                                <h2 className="d-flex align-items-center p-3 p-sm-4 px-sm-5 page-title light">
                                    <span className="page-title__text font-weight-bold py-3">Profile Details</span>
                                </h2>
                                <div className="profile-detail p-3 py-sm-4 px-sm-5 mb-3 mb-sm-0">
                                    <h2 className="profile-detail__name pb-3">{ userInfo.first_name && userInfo.last_name ? userInfo.first_name + " " + userInfo.last_name : '' }</h2>
                                    <div className="profile-detail__row pb-0 pb-sm-2 d-block d-sm-flex">
                                        <div className="profile-detail__col pb-3 pr-0 pr-sm-3">
                                            <span className="mr-2 d-block profile-detail__label">Email</span>
                                            <span className="profile-detail__value">{userInfo.email ? userInfo.email : nullValueToken}</span>
                                        </div>
                                        <div className="profile-detail__col pb-3">
                                            <span className="mr-2 d-block profile-detail__label">Phone Number</span>
                                            <span className="profile-detail__value">{userInfo.phone ? userInfo.phone : nullValueToken}</span>
                                        </div>
                                    </div>
                                    <div className="profile-detail__row pb-0 pb-sm-2 d-block d-sm-flex">
                                        <div className="profile-detail__col pb-3">
                                            <span className="mr-2 d-block profile-detail__label">Expiary Date</span>
                                            <span className="profile-detail__value">{userInfo.expiry_date ? (new Date(userInfo.expiry_date)).toLocaleDateString('en-GB').replace(/\//g, '.') : nullValueToken}</span>
                                        </div>
                                        <div className="profile-detail__col pb-3 pr-0 pr-sm-3">
                                            <span className="mr-2 d-block profile-detail__label">Last Login</span>
                                            <span className="profile-detail__value">{userInfo.last_login ? (new Date(userInfo.last_login)).toLocaleDateString('en-GB').replace(/\//g, '.') : nullValueToken}</span>
                                        </div>
                                    </div>
                                    <div className="profile-detail__row pb-0 pb-sm-2 d-block d-sm-flex">
                                        <div className="profile-detail__col pb-3 pr-0 pr-sm-3">
                                            <span className="mr-2 d-block profile-detail__label">Applications</span>
                                            <span className="profile-detail__value">{userInfo.application ? userInfo.application : nullValueToken}</span>
                                        </div>
                                        <div className="profile-detail__col pb-3 pr-0 pr-sm-3">
                                            <span className="mr-2 d-block profile-detail__label">Countries</span>
                                            <span className="profile-detail__value">
                                                {/* {userInfo.countries && countries && countries.length > 0 && userInfo.countries.length ? userInfo.countries.map((country) => countries.find(i => i.country_iso2 === country).countryname).join(', ') : nullValueToken} */}
                                                {userInfo.countries && countries && countries.length > 0 && userInfo.countries.length ? countries.filter(i => userInfo.countries.includes(i.country_iso2)).map(i => i.codbase_desc).join(', ') : nullValueToken}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="profile-detail__row pb-0 pb-sm-2 d-block d-sm-flex">
                                        <div className="profile-detail__col-fluid pb-3 pr-0 pr-sm-3">
                                            <span className="mr-2 d-block profile-detail__label">Roles</span>
                                            <span className="profile-detail__value">{userInfo.roles ? userInfo.roles.replace(/,/g, ', ') : nullValueToken}</span>
                                        </div>
                                        <div className="profile-detail__col-fluid pb-3 pr-0 pr-sm-3">
                                            <span className="mr-2 d-block profile-detail__label">Status</span>
                                            <Formik
                                                initialValues={{
                                                    status: userInfo.status || ''
                                                }}
                                                onSubmit={(values, actions) => {
                                                    axios.patch(`/api/users/${userInfo.id}`, values).then(() => {
                                                        actions.setStatus({ updated: true });
                                                    }).catch(err => {
                                                        actions.setStatus({ updated: false });
                                                    });
                                                    actions.setStatus({ updated: 'pending' });
                                                }}
                                                enableReinitialize
                                            >
                                                {(formikProps) => <Form onSubmit={formikProps.handleSubmit} >
                                                    <div>
                                                        <Field
                                                            as="select"
                                                            name="status"
                                                            className="form-control"
                                                            onChange={(e) => {
                                                                formikProps.setFieldValue('status', e.target.value);
                                                                formikProps.submitForm();
                                                            }}
                                                        >
                                                            <option value="active">Active</option>
                                                            <option value="inactive">Inactive</option>
                                                        </Field>
                                                        {formikProps.status && <div className="text-right">
                                                            <small className="mt-1 text-muted">
                                                                {formikProps.status.updated === true ? "Updated" : formikProps.status.updated === 'pending' ? "Updating..." : formikProps.status.updated === false ? "Update Failed" : '' }
                                                            </small>
                                                        </div>}
                                                    </div>
                                                </Form>}
                                            </Formik>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </main>

    );
}

export default UserDetails;

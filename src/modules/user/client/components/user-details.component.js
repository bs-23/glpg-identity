import axios from "axios";
import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useToasts } from "react-toast-notifications";
import { Form, Formik, Field, ErrorMessage } from "formik";
import { PermissionSetDetailsModal } from "./permission-sets-details";

const FormField = ({ label, name, type, children, required=true, ...rest }) => <div className="col-12 col-sm-6">
    <div className="form-group">
        <label hidden className="font-weight-bold" htmlFor="last_name">{ label }{required && <span className="text-danger">*</span>}</label>
        { children || <Field className="form-control" type={type} name={name} {...rest} /> }
        <div className="invalid-feedback"><ErrorMessage name={name} /></div>
    </div>
</div>

const SelectOneToggleList = ({ name, options, labelExtractor, idExtractor }) => {
    const handleClick = (e, form) => {
        const fieldName = e.target.name;
        const fieldvalue = e.target.value;
        if(form.values[fieldName] === fieldvalue) {
            form.setFieldValue(fieldName, '');
        }
    }

    return <Field
                name={name}
                >
                {({ field, form }) => (
                    options.map(item => <label key={idExtractor(item)} className="d-flex justify-content-between align-items-center">
                        <span className="switch-label">{labelExtractor(item)}</span>
                        <span className="switch">
                            <input name={name}
                                className="custom-control-input"
                                {...field}
                                name={name}
                                type="radio"
                                onClick={(e) => handleClick(e, form)}
                                value={idExtractor(item)}
                                id={idExtractor(item)}
                                checked={field.value === idExtractor(item)}
                                disabled={item.hasOwnProperty('disabled') ? item.disabled : false}
                            />
                            <span className="slider round"></span>
                        </span>
                    </label>)
                )}
            </Field>
}

const UserDetails = (props) => {
    const [userInfo, setUserInfo] = useState({});
    const [countries, setCountries] = useState([]);
    const [modalShow, setModalShow] = useState({ permissionSetDetails: false });
    const [permissionSetDetailID, setPermissionSetDetailID] = useState(null);
    const [roles, setRoles] = useState([]);
    const { addToast } = useToasts();

    const nullValueToken = '--';

    const handlePermissionSetClick = (id) => {
        setPermissionSetDetailID(id);
        setModalShow({ ...modalShow, permissionSetDetails: true });
    }

    const handlePermissionSetDetailHide = () => {
        setModalShow({ ...modalShow, permissionSetDetails: false });
        setPermissionSetDetailID(null);
    }

    const renderPermissionSets = () => userInfo.permissionSets && userInfo.permissionSets.length ? userInfo.permissionSets.map(ps =>
        <div key={ps.title} style={{ cursor: 'pointer' }} onClick={() => handlePermissionSetClick(ps.id)} className="d-flex pb-2">
            <i className="icon icon-check-filled cdp-text-primary mr-2 small mt-1"></i>
            <span>{ps.title} <span className="text-muted small text-capitalize font-italic d-block">Type: {ps.type}</span></span>
        </div>
        ) : nullValueToken

    const handleSubmit = (values, actions) => {
        axios.put(`/api/users/${userInfo.id}/role`, values).then(() => {
            const successMessage = 'Successfully updated role.';
            addToast(successMessage, {
                appearance: 'success',
                autoDismiss: true
            });
        }).catch(err => {
            const errorMessage = typeof err.response.data === 'string' ? err.response.data : err.response.statusText;
            addToast(errorMessage, {
                appearance: 'error',
                autoDismiss: true
            });
        }).finally(() => {
            actions.setSubmitting(false);
        })
    };

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

        async function getRoles() {
            const response = await axios.get('/api/roles');
            setRoles(response.data);
        }

        getRoles();
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
                                            <span className="mr-2 d-block profile-detail__label">Profile</span>
                                            <span className="profile-detail__value">{userInfo.profiles ? userInfo.profiles : nullValueToken}</span>
                                        </div>
                                        <div className="profile-detail__col-fluid pb-3 pr-0 pr-sm-3">
                                            <span className="mr-2 d-block profile-detail__label">Role</span>
                                            <span className="profile-detail__value">
                                                <Formik
                                                    initialValues={{ roleId: userInfo.role ? userInfo.role.id : '' }}
                                                    displayName="RoleReassignmentForm"
                                                    onSubmit={handleSubmit}
                                                    enableReinitialize
                                                >
                                                    {formikProps => (
                                                        <Form onSubmit={formikProps.handleSubmit}>
                                                            <div className="row">
                                                            <FormField label="Reassign Roles" name="roleId" required={false} >
                                                                <SelectOneToggleList name="roleId" options={roles} idExtractor={item => item.id} labelExtractor={item => item.title} />
                                                            </FormField>
                                                            </div>
                                                            <button type="submit" className="btn btn-block text-white cdp-btn-secondary mt-4 p-2" disabled={formikProps.isSubmitting} > Save Changes </button>
                                                        </Form>
                                                    )}
                                                </Formik>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="profile-detail__row pb-0 pb-sm-2 d-block d-sm-flex">
                                        <div className="profile-detail__col-fluid pb-3 pr-0 pr-sm-3">
                                            <span className="mr-2 d-block profile-detail__label">Permission Sets</span>
                                            <span className="profile-detail__value">
                                                {renderPermissionSets()}
                                            </span>
                                        </div>
                                    </div>
                                    <PermissionSetDetailsModal
                                        permissionSetId={permissionSetDetailID}
                                        show={modalShow.permissionSetDetails}
                                        onHide={handlePermissionSetDetailHide}
                                    />
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

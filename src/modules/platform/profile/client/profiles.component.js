import axios from "axios";
import { NavLink } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { Form, Formik, Field, ErrorMessage } from "formik";
import { useToasts } from "react-toast-notifications";
import { profileCreateSchema } from "./profile.schema";
import { PermissionSetDetailsModal } from "../../../platform";
import Dropdown from 'react-bootstrap/Dropdown';
import Faq from '../../../platform/faq/client/faq.component';
import Modal from 'react-bootstrap/Modal';
import { ToggleList } from '../../../core/client/components/reusable-ui.components';

const FormField = ({ label, name, type, children, required = true, ...rest }) => <div className="col-12">
    <div className="form-group">
        <label className="font-weight-bold" htmlFor="last_name">{label}{required && <span className="text-danger">*</span>}</label>
        {children || <Field className="form-control" type={type} name={name} {...rest} />}
        <div className="invalid-feedback"><ErrorMessage name={name} /></div>
    </div>
</div>

const ToggleListSlider = (props) => <ToggleList {...props} >
    {
        ({ name, id, label, currentOption, isChecked, onChange, disabled }) =>
        <label key={id} className="d-flex justify-content-between align-items-center pt-1">
            <span className="switch-label">{label} {currentOption.type && <span className="text-muted small text-capitalize font-italic d-block"> Type: {currentOption.type}</span>}</span>
            <span className="switch">
                <input name={name}
                    className="custom-control-input"
                    type="checkbox"
                    value={id}
                    id={id}
                    checked={isChecked}
                    onChange={onChange}
                    disabled={disabled}
                />
                <span className="slider round"></span>
            </span>
        </label>
    }
</ToggleList>

const ProfileForm = ({ onSuccess, permissionSets, preFill }) => {
    const { addToast } = useToasts();

    const handleSubmit = (values, actions) => {
        const promise = preFill ? axios.put(`/api/profiles/${preFill.id}`, values) : axios.post('/api/profiles', values);
        promise.then(() => {
            const successMessage = preFill ? 'Successfully updated new profile.' : 'Successfully created new profile.';
            addToast(successMessage, {
                appearance: 'success',
                autoDismiss: true
            });
            actions.resetForm();
            onSuccess && onSuccess();
        }).catch(err => {
            const errorMessage = typeof err.response.data === 'string' ? err.response.data : err.response.statusText;
            addToast(errorMessage, {
                appearance: 'error',
                autoDismiss: true
            });
        }).finally(() => {
            actions.setSubmitting(false);
        });
        actions.setSubmitting(true);
    }

    const getToggleListOptions = () => {
        const selectedPermissionSets = preFill ? preFill.permissionssetIDs ? preFill.permissionssetIDs : [] : [];
        const filteredPermissionSet = permissionSets.filter(ps => selectedPermissionSets.includes(ps.id) || ps.type === 'custom');
        return filteredPermissionSet.map(ps => ({ ...ps, disabled: ps.type === 'standard' }));
    }

    return <div className="row">
        <div className="col-12">
            <div className="">
                <div className="add-user p-3">
                    <Formik
                        initialValues={{
                            title: preFill ? preFill.title : '',
                            description: preFill ? preFill.description : '',
                            permissionSets: preFill ? Array.isArray(preFill.permissionssetIDs) ? preFill.permissionssetIDs : [] : []
                        }}
                        displayName="ProfileForm"
                        validationSchema={profileCreateSchema}
                        onSubmit={handleSubmit}
                        enableReinitialize
                    >
                        {formikProps => (
                            <Form onSubmit={formikProps.handleSubmit}>
                                <div className="row">
                                    <div className="col-12">
                                        <div className="row">
                                            <FormField label="Title" type="text" name="title" />
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="row">
                                            <FormField label="Description" type="text" name="description" component="textarea" required={false} />
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="row">
                                            <FormField name="permissionSets" label="Select Permission Sets">
                                                <ToggleListSlider name="permissionSets" options={getToggleListOptions()} valueExtractor={item => item.id} idExtractor={item => item.id} labelExtractor={item => item.title} />
                                            </FormField>
                                        </div>
                                        <button type="submit" className="btn btn-block text-white cdp-btn-secondary mt-4 p-2" disabled={formikProps.isSubmitting} > Submit </button>
                                    </div>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </div>
    </div>
};

export default function ManageProfiles() {
    const [profiles, setProfiles] = useState([]);
    const [permissionSets, setPermissionSets] = useState([]);
    const [modalShow, setModalShow] = useState({ createProfile: false, permissionSetDetails: false });
    const [profileEditData, setProfileEditData] = useState(null);
    const [permissionSetDetailID, setPermissionSetDetailID] = useState(null);
    const [showFaq, setShowFaq] = useState(false);
    const handleCloseFaq = () => setShowFaq(false);
    const handleShowFaq = () => setShowFaq(true);

    const getProfiles = async () => {
        const { data } = await axios.get('/api/profiles');
        setProfiles(data);
    }

    const getPermissionSets = async () => {
        const response = await axios.get('/api/permissionSets');
        setPermissionSets(response.data);
    }

    const handlePermissionSetClick = (id) => {
        setPermissionSetDetailID(id);
        setModalShow({ ...modalShow, permissionSetDetails: true });
    }

    const extractPermissionSetNames = (data) => {
        if (!data || !data.up_ps || !data.up_ps.length) return '';
        return data.up_ps.map((item, index) => {
            return <React.Fragment key={item.permissionSetId}>
                <a type="button" className="link-with-underline" key={item.permissionSetId} onClick={() => handlePermissionSetClick(item.permissionSetId)}>
                    {item.ps.title}
                </a>
                {index < data.up_ps.length - 1 ? <span>,&nbsp;</span> : null}
            </React.Fragment>
        });
    }

    const handleCreateProfileSuccess = () => {
        getProfiles();
        setProfileEditData(null);
        setModalShow({ ...modalShow, createProfile: false });
    }

    const handleProfileModalHide = () => {
        setModalShow({ ...modalShow, createProfile: false });
        setProfileEditData(null);
    }

    const handlePermissionSetDetailHide = () => {
        setModalShow({ ...modalShow, permissionSetDetails: false });
        setPermissionSetDetailID(null);
    }

    const handlepProfileEditClick = (data) => {
        const editData = {
            id: data.id,
            title: data.title,
            description: data.description,
            permissionssetIDs: (data.up_ps || []).map(item => item.permissionSetId)
        };
        setProfileEditData(editData);
        setModalShow({ ...modalShow, createProfile: true });
    }

    useEffect(() => {
        getProfiles();
        getPermissionSets();
    }, []);

    return (
        <main className="app__content cdp-light-bg">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0">
                        <nav className="breadcrumb justify-content-between align-items-center" aria-label="breadcrumb">
                            <ol className="rounded-0 m-0 p-0 d-none d-sm-flex">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item"><NavLink to="/platform">Management of Customer Data Platform</NavLink></li>
                                <li className="breadcrumb-item active"><span>Manage Profiles</span></li>
                            </ol>
                            <Dropdown className="dropdown-customize breadcrumb__dropdown d-block d-sm-none ml-2">
                                <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle btn d-flex align-items-center border-0">
                                    <i className="fas fa-arrow-left mr-2"></i> Back
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item className="px-2" href="/"><i className="fas fa-link mr-2"></i> Dashboard</Dropdown.Item>
                                    <Dropdown.Item className="px-2" href="/platform"><i className="fas fa-link mr-2"></i> Management of Customer Data platform</Dropdown.Item>
                                    <Dropdown.Item className="px-2" active><i className="fas fa-link mr-2"></i> Manage Profiles</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                            <span className="ml-auto mr-3"><i type="button" onClick={handleShowFaq} className="icon icon-help breadcrumb__faq-icon cdp-text-secondary"></i></span>
                        </nav>
                        <Modal show={showFaq} onHide={handleCloseFaq} size="lg" centered>
                            <Modal.Header closeButton>
                                <Modal.Title>Questions You May Have</Modal.Title>
                            </Modal.Header>
                            <Modal.Body className="faq__in-modal"><Faq topic="manage-profile" /></Modal.Body>
                        </Modal>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12 col-sm-12 pt-3">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h4 className="cdp-text-primary font-weight-bold mb-0">Manage Profiles</h4>
                            <button hidden disabled className="btn cdp-btn-secondary text-white ml-auto " onClick={() => setModalShow({ ...modalShow, createProfile: true })}>
                                <i className="icon icon-plus pr-1"></i> Add New Profile
                            </button>
                        </div>

                        {profiles.length > 0 &&
                            <div className="table-responsive shadow-sm bg-white mb-3 cdp-table__responsive-wrapper">
                            <table className="table table-hover table-sm mb-0 cdp-table cdp-table__responsive">
                                    <thead className="cdp-bg-primary text-white cdp-table__header">
                                        <tr>
                                            <th width="20%" className="py-2">Title</th>
                                            <th width="10%" className="py-2">Type</th>
                                            <th width="40%" className="py-2">Description</th>
                                            <th width="20%" className="py-2">Permission Sets</th>
                                            <th width="10%" className="py-2">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="cdp-table__body bg-white">
                                        {profiles.map(row => (
                                            <tr key={row.id}>
                                                <td data-for="Title">{row.title}</td>
                                                <td data-for="Type" className="text-capitalize">{row.type}</td>
                                                <td data-for="Description">{row.description}</td>
                                                <td data-for="Permission Sets">{extractPermissionSetNames(row)}</td>
                                                <td data-for="Action"><button className="btn cdp-btn-outline-primary btn-xs-block btn-sm" onClick={() => handlepProfileEditClick(row)}> <i className="icon icon-edit-pencil pr-2"></i>Edit</button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        }

                        {profiles.length === 0 &&
                            <><div className="row justify-content-center mt-5 pt-5 mb-3">
                                <div className="col-12 col-sm-6 py-4 bg-white shadow-sm rounded text-center">
                                    <i class="icon icon-team icon-6x cdp-text-secondary"></i>
                                    <h3 className="font-weight-bold cdp-text-primary pt-4">No Profile Found!</h3>
                                </div>
                            </div></>
                        }

                        <Modal
                            show={modalShow.createProfile}
                            onHide={handleProfileModalHide}
                            dialogClassName="modal-90w modal-customize"
                            aria-labelledby="example-custom-modal-styling-title"
                            centered
                        >
                            <Modal.Header closeButton>
                                <Modal.Title id="example-custom-modal-styling-title">
                                    {profileEditData ? "Update Profile" : "Create New Profile"}
                                </Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <ProfileForm preFill={profileEditData} permissionSets={permissionSets} onSuccess={handleCreateProfileSuccess} />
                            </Modal.Body>
                        </Modal>
                        <PermissionSetDetailsModal
                            permissionSetId={permissionSetDetailID}
                            show={modalShow.permissionSetDetails}
                            onHide={handlePermissionSetDetailHide}
                        />
                    </div>
                </div>
            </div>
        </main >
    )
}

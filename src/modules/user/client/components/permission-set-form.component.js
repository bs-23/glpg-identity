import axios from "axios";
import { NavLink } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { Form, Formik, Field, FieldArray, ErrorMessage } from "formik";
import { permissionSetCreateSchema } from "../user.schema";
import { useToasts } from "react-toast-notifications";


const FormField = ({ label, name, type, children }) => <div className="col-12 col-sm-6">
    <div className="form-group">
        <label className="font-weight-bold" htmlFor="last_name">{ label }<span className="text-danger">*</span></label>
        { children || <Field className="form-control" type={type} name={name} /> }
        <div className="invalid-feedback"><ErrorMessage name={name} /></div>
    </div>
</div>

const CheckList = ({ name, options, labelExtractor, idExtractor }) => {
    const isChecked = (id, arrayHelpers) => arrayHelpers.form.values[name].includes(id);

    const handleChange = (e, arrayHelpers) => {
        const optionId = e.target.value;
        if (e.target.checked) {
            arrayHelpers.push(optionId);
        }
        else {
            const idx = arrayHelpers.form.values[name].indexOf(optionId);
            arrayHelpers.remove(idx);
        }
    }

    return <FieldArray
                name={name}
                render={arrayHelpers => (
                <div>
                    {
                        options.map(item =>
                            <div key={idExtractor(item)} className="custom-control custom-checkbox">
                                <input name={name}
                                    className="custom-control-input"
                                    type="checkbox"
                                    value={idExtractor(item)}
                                    id={idExtractor(item)}
                                    checked={isChecked(idExtractor(item), arrayHelpers)}
                                    onChange={(e) => handleChange(e, arrayHelpers)}
                                />
                                <label className="custom-control-label" for={idExtractor(item)}>{labelExtractor(item)}</label>
                            </div>
                        )
                    }
                </div>
            )}
        />
}

export default function PermissionSetForm() {
    const [applications, setApplications] = useState([]);
    const [countries, setCountries] = useState([]);
    const [serviceCategories, setServiceCategories] = useState([]);
    const { addToast } = useToasts();

    const getApplications = async () => {
        const response = await axios.get('/api/applications');
        setApplications(response.data);
    }

    const getCountries = async () => {
        const response = await axios.get('/api/countries');
        setCountries(response.data);
    }

    const getServiceCategories = async () => {
        const response = await axios.get('/api/serviceCategories');
        setServiceCategories(response.data);
    }

    const handleSubmit = (values, actions) => {
        axios.post('/api/permissionSets', values)
            .then(() => {
                actions.resetForm();
                addToast('Permission set created successfully', {
                    appearance: 'success',
                    autoDismiss: true
                });
            })
            .catch(err => {
                const errorMessage = typeof err.response.data === 'string' ? err.response.data : err.response.statusText;
                addToast(errorMessage, {
                    appearance: 'error',
                    autoDismiss: true
                });
            }).finally(() => actions.setSubmitting(false))
        actions.setSubmitting(true);
    }

    useEffect(() => {
        getApplications();
        getCountries();
        getServiceCategories();
    }, []);


    return (
        <main className="app__content cdp-light-bg">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb rounded-0">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item"><NavLink to="/users">Management of Customer Data platform</NavLink></li>
                                {/* <li className="breadcrumb-item"><NavLink to="/users/list">CDP User List</NavLink></li> */}
                                <li className="breadcrumb-item active"><span>Create Permission Set</span></li>
                            </ol>
                        </nav>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <div className="shadow-sm bg-white mb-3">
                        <h2 className="d-flex align-items-center p-3 px-sm-4 py-sm-4 page-title light">
                                <span className="page-title__text font-weight-bold py-3">Create New Permission Set</span>
                            </h2>
                            <div className="add-user p-3">
                                <Formik
                                    initialValues={{
                                        title: '',
                                        application_id: applications.length ? applications[0].id : '',
                                        countries: [],
                                        serviceCategories: []
                                    }}
                                    displayName="PermissionSetForm"
                                    validationSchema={permissionSetCreateSchema}
                                    onSubmit={handleSubmit}
                                    enableReinitialize
                                >
                                    {formikProps => (
                                        <Form onSubmit={formikProps.handleSubmit}>
                                            <div className="row">
                                                <div className="col-12 col-lg-8 col-xl-6">
                                                    <div className="row">
                                                        <FormField label="Title" type="text" name="title"/>
                                                        <FormField label="Select Application" name="application_id" >
                                                            <Field as="select" name="application_id" className="form-control">
                                                                {applications.length ? applications.map(item => <option key={item.id} value={item.id}>{item.name}</option>) : null }
                                                            </Field>
                                                        </FormField>
                                                        <FormField label="Select Countries" name="countries" >
                                                            <CheckList name="countries" options={countries} idExtractor={item => item.country_iso2} labelExtractor={item => item.codbase_desc} />
                                                        </FormField>
                                                        <FormField label="Select Service Categories" name="serviceCategories">
                                                            <CheckList name="serviceCategories" options={serviceCategories} idExtractor={item => item.id} labelExtractor={item => item.title} />
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
            </div>
        </main>
    )
}

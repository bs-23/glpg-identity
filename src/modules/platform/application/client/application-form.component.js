import axios from "axios";
import React, { useState, useEffect } from 'react';
import { Form, Formik, Field, ErrorMessage } from "formik";
import { useToasts } from "react-toast-notifications";
import { applicationFormSchema } from './applications.schema';

const FormField = ({ label, name, type, children, required = true, ...rest }) => <div className="col-12">
    <div className="form-group">
        <label className="font-weight-bold" htmlFor="last_name">{label}{required && <span className="text-danger">*</span>}</label>
        {children || <Field className="form-control" type={type} name={name} {...rest} />}
        <div className="invalid-feedback"><ErrorMessage name={name} /></div>
    </div>
</div>

const ApplicationForm = ({ onSuccess, isEditing, applicationId }) => {
    const { addToast } = useToasts();
    const [application, setApplication] = useState({});

    const handleSubmit = (values, actions) => {
        const promise = isEditing
            ? axios.put(`/api/applications/${applicationId}`, values)
            : axios.post('/api/applications', values);

        promise.then(() => {
            const successMessage = isEditing
                ? 'Successfully updated new profile.'
                : 'Successfully created new profile.';

            addToast(successMessage, {
                appearance: 'success',
                autoDismiss: true
            });

            actions.resetForm();
            onSuccess && onSuccess();
        }).catch(err => {
            const errorMessage = typeof err.response.data === 'string'
                ? err.response.data
                : err.response.statusText;

            addToast(errorMessage, {
                appearance: 'error',
                autoDismiss: true
            });
        }).finally(() => {
            actions.setSubmitting(false);
        });
        actions.setSubmitting(true);
    }

    useEffect(() => {
        const getApplication = async () => {
            axios.get(`/api/applications/${applicationId}`)
                .then(({ data }) => {
                    setApplication(data);
                })
        }
        if (isEditing) getApplication();
    }, []);

    return <div className="row">
        <div className="col-12">
            <div className="">
                <div className="add-user p-3">
                    <Formik
                        initialValues={{
                            name: application.name || '',
                            description: application.description || '',
                            type: application.type || '',
                            email: application.email || '',
                            password: '',
                            confirm_password: '',
                            is_active: application.hasOwnProperty('is_active') ? application.is_active : true,
                            metadata: application.metadata || ''
                        }}
                        displayName="ApplicationForm"
                        // validationSchema={applicationFormSchema}
                        onSubmit={handleSubmit}
                        enableReinitialize
                    >
                        {formikProps => (
                            <Form onSubmit={formikProps.handleSubmit}>
                                <div className="row">
                                    <div className="col-12">
                                        <div className="row">
                                            <FormField label="Name" type="text" name="name" />
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="row">
                                            <FormField label="email" type="email" name="email" />
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="row">
                                            <FormField label="Password" type="password" name="password" />
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="row">
                                            <FormField label="Confirm Password" type="password" name="confirm_password" />
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="row col-12">
                                            <div className="form-group">
                                                <label className="font-weight-bold" htmlFor="last_name">Type</label>
                                                <Field className="form-control" name="type" as="select">
                                                    <option value="">--Select a type--</option>
                                                    <option value="hcp-portal">HCP Portal</option>
                                                </Field>
                                                <div className="invalid-feedback"><ErrorMessage name="type"/></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="row">
                                            <FormField label="Description" type="text" name="description" component="textarea" required={false} />
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="row col-12">
                                            <div className="form-group">
                                                <label className="font-weight-bold" htmlFor="last_name">Is Active</label>
                                                <Field className="ml-2" checked={formikProps.values.is_active} name="is_active" type="checkbox" />
                                                <div className="invalid-feedback"><ErrorMessage name="is_active"/></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-12">
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

export default ApplicationForm;

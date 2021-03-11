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

    const metadataOptions = [
        "cache_clearing_url",
        "approve_user_path",
        "request_notification_link"
    ];

    const convertMetadataToArray = (metadata) => {
        if (!metadata) return [];

        return Object
            .keys(metadata)
            .map(key => { return { key: key, value: metadata[key] } } );
    }

    const convertMetadataArrayToObject = (metadata) => {
        if (!metadata) return {};

        const metadataObject = {};

        metadata.forEach((item) => {
            metadataObject[item.key] = item.value;
        })

        return metadataObject;
    }

    const renderMetadata = (formikProps) => {
        const { metadata } = formikProps.values;

        if (!metadata) return null;

        return <div>
            <span className="cursor-pointer btn cdp-btn-secondary text-white btn-sm my-2" onClick={() => {
                const metadata = [...formikProps.values.metadata];
                metadata.push({ key:'', value:'' });
                formikProps.setFieldValue('metadata', metadata);
            }}>
                <i className="icon icon-plus"></i> <span className="pl-1">Add Property</span>
            </span>
            {
                metadata.map((item, ind) => {
                    return <div key={ind} className="row mb-3">
                        <div className="col-12 col-md-5">
                            <Field  // input field for key
                                as="select"
                                value={item.key}
                                className="form-control"
                                onChange={(e) => {
                                    const updatedMetadataKey = e.target.value;
                                    const updatedMetadata = [...formikProps.values.metadata];
                                    updatedMetadata[ind]["key"] = updatedMetadataKey;
                                    formikProps.setFieldValue('metadata', updatedMetadata);
                                }}
                            >
                                <>
                                    <option disabled value="">Select an option</option>
                                    {
                                        metadataOptions.map(option =>
                                            <option disabled={formikProps.values.metadata.some(item => item.key === option)} key={option} value={option}>{option}</option>
                                        )
                                    }
                                </>
                            </Field>
                        </div>
                        <div className="col-12 col-md-5">
                            <Field  // input field for value
                                type="text"
                                className="form-control"
                                value={item.value}
                                onChange={(e) => {
                                    const updatedMetadataValue = e.target.value;
                                    const updatedMetadata = [...formikProps.values.metadata];
                                    updatedMetadata[ind]["value"] = updatedMetadataValue;
                                    formikProps.setFieldValue('metadata', updatedMetadata);
                                }}
                            />
                        </div>
                        <div className="col-12 col-md-2">
                            <span
                                onClick={() => {
                                    const updatedMetadata = formikProps.values.metadata.filter((item, index) => ind !== index);
                                    formikProps.setFieldValue('metadata', updatedMetadata);
                                }}
                                className="btn cdp-btn-outline-secondary px-3"
                            >
                                <i class="fas fa-times"></i>
                            </span>
                        </div>

                    </div>
                })
            }
        </div>
    }

    const handleSubmit = (values, actions) => {
        const payload = { ...values };

        payload.metadata = convertMetadataArrayToObject(values.metadata);

        const promise = isEditing
            ? axios.put(`/api/applications/${applicationId}`, payload)
            : axios.post('/api/applications', payload);

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
                            metadata: convertMetadataToArray(application.metadata)
                        }}
                        displayName="ApplicationForm"
                        // validationSchema={applicationFormSchema}
                        onSubmit={handleSubmit}
                        enableReinitialize
                    >
                        {formikProps => (
                            <Form onSubmit={formikProps.handleSubmit}>
                                <div className="row">
                                    <div className="col-12 col-md-6">
                                        <div className="row">
                                            <FormField label="Name" type="text" name="name" />
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <div className="row">
                                            <FormField label="Email" type="email" name="email" />
                                        </div>
                                    </div>
                                    {!isEditing && <div className="col-12 col-md-6">
                                        <div className="row">
                                            <FormField label="Password" type="password" name="password" />
                                        </div>
                                    </div>}
                                    {!isEditing && <div className="col-12 col-md-6">
                                        <div className="row">
                                            <FormField label="Confirm Password" type="password" name="confirm_password" />
                                        </div>
                                    </div>}
                                    <div className="col-12">
                                        <div className="row col-12">
                                            <div className="form-group">
                                                <label className="font-weight-bold" htmlFor="last_name">Type <span className="text-danger">*</span></label>
                                                <Field className="form-control" name="type" as="select">
                                                    <option value="">--Select a type--</option>
                                                    <option value="standard">Standard</option>
                                                    <option value="hcp-portal">HCP Portal</option>
                                                </Field>
                                                <div className="invalid-feedback"><ErrorMessage name="type"/></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="row col-12">
                                            <div className="form-group">
                                                <div className="custom-control custom-checkbox mr-sm-2">
                                                    <input
                                                        id="isactive"
                                                        name="is_active"
                                                        type="checkbox"
                                                        className="custom-control-input"
                                                        checked={formikProps.values.is_active}
                                                        onChange={e => formikProps.setFieldValue('is_active', e.target.checked)}
                                                    />
                                                    <label className="custom-control-label" for="isactive">Is Active</label>
                                                </div>
                                                <div className="invalid-feedback"><ErrorMessage name="is_active"/></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="form-group">
                                            <label className="font-weight-bold" htmlFor="metadata">Metadata</label>
                                            {renderMetadata(formikProps)}
                                            <div className="invalid-feedback"><ErrorMessage name="metadata" /></div>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="row">
                                            <FormField label="Description" type="text" name="description" component="textarea" required={false} />
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

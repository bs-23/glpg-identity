import axios from "axios";
import React, { useState, useEffect } from 'react';
import { Form, Formik, Field, ErrorMessage, getIn } from "formik";
import { useToasts } from "react-toast-notifications";
import { createApplicationSchema, updateApplicationSchema } from './applications.schema';

const ErrorMessageForArray = ({ name }) => (
    <Field
      name={name}
      render={({ form }) => {
        const error = getIn(form.errors, name);
        const touch = getIn(form.touched, name);
        return touch && error ? error : null;
      }}
    />
  );

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

    const metadataOptions = {
        "standard": [],
        "business-partner": [
            "request_notification_link"
        ],
        "hcp-portal": [
            "cache_clearing_url",
            "approve_user_path"
        ]
    }

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

    const handleFileChange = (e, formikProps) => {
        const selectedLogoFile = e.target.files[0];
        formikProps.setFieldValue('logo', selectedLogoFile);

        const logoImageTag = document.getElementById('logo');
        const reader = new FileReader();

        reader.addEventListener('load', function() {
            logoImageTag.src = reader.result;
        });

        if (selectedLogoFile) {
            reader.readAsDataURL(selectedLogoFile);
        }
    }

    const renderMetadata = (formikProps) => {
        const { metadata } = formikProps.values;

        if (!metadata) return null;

        return <div>
            {/* <span className="cursor-pointer btn cdp-btn-secondary text-white btn-sm my-2" onClick={() => {
                const metadata = [...formikProps.values.metadata];
                metadata.push({ key:'', value:'' });
                formikProps.setFieldValue('metadata', metadata);
            }}>
                <i className="icon icon-plus"></i> <span className="pl-1">Add Property</span>
            </span> */}
            {
                metadata.map((item, ind) => {
                    return <div key={ind} className="row mb-3">
                        <div className="col-12 col-md-5">
                            <label>{item.key}</label>
                            {/* <Field  // input field for key
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
                                        (metadataOptions[formikProps.values.type] || []).map(option =>
                                            <option disabled={formikProps.values.metadata.some(item => item.key === option)} key={option} value={option}>{option}</option>
                                        )
                                    }
                                </>
                            </Field>
                            <div className="invalid-feedback"><ErrorMessageForArray name={`metadata[${ind}].key`} /></div> */}
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
                            <div className="invalid-feedback"><ErrorMessageForArray name={`metadata[${ind}].value`} /></div>
                        </div>
                        {/* <div className="col-12 col-md-2">
                            <span
                                onClick={() => {
                                    const updatedMetadata = formikProps.values.metadata.filter((item, index) => ind !== index);
                                    formikProps.setFieldValue('metadata', updatedMetadata);
                                }}
                                className="btn cdp-btn-outline-secondary px-3"
                            >
                                <i class="fas fa-times"></i>
                            </span>
                        </div> */}
                    </div>
                })
            }
        </div>
    }

    const handleSubmit = (values, actions) => {
        let payload = { ...values };

        payload.metadata = JSON.stringify(convertMetadataArrayToObject(values.metadata));

        var form_data = new FormData();

        for (const key in payload) {
            form_data.append(key, payload[key]);
        }

        const promise = isEditing
            ? axios.put(`/api/applications/${applicationId}`, form_data)
            : axios.post('/api/applications', form_data);

        promise.then(() => {
            const successMessage = isEditing
                ? 'Successfully updated the service account.'
                : 'Successfully created a service account.';

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
                        validationSchema={isEditing ? updateApplicationSchema : createApplicationSchema}
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
                                                <Field
                                                    className="form-control"
                                                    name="type"
                                                    as="select"
                                                    onChange={e => {
                                                        const type = e.target.value;
                                                        const keys = metadataOptions[type];

                                                        formikProps.setFieldValue('metadata', keys.map(key => ({ key: key, value: '' })));
                                                        formikProps.handleChange(e);
                                                    }}
                                                >
                                                    <option value="">--Select a type--</option>
                                                    <option value="standard">Standard</option>
                                                    <option value="hcp-portal">HCP Portal</option>
                                                    <option value="business-partner">Business Partner</option>
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
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="row">
                                            <FormField label="Description" type="text" name="description" component="textarea" required={false} />
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <label className="font-weight-bold" htmlFor="logo">Logo</label>
                                        <div className="row align-items-center">
                                            <div className="col-12 col-sm-6">
                                                <div className="custom-file">
                                                    <input className="custom-file-input" id="customFile" type="file" name="logo" onChange={e => handleFileChange(e, formikProps)} />
                                                    <label className="custom-file-label" for="customFile">Choose file</label>
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-6">
                                                <div className="form-group">
                                                    <img src={(application || {}).logo_url} id="logo" width="300" />
                                                </div>
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

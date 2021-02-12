import axios from "axios";
import React, { useState, useEffect } from 'react';
import { Form, Formik, Field, FieldArray, ErrorMessage } from "formik";
import { useSelector } from "react-redux";
import { useToasts } from "react-toast-notifications";
import { permissionSetCreateSchema } from "./permission-set.schema";


const FormField = ({ label, name, type, children, required=true, ...rest }) => <div className="col-12 col-sm-6">
    <div className="form-group">
        <label className="font-weight-bold" htmlFor="last_name">{ label }{required && <span className="text-danger">*</span>}</label>
        { children || <Field className="form-control" type={type} name={name} {...rest} /> }
        <div className="invalid-feedback"><ErrorMessage name={name} /></div>
    </div>
</div>

const FormFieldFluid = ({ label, name, type, children, required = true, ...rest }) => <div className="col-12">
    <div className="form-group">
        <label className="font-weight-bold" htmlFor="last_name">{label}{required && <span className="text-danger">*</span>}</label>
        {children || <Field className="form-control" type={type} name={name} {...rest} />}
        <div className="invalid-feedback"><ErrorMessage name={name} /></div>
    </div>
</div>

const CheckList = ({ name, options, labelExtractor, idExtractor, allOptionID }) => {
    const isChecked = (id, arrayHelpers) => arrayHelpers.form.values[name].includes(id);

    const handleChange = (e, arrayHelpers) => {
        const optionId = e.target.value;
        if (e.target.checked) {
            if(allOptionID && (optionId === allOptionID)) {
                arrayHelpers.form.setFieldValue(name, options.map(op => idExtractor(op)));
            }
            else {
                if(arrayHelpers.form.values[name].includes(allOptionID)) {
                    const idx = arrayHelpers.form.values[name].indexOf(allOptionID);
                    arrayHelpers.remove(idx);
                }
                arrayHelpers.push(optionId);
            }
        }
        else {
            if(allOptionID && (optionId === allOptionID)){
                arrayHelpers.form.setFieldValue(name, []);
            }else{
                let filteredOptionIds = arrayHelpers.form.values[name].filter(id => id !== allOptionID).filter(id => id !== optionId);
                arrayHelpers.form.setFieldValue(name, filteredOptionIds);
            }
        }
    }

    const allOptionsObject = options.find(op => idExtractor(op) === allOptionID);

    if(allOptionsObject){
        options = options.filter(op => idExtractor(op) !== allOptionID);
        options.unshift(allOptionsObject);
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

const ToggleList = ({ name, options, labelExtractor, idExtractor, allOptionID }) => {
    const optionIds = options.map(op => idExtractor(op));

    const isChecked = (id, arrayHelpers) => arrayHelpers.form.values[name].includes(id);

    const handleChange = (e, arrayHelpers) => {
        const optionId = e.target.value;
        if (e.target.checked) {
            if(allOptionID && (optionId === allOptionID)) {
                arrayHelpers.form.setFieldValue(name, [...arrayHelpers.form.values[name], ...(options.map(op => idExtractor(op)))]);
            }
            else{
                if(!arrayHelpers.form.values[name].includes(allOptionID)) {
                    arrayHelpers.push(allOptionID);
                }
                arrayHelpers.push(optionId);
            }
        }
        else {
            if(allOptionID && (optionId === allOptionID)){
                const filteredOptionIds = arrayHelpers.form.values[name]
                    .filter(id => !optionIds.includes(id));

                arrayHelpers.form.setFieldValue(name, filteredOptionIds);
            }else{
                let isLastActiveOption = true;

                optionIds.forEach(id => {
                    const idsToExclude = [allOptionID, optionId];
                    if (
                        !idsToExclude.includes(id) &&
                        arrayHelpers.form.values[name].includes(id)
                    ) {
                        isLastActiveOption = false;
                    }
                })

                if (isLastActiveOption) {
                    const filteredOptionIds = arrayHelpers.form.values[name]
                        .filter(id => !optionIds.includes(id));

                    arrayHelpers.form.setFieldValue(name, filteredOptionIds);
                } else {
                    const filteredOptionIds = arrayHelpers.form.values[name]
                        .filter(id => id !== optionId);
                    arrayHelpers.form.setFieldValue(name, filteredOptionIds);
                }
            }
        }
    }

    const allOptionsObject = options.find(op => idExtractor(op) === allOptionID);

    if(allOptionsObject){
        options = options.filter(op => idExtractor(op) !== allOptionID);
        options.unshift(allOptionsObject);
    }

    return <FieldArray
                name={name}
                render={arrayHelpers => (
                    options.map(item => <label key={idExtractor(item)} className={`d-flex  align-items-center ${allOptionID && idExtractor(item) === allOptionID ? 'font-weight-bold-light pt-3 pb-1' : 'pl-4 font-weight-normal'}`}>
                        <span className="custom-control custom-checkbox">
                            <input name={name}
                                className="custom-control-input"
                                type="checkbox"
                                value={idExtractor(item)}
                                id={idExtractor(item)}
                                checked={isChecked(idExtractor(item), arrayHelpers)}
                                onChange={(e) => handleChange(e, arrayHelpers)}
                                disabled={item.hasOwnProperty('disabled') ? item.disabled : false}
                            />
                            <span className="custom-control-label"></span>
                        </span>
                        <span className="switch-label text-left">{labelExtractor(item)}</span>
                    </label>)
                )}
            />
}


export default function PermissionSetForm({ onSuccess, onError, permissionSetId }) {
    const [applications, setApplications] = useState([]);
    const [serviceCategories, setServiceCategories] = useState([]);
    const [permissionSet, setPermissionSet] = useState(null);
    const countries = useSelector(state => state.countryReducer.countries);
    const { addToast } = useToasts();

    const initializeServiceCategoryValues = () => {
        if(permissionSet && permissionSet.serviceCategories){
            return permissionSet.serviceCategories;
        }
        return [];
    }

    const initializeApplicationValues = () => {
        if(permissionSet && permissionSet.applications){
            return permissionSet.applications;
        }
        return [];
    }

    const initializeCountryValues = () => {
        if(permissionSet && permissionSet.countries) {
            return permissionSet.countries;
        }
        return [];
    }

    const formValues = {
        title: permissionSet && permissionSet.title || '',
        description: permissionSet && permissionSet.description || '',
        countries: initializeCountryValues(),
        serviceCategories: initializeServiceCategoryValues(),
        applications: initializeApplicationValues(),
        app_country_service: ''
    };

    const getApplications = async () => {
        const response = await axios.get('/api/applications');
        setApplications(response.data.filter(app => app.type === 'hcp-portal'));
    }

    const getServiceCategories = async () => {
        const response = await axios.get('/api/serviceCategories');
        setServiceCategories(response.data);
    }

    const getPermissionSet = async () => {
        const { data: permSet } = await axios.get(`/api/permissionSets/${permissionSetId}`);
        setPermissionSet({
            ...permSet,
            applications: permSet.ps_app.map(app => app.application.id),
            serviceCategories: permSet.ps_sc.map(sc => sc.service.id),
        });
    }

    const getUsedInProfileNames = () => {
        if(!permissionSet || !permissionSet.ps_up_ps || permissionSet.ps_up_ps.length === 0) return [];
        return permissionSet.ps_up_ps.map(({profile}) => profile.title);
    }

    const getUsedInRoleNames = () => {
        if(!permissionSet || !permissionSet.ps_role_ps || permissionSet.ps_role_ps.length === 0) return [];
        return permissionSet.ps_role_ps.map(({role}) => role.title);
    }

    const handleSubmit = (values, actions) => {
        const { app_country_service, ...requestBody } = values;
        const promise = permissionSetId ? axios.put(`/api/permissionSets/${permissionSetId}`, values) : axios.post('/api/permissionSets', requestBody);
        promise.then(() => {
                const successMessage = permissionSetId ? 'Permission set updated successfully' : 'Permission set created successfully';
                addToast(successMessage, {
                    appearance: 'success',
                    autoDismiss: true
                });
                actions.resetForm();
                onSuccess && onSuccess();
            })
            .catch(err => {
                const errorMessage = typeof err.response.data === 'string' ? err.response.data : err.response.statusText;
                addToast(errorMessage, {
                    appearance: 'error',
                    autoDismiss: true
                });
                onError && onError();
            }).finally(() => actions.setSubmitting(false))
        actions.setSubmitting(true);
    }

    useEffect(() => {
        if(permissionSetId) getPermissionSet();
        getApplications();
        getServiceCategories();
    }, []);

    return (
            <div className="">
                <div className="row">
                    <div className="col-12">
                        <div className="">
                            <div className="add-user px-3 py-1">
                                <Formik
                                    initialValues={formValues}
                                    displayName="PermissionSetForm"
                                    validationSchema={permissionSetCreateSchema}
                                    onSubmit={handleSubmit}
                                    enableReinitialize
                                >
                                    {formikProps => (
                                        <Form onSubmit={formikProps.handleSubmit}>
                                            <div className="row">
                                                <div className="col-12">
                                                    <div className="row">
                                                    <FormFieldFluid label="Title" type="text" name="title"/>
                                                    <FormField label="Select Countries" name="countries" required={false} >
                                                        <CheckList
                                                            name="countries"
                                                            options={countries}
                                                            idExtractor={item => item.country_iso2}
                                                            labelExtractor={item => item.codbase_desc}
                                                        />
                                                    </FormField>
                                                    <FormField label="Select Applications" name="applications" required={false} >
                                                        <CheckList
                                                            name="applications"
                                                            options={applications}
                                                            idExtractor={item => item.id}
                                                            labelExtractor={item => item.name}
                                                        />
                                                    </FormField>
                                                    <FormFieldFluid label="Select Services" name="serviceCategories" required={false} >
                                                        {
                                                            serviceCategories.map(sc => {
                                                                return <ToggleList
                                                                    key={sc.id}
                                                                    name="serviceCategories"
                                                                    allOptionID={sc.id}
                                                                    options={
                                                                        [sc, ...(sc.childServices.map(cs => cs))]
                                                                    }
                                                                    idExtractor={item => item.id}
                                                                    labelExtractor={item => item.title}
                                                                />
                                                            })
                                                        }
                                                    </FormFieldFluid>
                                                    {permissionSetId &&
                                                        <div className="col-12 py-2">
                                                            <div className="row">
                                                                <div className="col-12 col-sm-6">
                                                                    <div className="form-group">
                                                                        <div className="font-weight-bold">Used in Profiles</div>
                                                                        {getUsedInProfileNames().length
                                                                            ? getUsedInProfileNames().map(profile => <div key={profile}>{profile}</div>)
                                                                            : <span>--</span>
                                                                        }
                                                                    </div>
                                                                </div>
                                                                <div className="col-12 col-sm-6">
                                                                    <div className="form-group">
                                                                        <div className="font-weight-bold">Used in Roles</div>
                                                                        {getUsedInRoleNames().length
                                                                            ? getUsedInRoleNames().map(role => <div key={role}>{role}</div>)
                                                                            : <span>--</span>
                                                                        }
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    }
                                                    <FormFieldFluid label="Description" type="text" name="description" required={false} component="textarea" />
                                                    </div>
                                                    <ErrorMessage name="app_country_service" >{(message) => <div className="invalid-feedback alert alert-warning" >{message}</div>}</ErrorMessage>
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
    )
}

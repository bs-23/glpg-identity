import React, { useEffect, useState } from 'react';
import { Form, Formik, Field, ErrorMessage } from "formik";
import { useSelector, useDispatch } from 'react-redux';
import Dropdown from 'react-bootstrap/Dropdown';
import CountryCodes from 'country-codes-list';
import PhoneNumber from 'awesome-phonenumber';
import { useToasts } from "react-toast-notifications";
import { updateSignedInUserProfile } from '../../user.actions';
import { updateMyProfileSchema } from '../../user.schema';

const UpdateMyProfile = () => {
    const myProfileInfo = useSelector(state => state.userReducer.loggedInUser);
    const countries = useSelector(state => state.countryReducer.countries);
    const [phoneFieldRef, setPhoneFieldRef] = useState(null);
    const { addToast } = useToasts();
    const dispatch = useDispatch();
    const desiredCountryList = useSelector(state => state.phoneExtensionReducer.phone_extensions);
    const getMyCountryISO2 = useSelector(state => state.userReducer.loggedInUser.countries);
    const getMyApplicationNames = () => {
        if(!myProfileInfo) return [];

        const myProfile = myProfileInfo.profile;
        const myRole = myProfileInfo.role;
        const myProfileApplications = [];
        const myRoleApplications = [];

        if(myProfile && myProfile.permissionSets) {
            myProfile.permissionSets.map(ps => {
                if(ps.application){
                    ps.application.map(({name}) => myProfileApplications.push(name));
                }
            })
        }

        if(myRole && myRole.permissionSets) {
            myRole.permissionSets.map(ps => {
                if(ps.application) {
                    ps.application.map(({name}) => myRoleApplications.push(name));
                }
            });
        }
        const myApplicationNames = [...new Set([...myProfileApplications, ...myRoleApplications])];
        return myApplicationNames;
    }

    const getDatasyncCountryIndexFromPhone = (phone) => {
        if(!phone) return -1;
        const phoneNumber = new PhoneNumber(phone);
        const phoneNumberCountryISO = phoneNumber.getRegionCode();
        const countryIndex = countries.findIndex(c => c.country_iso2.toLowerCase() === (phoneNumberCountryISO || '').toLowerCase());
        return countryIndex;
    }

    const isCountryDetectedFromPhone = (phone) => {
        return getDatasyncCountryIndexFromPhone(phone) >= 0;
    }

    const initialFormValues = {
        first_name: myProfileInfo && myProfileInfo.first_name,
        last_name: myProfileInfo && myProfileInfo.last_name,
        email: myProfileInfo && myProfileInfo.email,
        phone: myProfileInfo && myProfileInfo.phone,
        isCountryFlagActive: myProfileInfo && (myProfileInfo.phone === '' || isCountryDetectedFromPhone(myProfileInfo.phone))
    }

    const generateCountryIconPath = (country) => {
        if(country) return `/assets/flag/flag-${country.toLowerCase().replace(/ /g, "-")}.svg`;
        return `/assets/flag/flag-placeholder.svg`;
    }

    const onChangePhonefield = (formicProps) => {
        const { values , setFieldValue } = formicProps;
        const phoneNumber = values.phone;
        if (!phoneNumber) return;
            const phoneNumberCountryISO = new PhoneNumber(phoneNumber).getRegionCode();
            let selectedCountry = desiredCountryList.find(country => country.countryCode === phoneNumberCountryISO);
        if (selectedCountry === undefined) { setFieldValue('phone', ''); phoneFieldRef !== null ? phoneFieldRef.disabled = true : ''}
        else {
            selectedCountry.flag = generateCountryIconPath(selectedCountry.countryNameEn);
            if (phoneFieldRef !== null) {
                phoneFieldRef.disabled = false;
            }
        }

        return selectedCountry === undefined ? null : selectedCountry;
    };

    const formSubmitHandler = async (values, actions) => {
        try{
            const phone = values.phone ? values.phone : '';
            const formData = { ...values, phone };
            await dispatch(updateSignedInUserProfile(formData));

            addToast('Profile updated successfully', {
                appearance: 'success',
                autoDismiss: true
            });
        }catch(err){
            const errorMessage = typeof err.response.data === 'string' ? err.response.data : err.response.statusText
            addToast(errorMessage, {
                appearance: 'error',
                autoDismiss: true
            });
        }
        finally{
            actions.resetForm();
        }
        actions.setSubmitting(false);
    }

    const getCodbaseDescriptionsFromISOCodes = (countryISOCodes) => {
        if(!countryISOCodes) return [];
        const filteredCountries = countries.filter(i => countryISOCodes.includes(i.country_iso2))
        const codbaseDescriptions = filteredCountries.map(i => i.codbase_desc);
        return codbaseDescriptions;
    }

    const handlePhoneFieldChange = (e, formikProps) => {
        const currentPhoneValue = e.target.value;
        const { setFieldValue } = formikProps;
            currentPhoneValue === null ? setFieldValue('phone', ''): setFieldValue('phone', currentPhoneValue);
            setFieldValue('isCountryFlagActive', true);
    }

    const renderServices = () => {
        const services = myProfileInfo.services;
        const servicesGrouped = new Map();

        services.forEach(s => {
            if (!s.parent_id) servicesGrouped.set(s.id, [s.title]);
        });

        services.forEach(s => {
            if (s.parent_id && servicesGrouped.has(s.parent_id)) {
                const servicesUnderTheGroup = servicesGrouped.get(s.parent_id);
                servicesUnderTheGroup.push(s.title);
                servicesGrouped.set(s.parent_id, servicesUnderTheGroup);
            }
        })

        return Array.from(servicesGrouped.keys()).map(key => {
            const serviceGroup = servicesGrouped.get(key);
            return serviceGroup.map((service, index) => {
                return <div key={service} className={`${index === 0 ? 'font-weight-bold-light pt-3 pb-1' : 'ml-3'}`}>
                    {index > 0 && <i className="icon icon-check-filled cdp-text-primary mr-2 consent-check"></i>}
                    <span>{service}</span>
                </div>;
            });
        })
    }

    return <div className="px-3 py-2 bg-white shadow-sm rounded">
                <Formik
                    initialValues={ initialFormValues}
                    displayName="UpdateMyProfileForm"
                    validationSchema={updateMyProfileSchema}
                    onSubmit={formSubmitHandler}
                    enableReinitialize
                >
                    {formikProps => (
                <Form onSubmit={formikProps.handleSubmit}>
                    <h4 className="border-bottom pb-3 pt-2"><i className="far fa-user mr-2"></i>My Profile</h4>
                            {myProfileInfo && <div className="row my-3">
                                <div className="col-12 col-lg-8">
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="form-group">
                                                <label className="font-weight-bold-light" htmlFor="first_name">First Name <span className="text-danger">*</span></label>
                                                <Field data-testid="first_name" className="form-control" type="name" name="first_name" />
                                                <div className="invalid-feedback" data-testid="firstNameError"><ErrorMessage name="first_name" /></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="form-group">
                                                <label className="font-weight-bold-light" htmlFor="last_name">Last Name <span className="text-danger">*</span></label>
                                                <Field data-testid="last_name" className="form-control" type="name" name="last_name" />
                                                <div className="invalid-feedback" data-testid="lastNameError"><ErrorMessage name="last_name" /></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="form-group">
                                                <label className="font-weight-bold-light" htmlFor="email">Email <span className="text-danger">*</span></label>
                                                <Field data-testid="email" className="form-control" type="email" name="email" autoComplete="username" />
                                                <div className="invalid-feedback" data-testid="emailError"><ErrorMessage name="email" /></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="form-group">
                                                <label className="font-weight-bold-light" htmlFor="phone">Phone Number</label>
                                                <div className="phone-list">
                                                    <div className="input-group phone-input">
                                                        <span className="input-group-btn">
                                                    <Dropdown>
                                                        {desiredCountryList.map((country, index) => {
                                                            return (
                                                                <Dropdown.Toggle key={index} variant="" className="p-1 pt-2 px-2 pr-0 d-flex align-items-center rounded-0">
                                                                    {
                                                                        onChangePhonefield(formikProps) === null || onChangePhonefield(formikProps) === undefined ?
                                                                            <span height="20" width="20">Select</span> :
                                                                            <img className="mr-2" height="20" width="20" src={onChangePhonefield(formikProps) === null || onChangePhonefield(formikProps) === undefined ? '' : onChangePhonefield(formikProps).flag} />
                                                                    }
                                                                    <span className="country-phone-code">
                                                                        {onChangePhonefield(formikProps) === null || onChangePhonefield(formikProps) === undefined ? "" : onChangePhonefield(formikProps).countryCode}
                                                                    </span>
                                                                </Dropdown.Toggle> );
                                                        })}
                                                        <Dropdown.Menu>
                                                            {desiredCountryList.map((country, index) => {
                                                                return <Dropdown.Item onClick={() => {
                                                                        const countryCode = country.countryCallingCode;
                                                                        formikProps.setFieldValue('country_code', countryCode);
                                                                        formikProps.setFieldValue('phone', `+${countryCode}`);
                                                                        phoneFieldRef.focus();
                                                                    }} key={index} className="px-2 d-flex align-items-center">
                                                                        <img height="20" width="20" src={generateCountryIconPath(country.countryNameEn)} />
                                                                        <span className="country-name pl-2">{country.countryNameEn}</span>
                                                                        <span className="country-phone-code pl-1">{`+${country.countryCallingCode}`}</span>
                                                                    </Dropdown.Item>
                                                            })}
                                                        </Dropdown.Menu>
                                                    </Dropdown>
                                                        </span>
                                                <Field data-testid="phone" innerRef={(ele) => setPhoneFieldRef(ele)} className="form-control rounded" type="text" name="phone" onChange={(e) => handlePhoneFieldChange(e, formikProps)} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="invalid-feedback">
                                                <ErrorMessage name="phone" data-testid="phoneError" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="form-group">
                                                <label className="font-weight-bold-light" htmlFor="status">Status<span className="text-danger"></span></label>
                                                <div>{myProfileInfo.status === 'active' ? 'Active' : 'Inactive'}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="form-group">
                                                <label className="font-weight-bold-light" htmlFor="profile">Profile<span className="text-danger"></span></label>
                                                <div>{myProfileInfo && myProfileInfo.profile ? myProfileInfo.profile.title : 'The user has no profile.'}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="form-group">
                                                <label className="font-weight-bold-light" htmlFor="role">Role<span className="text-danger"></span></label>
                                                <div>{myProfileInfo && myProfileInfo.role ? myProfileInfo.role.title : 'The user has no role.'}</div>
                                            </div>
                                        </div>
                                    </div>
                                    {getMyCountryISO2.length > 0 && <div className="row">
                                        <div className="col-12">
                                            <div className="form-group">
                                                <label className="font-weight-bold-light" htmlFor="countries">Countries<span className="text-danger"></span></label>
                                                {getCodbaseDescriptionsFromISOCodes(getMyCountryISO2).map(country => <div key={country} className="custom-control custom-checkbox pl-3">
                                                    <i className="icon icon-check-filled cdp-text-primary mr-2 consent-check"></i>
                                                    <span>{country}</span>
                                                </div>)}
                                            </div>
                                        </div>
                                    </div>}
                                    {getMyApplicationNames().length > 0 && <div className="row">
                                        <div className="col-12">
                                            <div className="form-group">
                                                <label className="font-weight-bold-light" htmlFor="applications">Applications<span className="text-danger"></span></label>
                                                <ul className="list-unstyled pl-0 py-2 mb-0">
                                                    {getMyApplicationNames().map(appName => <li key={appName} className="ml-3">
                                                        <i className="icon icon-check-filled cdp-text-primary mr-2 consent-check"></i>
                                                        {appName}
                                                    </li>)}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>}
                                    {myProfileInfo && myProfileInfo.services && myProfileInfo.services.length > 0 && <div className="row">
                                        <div className="col-12">
                                            <div className="form-group">
                                                <label className="font-weight-bold-light mb-0 h4" htmlFor="services">Services<span className="text-danger"></span></label>
                                                <ul className="list-unstyled pl-0 py-2 mb-0">
                                                    {renderServices()}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>}
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="form-group">
                                                <label className="font-weight-bold-light" htmlFor="last-login">Last Login</label>
                                                <div>{myProfileInfo.last_login ? new Date(myProfileInfo.last_login).toLocaleDateString('en-GB').replace(/\//g, '.') : ''}</div>
                                            </div>
                                        </div>
                                    </div>
                                    {myProfileInfo && myProfileInfo.type !== 'admin' && <div className="row">
                                        <div className="col-12">
                                            <div className="form-group">
                                                <label className="font-weight-bold-light" htmlFor="expiry-date">Expiry Date</label>
                                                <div>
                                                    {myProfileInfo.expiry_date ? new Date(myProfileInfo.expiry_date).toLocaleDateString('en-GB').replace(/\//g, '.') : ''}
                                                </div>
                                            </div>
                                        </div>
                                    </div>}
                                    <button type="submit" className="btn btn-block text-white cdp-btn-secondary mt-4 p-2" >Update</button>
                                </div>
                            </div>}
                        </Form>
                    )}
                </Formik>
            </div>
}

export default UpdateMyProfile;

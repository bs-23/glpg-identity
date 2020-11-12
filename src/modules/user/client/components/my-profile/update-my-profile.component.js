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
    const [selectedCountryCode, setSelectedCountryCode] = useState(0);
    const { addToast } = useToasts();
    const dispatch = useDispatch();

    const CountryCodesObject = CountryCodes.customList('countryCode', '+{countryCallingCode}');

    const getMyCountryISO2 = () => {
        const myProfile = myProfileInfo.profile;
        const myRoles = myProfileInfo.role;
        const myProfileCountries = [];
        const myRoleCountries = [];

        if(myProfile && myProfile.permissionSets) {
            myProfile.permissionSets.map(ps => {
                if(ps.countries) {
                    ps.countries.map(country_iso2 => myProfileCountries.push(country_iso2));
                }
            })
        }

        if(myRoles) {
            myRoles.map(myRole => {
                if(myRole.permissionSets) {
                    myRole.permissionSets.map(ps => {
                        if(ps.countries){
                            ps.countries.map(country_iso2 => myRoleCountries.push(country_iso2));
                        }
                    });
                }
            })
        }

        const myCountries = [...new Set([...myProfileCountries, ...myRoleCountries])];

        return myCountries;
    }

    const getMyApplicationNames = () => {
        const myProfile = myProfileInfo.profile;
        const myRoles = myProfileInfo.role;
        const myProfileApplications = [];
        const myRoleApplications = [];

        if(myProfile && myProfile.permissionSets) {
            myProfile.permissionSets.map(ps => {
                if(ps.application){
                    ps.application.map(({name}) => myProfileApplications.push(name));
                }
            })
        }

        if(myRoles) {
            myRoles.map(myRole => {
                if(myRole.permissionSets) {
                    myRole.permissionSets.map(ps => {
                        if(ps.application) {
                            ps.application.map(({name}) => myRoleApplications.push(name));
                        }
                    });
                }
            })
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

    const activateCountryCodeFlagFromPhone = (phone) => {
        if(!phone) return;
        const countryIndex = getDatasyncCountryIndexFromPhone(phone);
        setSelectedCountryCode(countryIndex);
    }

    const getPhoneNumberWithoutCountryCode = (phone) => {
        if(!phone) return '';

        const countryIdx = getDatasyncCountryIndexFromPhone(phone);
        if(countryIdx < 0) return phone;

        const countryCodeForPhoneNumber = CountryCodesObject[countries[countryIdx].country_iso2];
        let phoneWithoutCountryCodeStartingIdx = phone.indexOf(countryCodeForPhoneNumber);
        phoneWithoutCountryCodeStartingIdx = phoneWithoutCountryCodeStartingIdx + countryCodeForPhoneNumber.length;
        const phoneWithoutCountryCode = phone.substr(phoneWithoutCountryCodeStartingIdx);
        return phoneWithoutCountryCode;
    }

    const initialFormValues = {
        first_name: myProfileInfo && myProfileInfo.first_name,
        last_name: myProfileInfo && myProfileInfo.last_name,
        email: myProfileInfo && myProfileInfo.email,
        phone: myProfileInfo && getPhoneNumberWithoutCountryCode(myProfileInfo.phone),
        isCountryFlagActive: myProfileInfo && (myProfileInfo.phone === '' || isCountryDetectedFromPhone(myProfileInfo.phone))
    }

    const generateCountryIconPath = (country) => {
        if(country) return `/assets/flag/flag-${country.toLowerCase().replace(/ /g, "-")}.svg`;
        return `/assets/flag/flag-placeholder.svg`;
    }

    const formSubmitHandler = async (values, actions) => {
        try{
            const matchedCountry = countries[selectedCountryCode];
            let countryCodeForPhoneNumber = '';
            if(matchedCountry) countryCodeForPhoneNumber = CountryCodesObject[matchedCountry.country_iso2];
            const phone = values.phone ? countryCodeForPhoneNumber + values.phone : '';

            delete values.isCountryFlagActive;

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

    const handleCountryFlagClick = (index, formikProps) => {
        const { setFieldValue } = formikProps;
        setFieldValue('isCountryFlagActive', true);
        setSelectedCountryCode(index);
    }

    const handlePhoneFieldChange = (e, formikProps) => {
        const currentPhoneValue = e.target.value;
        const { setFieldValue } = formikProps;

        const isCountryFlagActive = selectedCountryCode >= 0 && selectedCountryCode < countries.length;

        if(isCountryFlagActive) {
            setFieldValue('phone', currentPhoneValue);
            setFieldValue('isCountryFlagActive', true);
        }else{
            const wasCountryFoundForPhoneCountryCode = getDatasyncCountryIndexFromPhone(currentPhoneValue) >= 0 ? true : false;
            setFieldValue('phone', getPhoneNumberWithoutCountryCode(currentPhoneValue));
            setFieldValue('isCountryFlagActive', wasCountryFoundForPhoneCountryCode);
            activateCountryCodeFlagFromPhone(currentPhoneValue);
        }
    }

    useEffect(() => {
        activateCountryCodeFlagFromPhone(myProfileInfo.phone);
    }, [myProfileInfo, countries])

    return <div className="px-3 py-2 bg-white shadow-sm rounded">
                <Formik
                    initialValues={initialFormValues}
                    displayName="UpdateMyProfileForm"
                    validationSchema={updateMyProfileSchema}
                    onSubmit={formSubmitHandler}
                    enableReinitialize
                >
                    {formikProps => (
                <Form onSubmit={formikProps.handleSubmit}>
                    <h4 className="border-bottom pb-3 pt-2"><i className="far fa-user mr-2"></i>My Profile</h4>
                            <div className="row my-3">
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
                                                                {
                                                                    selectedCountryCode >= 0 && selectedCountryCode < countries.length
                                                                        ? <Dropdown.Toggle  variant="" className="p-1 pt-2 px-2 pr-0 d-flex align-items-center rounded-0">
                                                                            <img height="20" width="20" src={generateCountryIconPath(countries[selectedCountryCode].codbase_desc)} title={countries[selectedCountryCode].codbase_desc} />
                                                                            <span className="country-phone-code pl-1">{ CountryCodesObject[countries[selectedCountryCode].country_iso2] }</span>
                                                                            </Dropdown.Toggle>
                                                                        : <Dropdown.Toggle variant="" className="p-1 pt-2 px-2 pr-0 d-flex align-items-center rounded-0">
                                                                            <img height="20" width="20" src={generateCountryIconPath()} title="Unknown Country" />
                                                                            <span className="country-phone-code pl-1">xxxx</span>
                                                                            </Dropdown.Toggle>
                                                                }
                                                                <Dropdown.Menu>
                                                                    {
                                                                        countries.map( (country, index) => {
                                                                            return index === selectedCountryCode ? null :
                                                                            (<Dropdown.Item onClick={() => handleCountryFlagClick(index, formikProps)} key={index} className="px-2 d-flex align-items-center">
                                                                                <img height="20" width="20" src={generateCountryIconPath(country.codbase_desc)} title={country.codbase_desc} />
                                                                                <span className="country-name pl-2">{ country.codbase_desc }</span>
                                                                                <span className="country-phone-code pl-1">{ CountryCodesObject[country.country_iso2] }</span>
                                                                            </Dropdown.Item>)
                                                                        })
                                                                    }
                                                                </Dropdown.Menu>
                                                            </Dropdown>
                                                        </span>
                                                        <Field data-testid="phone" className="form-control rounded" type="text" name="phone" onChange={(e) => handlePhoneFieldChange(e, formikProps)} />
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
                                                <Field
                                                    as="select"
                                                    name="status"
                                                    className="form-control"
                                                    disabled
                                                >
                                                    <option value="active">Active</option>
                                                    <option value="inactive">Inactive</option>
                                                </Field>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="form-group">
                                                <label className="font-weight-bold-light" htmlFor="profile">Profile<span className="text-danger"></span></label>
                                                <Field
                                                    as="select"
                                                    name="profile"
                                                    className="form-control"
                                                    value={myProfileInfo && myProfileInfo.profile ? myProfileInfo.profile.title : ''}
                                                    disabled
                                                >
                                                    <option value={myProfileInfo && myProfileInfo.profile ? myProfileInfo.profile.title : ''}>{myProfileInfo && myProfileInfo.profile ? myProfileInfo.profile.title : ''}</option>
                                                </Field>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="form-group">
                                                <label className="font-weight-bold-light" htmlFor="role">Role<span className="text-danger"></span></label>
                                                <Field
                                                    as="select"
                                                    name="role"
                                                    className="form-control"
                                                    value={myProfileInfo && myProfileInfo.role.length ? myProfileInfo.role[0].title : ''}
                                                    disabled
                                                >
                                                    <option value={myProfileInfo && myProfileInfo.role.length ? myProfileInfo.role[0].title : ''}>{myProfileInfo && myProfileInfo.role.length ? myProfileInfo.role[0].title : ''}</option>
                                                </Field>
                                            </div>
                                        </div>
                                    </div>
                                    {getMyCountryISO2().length > 0 && <div className="row">
                                        <div className="col-12">
                                            <div className="form-group">
                                                <label className="font-weight-bold-light" htmlFor="countries">Countries<span className="text-danger"></span></label>
                                                {getCodbaseDescriptionsFromISOCodes(getMyCountryISO2()).map(country => <div key={country} className="custom-control custom-checkbox">
                                                    <input
                                                        name="countries"
                                                        type="checkbox"
                                                        value={country}
                                                        className="custom-control-input"
                                                        checked
                                                        disabled
                                                    />
                                                    <label className="custom-control-label" for={country}>{country}</label>
                                                </div>)}
                                            </div>
                                        </div>
                                    </div>}
                                    {getMyApplicationNames().length > 0 && <div className="row">
                                        <div className="col-12">
                                            <div className="form-group">
                                                <label className="font-weight-bold-light" htmlFor="applications">Applications<span className="text-danger"></span></label>
                                                <ul className="list-unstyled pl-0 py-2 mb-0">
                                                    {getMyApplicationNames().map(appName => <li key={appName} className="">
                                                        <label className="d-flex justify-content-between align-items-center">
                                                            <span className="switch-label">{appName}</span>
                                                            <span className="switch">
                                                                <input name="roles" type="checkbox" value={appName} checked disabled />
                                                                <span className="slider round"></span>
                                                            </span>
                                                        </label>
                                                    </li>)}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>}
                                    {myProfileInfo && myProfileInfo.serviceCategories && myProfileInfo.serviceCategories.length > 0 && <div className="row">
                                        <div className="col-12">
                                            <div className="form-group">
                                                <label className="font-weight-bold-light" htmlFor="serviceCategories">Service Categories<span className="text-danger"></span></label>
                                                <ul className="list-unstyled pl-0 py-2 mb-0">
                                                    {myProfileInfo.serviceCategories.map(sc => <li key={sc.slug} className="">
                                                        <label className="d-flex justify-content-between align-items-center">
                                                            <span className="switch-label">{sc.title}</span>
                                                            <span className="switch">
                                                                <input name="serviceCategories" type="checkbox" value={sc.title} checked disabled />
                                                                <span className="slider round"></span>
                                                            </span>
                                                        </label>
                                                    </li>)}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>}
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="form-group">
                                                <label className="font-weight-bold-light" htmlFor="last-login">Last Login</label>
                                                <Field data-testid="last-login" className="form-control" type="text" name="last-login" disabled value={myProfileInfo.last_login ? new Date(myProfileInfo.last_login).toLocaleDateString('en-GB').replace(/\//g, '.') : ''} />
                                            </div>
                                        </div>
                                    </div>
                                    {myProfileInfo && myProfileInfo.type !== 'admin' && <div className="row">
                                        <div className="col-12">
                                            <div className="form-group">
                                                <label className="font-weight-bold-light" htmlFor="expiry-date">Expiry Date</label>
                                                <Field data-testid="expiry-date" className="form-control" type="text" name="expiry-date" disabled value={myProfileInfo.expiry_date ? new Date(myProfileInfo.expiry_date).toLocaleDateString('en-GB').replace(/\//g, '.') : ''} />
                                            </div>
                                        </div>
                                    </div>}
                                    <button type="submit" className="btn btn-block text-white cdp-btn-secondary mt-4 p-2" >Update</button>
                                </div>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
}

export default UpdateMyProfile;

import React, { useEffect, useState } from 'react';
import { Form, Formik, Field, ErrorMessage, FieldArray } from "formik";
import { useSelector, useDispatch } from 'react-redux';
import Dropdown from 'react-bootstrap/Dropdown';
import CountryCodes from 'country-codes-list';
import PhoneNumber from 'awesome-phonenumber';
import { useToasts } from "react-toast-notifications";
import { updateSignedInUserProfile } from '../../user.actions';
import { updateMyProfileSchema } from '../../user.schema';

const UpdateMyProfile = () => {
    const myProfileInfo = useSelector(state => state.userReducer.loggedInUser);
    const countries = useSelector(state => state.userReducer.countries);
    const [selectedCountryCode, setSelectedCountryCode] = useState(0);
    const { addToast } = useToasts();
    const dispatch = useDispatch();

    const CountryCodesObject = CountryCodes.customList('countryCode', '+{countryCallingCode}');

    const activateCountryCodeFromPhone = (phone) => {
        if(!phone) return;
        const phoneNumber = new PhoneNumber(phone);
        const phoneNumberCountryISO = phoneNumber.getRegionCode();
        const countryIndex = countries.findIndex(c => c.country_iso2.toLowerCase() === (phoneNumberCountryISO || '').toLowerCase());
        setSelectedCountryCode(countryIndex);
    }

    const getPhoneNumberWithoutCountryCode = (phone) => {
        if(!phone) return '';
        const phoneNumberInNationalFormat = PhoneNumber(phone).getNumber('significant');
        return phoneNumberInNationalFormat || phone;
    }

    const initialFormValues = {
        first_name: myProfileInfo && myProfileInfo.first_name,
        last_name: myProfileInfo && myProfileInfo.last_name,
        email: myProfileInfo && myProfileInfo.email,
        phone: myProfileInfo && getPhoneNumberWithoutCountryCode(myProfileInfo.phone)
    }

    const generateCountryIconPath = (country) => {
        if(country) return `/assets/flag/flag-${country.toLowerCase().replace(/ /g, "-")}.svg`;
        return `/assets/flag/flag-placeholder.svg`;
    }

    const formSubmitHandler = async (values, actions) => {
        try{
            const countryCodeForPhoneNumber = CountryCodesObject[countries[selectedCountryCode].country_iso2];
            const phone = values.phone ? countryCodeForPhoneNumber + values.phone : '';
            const formData = { ...values, phone }
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
        actions.setSubmitting(false);
    }

    const getCodbaseDescriptionsFromISOCodes = (countryISOCodes) => {
        if(!countryISOCodes) return [];
        const filteredCountries = countries.filter(i => myProfileInfo.countries.includes(i.country_iso2))
        const codbaseDescriptions = filteredCountries.map(i => i.codbase_desc);
        return codbaseDescriptions;
    }

    useEffect(() => {
        activateCountryCodeFromPhone(myProfileInfo.phone);
    }, [myProfileInfo, countries])

    return <div className="my-2">
                <Formik
                    initialValues={initialFormValues}
                    displayName="UpdateMyProfileForm"
                    validationSchema={updateMyProfileSchema}
                    onSubmit={formSubmitHandler}
                    enableReinitialize
                >
                    {formikProps => (
                <Form onSubmit={formikProps.handleSubmit}>
                    <h4 className="border-bottom pb-3 pt-2">My Profile</h4>
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
                                                                    countries.map( (country, index) => {
                                                                        return index === selectedCountryCode ? (
                                                                        <Dropdown.Toggle key={index} variant="" className="p-1 pt-2 px-2 pr-0 d-flex align-items-center rounded-0">
                                                                            <img height="20" width="20" src={generateCountryIconPath(country.codbase_desc)} title={country.codbase_desc} />
                                                                            <span className="country-phone-code pl-1">{ CountryCodesObject[country.country_iso2] }</span>
                                                                        </Dropdown.Toggle>) : null
                                                                    })
                                                                }
                                                                <Dropdown.Menu>
                                                                    {
                                                                        countries.map( (country, index) => {
                                                                            return index === selectedCountryCode ? null :
                                                                            (<Dropdown.Item onClick={() => setSelectedCountryCode(index)} key={index} className="px-2 d-flex align-items-center">
                                                                                <img height="20" width="20" src={generateCountryIconPath(country.codbase_desc)} title={country.codbase_desc} />
                                                                                <span className="country-name pl-2">{ country.codbase_desc }</span>
                                                                                <span className="country-phone-code pl-1">{ CountryCodesObject[country.country_iso2] }</span>
                                                                            </Dropdown.Item>)
                                                                        })
                                                                    }
                                                                </Dropdown.Menu>
                                                            </Dropdown>
                                                        </span>
                                                        <Field data-testid="phone" className="form-control rounded" type="text" name="phone" />
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
                                                <label className="font-weight-bold-light" htmlFor="countries">Countries<span className="text-danger"></span></label>
                                                {getCodbaseDescriptionsFromISOCodes((myProfileInfo || {}).countries).map(country => <div key={country} className="custom-control custom-checkbox">
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
                                    </div>
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="form-group">
                                                <label className="font-weight-bold-light" htmlFor="roles">Roles<span className="text-danger"></span></label>
                                                <ul className="list-unstyled pl-0 py-2 mb-0">
                                                    {myProfileInfo && myProfileInfo.roles && myProfileInfo.roles.map(role => <li key={role.title} className="">
                                                        <label className="d-flex justify-content-between align-items-center">
                                                            <span className="switch-label">{role.title}</span>
                                                            <span className="switch">
                                                                <input name="roles" type="checkbox" value={role.title} checked disabled />
                                                                <span className="slider round"></span>
                                                            </span>
                                                        </label>
                                                    </li>)}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    {myProfileInfo && myProfileInfo.application && <div className="row">
                                        <div className="col-12">
                                            <div className="form-group">
                                                <label className="font-weight-bold-light" htmlFor="applications">Applications<span className="text-danger"></span></label>
                                                <ul className="list-unstyled pl-0 py-2 mb-0">
                                                    <li key={myProfileInfo.application.name} className="">
                                                        <label className="d-flex justify-content-between align-items-center">
                                                            <span className="switch-label">{myProfileInfo.application.name}</span>
                                                            <span className="switch">
                                                                <input name="roles" type="checkbox" value={myProfileInfo.application.name} checked disabled />
                                                                <span className="slider round"></span>
                                                            </span>
                                                        </label>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>}
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="form-group">
                                                <label className="font-weight-bold-light" htmlFor="last-login">Last Login</label>
                                                <Field data-testid="last-login" className="form-control" type="text" name="last-login" disabled value={new Date(myProfileInfo.last_login).toLocaleDateString('en-GB').replace(/\//g, '.')} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="form-group">
                                                <label className="font-weight-bold-light" htmlFor="expiry-date">Expiry Date</label>
                                                <Field data-testid="expiry-date" className="form-control" type="text" name="expiry-date" disabled value={new Date(myProfileInfo.expiry_date).toLocaleDateString('en-GB').replace(/\//g, '.')} />
                                            </div>
                                        </div>
                                    </div>
                                    <button type="submit" className="btn btn-block text-white cdp-btn-secondary mt-4 p-2" >Update</button>
                                </div>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
}

export default UpdateMyProfile;

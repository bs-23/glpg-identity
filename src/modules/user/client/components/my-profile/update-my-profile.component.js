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

    useEffect(() => {
        activateCountryCodeFromPhone(myProfileInfo.phone);
    }, [myProfileInfo, countries])

    return <div>
                <Formik
                    initialValues={initialFormValues}
                    displayName="UpdateMyProfileForm"
                    validationSchema={updateMyProfileSchema}
                    onSubmit={formSubmitHandler}
                    enableReinitialize
                >
                    {formikProps => (
                        <Form onSubmit={formikProps.handleSubmit}>
                            <h4>Update Profile</h4>
                            <div className="row my-3">
                                <div className="col-12 col-lg-8 col-xl-6">
                                    <div className="row">
                                        <div className="col-12 col-sm-6">
                                            <div className="form-group">
                                                <label className="font-weight-bold" htmlFor="first_name">First Name <span className="text-danger">*</span></label>
                                                <Field data-testid="first_name" className="form-control" type="name" name="first_name" />
                                                <div className="invalid-feedback" data-testid="firstNameError"><ErrorMessage name="first_name" /></div>
                                            </div>
                                        </div>
                                        <div className="col-12 col-sm-6">
                                            <div className="form-group">
                                                <label className="font-weight-bold" htmlFor="last_name">Last Name <span className="text-danger">*</span></label>
                                                <Field data-testid="last_name" className="form-control" type="name" name="last_name" />
                                                <div className="invalid-feedback" data-testid="lastNameError"><ErrorMessage name="last_name" /></div>
                                            </div>
                                        </div>
                                        <div className="col-12 col-sm-6">
                                            <div className="form-group">
                                                <label className="font-weight-bold" htmlFor="email">Email <span className="text-danger">*</span></label>
                                                <Field data-testid="email" className="form-control" type="email" name="email" autoComplete="username" />
                                                <div className="invalid-feedback" data-testid="emailError"><ErrorMessage name="email" /></div>
                                            </div>
                                        </div>
                                        <div className="col-12 col-sm-6">
                                            <div className="form-group">
                                                <label className="font-weight-bold" htmlFor="phone">Phone Number</label>
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
                                    <button type="submit" className="btn btn-block text-white cdp-btn-secondary mt-4 p-2" >Update</button>
                                </div>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
}

export default UpdateMyProfile;

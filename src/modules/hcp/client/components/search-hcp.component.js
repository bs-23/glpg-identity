import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Form, Formik, Field, ErrorMessage } from 'formik';
import Select, { components } from 'react-select';

const SearchHcp = () => {
    const countries = useSelector(state => state.countryReducer.countries);
    const [selectedOption, setSelectedOption] = useState([]);
    const [specialties, setSpecialties] = useState([]);

    // const handleChange = selectedOption => {
    //     console.log(`Option selected:`, selectedOption);
    //     setSelectedOption(selectedOption)
    // };

    const resetSearch = (props) => {
        /**
         * To-DO
         * - reset country selection
         * - clear results
         */
        props.resetForm();
    };

    useEffect(() => {
        const getSpecialties = async () => {
            const codbases = selectedOption.map(item => `codbases=${item.value}`);
            const parameters = codbases.join('&');
            if (parameters) {
                const response = await axios.get(`/api/hcps/specialties?${parameters}`);
                console.log(response);
                setSpecialties(response.data);
            }
            else setSpecialties([]);
        }

        getSpecialties();
    }, [selectedOption]);

    const getCountries = () => countries.map(country => ({ value: country.codbase, label: country.codbase_desc }));
    const getSpecialties = () => specialties.map( i => ({ value: i.codDescription, label: i.codDescription }));

    const CustomOption = ({ children, ...props }) => {
        return (
            <components.Option {...props}>
                <div className="custom-control custom-checkbox">
                    <input type="checkbox" className="custom-control-input" checked={props.isSelected} onChange={() => null} />
                    <label className="custom-control-label" for="customCheck1">{children}</label>
                </div>
            </components.Option>
        );
    };

    return (
        <main className="app__content cdp-light-bg h-100">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 px-0 px-sm-3">
                        <div className="shadow-sm bg-light pb-3">
                            <h2 className="d-flex align-items-center p-3 px-sm-3 py-sm-3 page-title light">
                                <span className="page-title__text font-weight-bold">OKLA Search</span>
                            </h2>
                            <div className="add-user mx-3 mt-0 p-3 bg-white rounded border">
                            <Formik
                                initialValues={{
                                    countries: [],
                                    in_my_contract: false,
                                    phonetic: false,
                                    duplicates: false,
                                    firstname: '',
                                    lastname: '',
                                    address_label: '',
                                    city: '',
                                    postal_code: '',
                                    one_key_id: '',
                                    individual: '',
                                    specialties: []
                                }}
                                displayName="SearchForm"
                                onSubmit={(values, actions) => {
                                    console.log("testing", values)
                                    actions.setSubmitting(false);
                                }}
                            >
                                { formikProps => (
                                    <Form onSubmit={formikProps.handleSubmit}>
                                        <div className="row align-items-center">
                                            <div className="col-12 col-sm-6 col-lg-8">
                                                <div className="form-group">
                                                    <label for="exampleInputEmail1">Countries</label>
                                                    <Select
                                                        defaultValue={[]}
                                                        isMulti={true}
                                                        name="countries"
                                                        components={{Option: CustomOption}}
                                                        hideSelectedOptions={false}
                                                        // controlShouldRenderValue = { false }
                                                        options={getCountries()}
                                                        // onChange={handleChange}
                                                        className="multiselect"
                                                        classNamePrefix="multiselect"
                                                        onChange = { selectedOption => {
                                                            formikProps.values.countries = selectedOption;
                                                            setSelectedOption(selectedOption || [])
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="col-12 col-sm-6 col-lg-4 mt-0 mt-sm-3">
                                                <div className="custom-control custom-checkbox custom-control-inline my-1 mr-sm-2">
                                                    <input type="checkbox" className="custom-control-input" name="in_my_contract" id="customControlInline" onChange={(e) => formikProps.values.in_my_contract = e.target.checked}/>
                                                    <label className="custom-control-label" for="customControlInline">In My Contract</label>
                                                </div>
                                                <div className="custom-control custom-checkbox custom-control-inline my-1 mr-sm-2">
                                                    <input type="checkbox" className="custom-control-input" name="phonetic" id="customControlInline2" onChange={(e) => formikProps.values.phonetic = e.target.checked} />
                                                    <label className="custom-control-label" for="customControlInline2">Phonetic</label>
                                                </div>
                                                <div className="custom-control custom-checkbox custom-control-inline my-1 mr-sm-2">
                                                    <input type="checkbox" className="custom-control-input" name="duplicates" id="customControlInline3" onChange={(e) => formikProps.values.duplicates = e.target.checked} />
                                                    <label className="custom-control-label" for="customControlInline3">Duplicates</label>
                                                </div>
                                            </div>
                                        </div>
                                        <h5 className="border-bottom pt-5 pb-2 "><i className="far fa-user cdp-text-secondary mr-2"></i>Individual</h5>
                                        <div className="row">
                                            <div className="col-12 col-sm-4">
                                                <div className="form-group">
                                                    <label for="exampleFormControlInput1">First Name</label>
                                                    <Field className="form-control firstname" type='text' name='firstname' id='firstname' />
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-4">
                                                <div className="form-group">
                                                    <label for="exampleFormControlInput1">Last Name</label>
                                                    <Field className="form-control lastname" type='text' name='lastname' id='lastname' />
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-4">
                                                <div className="form-group">
                                                    <label for="Speciality">Speciality</label>
                                                    <Select
                                                        defaultValue={[]}
                                                        isMulti={true}
                                                        name="specialties"
                                                        components={{Option: CustomOption}}
                                                        hideSelectedOptions={false}
                                                        // controlShouldRenderValue = { false }
                                                        options={getSpecialties()}
                                                        className="multiselect"
                                                        classNamePrefix="multiselect"
                                                        onChange = { selectedOption => {
                                                            console.log(`Option selected:`, selectedOption);
                                                            formikProps.values.specialties = selectedOption;
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <h5 className="border-bottom pt-4 pb-2 "><i className="far fa-building cdp-text-secondary mr-2"></i>Workplace</h5>
                                        <div className="row">
                                            <div className="col-12 col-sm-4">
                                                <div className="form-group">
                                                    <label for="AddressLabel">Address Label</label>
                                                    <Field className="form-control address_label" type='text' name='address_label' id='address_label' />
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-4">
                                                <div className="form-group">
                                                    <label for="City">City</label>
                                                    <Field className="form-control city" type='text' name='city' id='city' />
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-4">
                                                <div className="form-group">
                                                    <label for="PostalCode">Postal Code</label>
                                                    <Field className="form-control postal_code" type='text' name='postal_code' id='postal_code' />
                                                </div>
                                            </div>
                                        </div>
                                        <h5 className="border-bottom pt-4 pb-2 "><i className="fas fa-key cdp-text-secondary mr-2"></i>Identifiers</h5>
                                        <div className="row">
                                            <div className="col-12 col-sm-4">
                                                <div className="form-group">
                                                    <label for="OnekeyID">Onekey ID</label>
                                                    <Field className="form-control one_key_id" type='text' name='one_key_id' id='one_key_id' />
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-4">
                                                <div className="form-group">
                                                    <label for="Individual ">Individual - Identifier</label>
                                                    <Field className="form-control individual" type='text' name='individual' id='individual' />
                                                </div>
                                            </div>
                                        </div>
                                            <div className="row">
                                                <div className="col-6">
                                                    <button type="reset" className="btn btn-block btn-secondary mt-4 p-2" onClick={() => resetSearch(formikProps)}>RESET</button>
                                                </div>
                                                <div className="col-6">
                                                    <button type="submit" className="btn btn-block text-white cdp-btn-secondary mt-4 p-2" disabled={!formikProps.values.countries || !formikProps.values.countries.length || !(formikProps.values.firstname  || formikProps.values.lastname || formikProps.values.address_label || formikProps.values.city || formikProps.values.postal_code || formikProps.values.one_key_id || formikProps.values.individual || (formikProps.values.specialties && formikProps.values.specialties.length))}>SEARCH</button>
                                                </div>
                                            </div>
                                    </Form>
                                )}
                            </Formik>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <div className="my-3">
                            <div className="d-sm-flex justify-content-between align-items-center mb-3 mt-4">
                                <h4 className="cdp-text-primary font-weight-bold mb-3 mb-sm-0">Search Result</h4>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="mr-2"><i className="fas fa-check cdp-text-primary"></i> Valid</span>
                                    <span><i className="fas fa-times cdp-text-secondary"></i> Invalid</span>
                                </div>
                            </div>
                            <div className="table-responsive shadow-sm bg-white">
                                <table className="table table-hover table-sm mb-0 cdp-table">
                                    <thead className="cdp-bg-primary text-white cdp-table__header">
                                        <tr>
                                            <th>Name</th>
                                            <th>Speciality</th>
                                            <th>Workplace</th>
                                            <th>Onekey ID</th>
                                            <th>Individual - Identifier</th>
                                            <th>Conuntry</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="cdp-table__body bg-white">
                                        <tr>
                                            <td>David Alian</td>
                                            <td>Dentist</td>
                                            <td>
                                                <div className="currentWorkplace"><i className="fas fa-check mr-1 cdp-text-primary"></i> IBN sina, Dhaka</div>
                                                <div className="previousWorkplace"><i className="fas fa-times mr-1 cdp-text-secondary"></i> Popular, Dhaka</div>
                                            </td>
                                            <td>551255</td>
                                            <td>564564565</td>
                                            <td>Belgium</td>
                                            <td>Detail</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default SearchHcp;

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Form, Formik, Field } from 'formik';
import Select, { components } from 'react-select';
import { getAllCountries } from '../../../core/client/country/country.actions';
import OklaHcpDetails from './okla-hcp-details.component';
import getUserPermittedCountries from '../../../core/client/util/user-country';

const SearchProfessionalHcp = () => {
    const dispatch = useDispatch();
    const location = useLocation();

    const countries = useSelector(state => state.countryReducer.countries);
    const allCountries = useSelector(state => state.countryReducer.allCountries);
    const userProfile = useSelector(state => state.userReducer.loggedInUser);
    const userCountries = getUserPermittedCountries(userProfile, countries);
    const [selectedCountries, setSelectedCountries] = useState([]);
    const [specialties, setSpecialties] = useState([]);
    const [specialtiesFlag, setSpecialtiesFlag] = useState(false);
    const [selectedIndividual, setSelectedIndividual] = useState(null);
    const [users, setUsers] = useState({});
    const [formData, setFormData] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [hcpProfile, setHcpProfile] = useState(null);

    const params = new URLSearchParams(window.location.search);
    const initialFormValues = {
        countries: [],
        isInContract: false,
        phonetic: false,
        duplicates: false,
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        postCode: '',
        onekeyId: '',
        individualEid: '',
        specialties: [],
    };

    const resetSearch = (props) => {
        setFormData({});
        setCurrentPage(1);
        setSelectedCountries([]);
        setUsers({});
        props.resetForm();
    };

    const searchHcps = (newPage) => {
        axios.post(`/api/okla/hcps/search?page=${newPage}`, formData)
            .then(response => {
                setUsers(response.data);
                setCurrentPage(newPage);
            })
            .catch(err => {
                console.log(err);
            });
    };

    const pageLeft = () => {
        if (currentPage === 1) return;
        searchHcps(currentPage - 1);
    };

    const pageRight = () => {
        if (currentPage === Math.ceil(users.totalNumberOfResults / users.resultSize)) return;
        searchHcps(currentPage + 1);
    };

    useEffect(() => {
        const getSpecialties = async () => {
            const codbases = selectedCountries.map(item => `codbases=${item.value}`);
            const parameters = codbases.join('&');
            if (parameters) {
                const response = await axios.get(`/api/hcps/specialties?${parameters}`);
                setSpecialties(response.data);
            }
            else setSpecialties([]);
        }
        getSpecialties();
        dispatch(getAllCountries());
    }, [selectedCountries]);

    useEffect(() => {
        const getHcpProfile = async (id) => {
            const { data: hcpProfile } = await axios.get(`/api/hcp-profiles/${id}`);
            setHcpProfile(hcpProfile.data);
        }

        if (params.get('id')) {
            const id = params.get('id');
            getHcpProfile(id);
        }

    }, [location]);

    useEffect(() => {
        if (userCountries && userCountries.length && hcpProfile && !selectedCountries || !selectedCountries.length) {
            const country = (getCountries()).find(c => c.countryIso2.toLowerCase() === hcpProfile.country_iso2.toLowerCase());
            if (country) setSelectedCountries([country]);
        }

    }, [userCountries, hcpProfile]);

    const getCountries = () => userCountries.map(country => ({ value: country.codbase, label: country.codbase_desc, countryIso2: country.country_iso2 }));
    const getSpecialties = () => specialties.map(i => ({ value: i.codIdOnekey.split('.')[2], label: i.codDescription }));

    const getCountryName = (country_iso2) => {
        if (!allCountries || !country_iso2) return null;
        const country = allCountries.find(c => c.country_iso2.toLowerCase() === country_iso2.toLowerCase());
        return country && country.countryname;
    }

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
                    <div className="col-12 px-0">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb rounded-0">
                                <li className="breadcrumb-item"><NavLink to="/">Dashboard</NavLink></li>
                                <li className="breadcrumb-item"><NavLink to="/hcps">Information Management</NavLink></li>
                                <li className="breadcrumb-item active"><span>Discover HCPs</span></li>
                            </ol>
                        </nav>
                    </div>
                </div>

                <div className="row">
                    <div className="col-12 px-0 px-sm-3">
                        <div className="shadow-sm bg-light pb-3">
                            <h2 className="d-flex align-items-center p-3 px-sm-3 py-sm-3 page-title light">
                                <span className="page-title__text font-weight-bold">OKLA Search</span>
                            </h2>

                            <div className="d-flex align-items-center p-3 px-sm-3 py-sm-3 page-title light">
                                <div>
                                    <NavLink className="custom-tab px-3 py-3 cdp-border-primary" to="/hcps/discover-professionals">Health Care Professional</NavLink>
                                    <NavLink className="custom-tab px-4 py-3 cdp-border-primary" to="/hcps/discover-organizations">Health Care Organization</NavLink>
                                </div>
                            </div>

                            <div className="add-user mx-3 mt-0 p-3 bg-white rounded border">
                                <Formik
                                    initialValues={initialFormValues}
                                    displayName="SearchForm"
                                    onSubmit={async (values, actions) => {
                                        const data = { ...values };
                                        data.specialties = data.specialties.map(i => i.value);
                                        data.codbases = data.countries.map(i => i.value);
                                        delete data.countries;

                                        const response = await axios.post('/api/okla/hcps/search', data);
                                        setUsers(response.data);
                                        setFormData(data);
                                        setCurrentPage(1);
                                        actions.setSubmitting(false);
                                    }}
                                >
                                    {formikProps => (
                                        <Form onSubmit={formikProps.handleSubmit}>
                                            <div className="row align-items-center">
                                                <div className="col-12 col-sm-6 col-lg-4">
                                                    <div className="form-group">
                                                        <label for="exampleInputEmail1">Countries</label>
                                                        <Select
                                                            defaultValue={[]}
                                                            isMulti={true}
                                                            name="countries"
                                                            components={{ Option: CustomOption }}
                                                            hideSelectedOptions={false}
                                                            // controlShouldRenderValue = { false }
                                                            options={getCountries()}
                                                            // onChange={handleChange}
                                                            className="multiselect"
                                                            classNamePrefix="multiselect"
                                                            value={selectedCountries}
                                                            onChange={selectedOption => {
                                                                formikProps.values.countries = selectedOption;
                                                                setSelectedCountries(selectedOption || []);
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="col-12 col-sm-6 col-lg-8 pt-3">
                                                    <div className="custom-control custom-checkbox custom-control-inline my-1 mr-sm-2">
                                                        <input type="checkbox" className="custom-control-input" name="isInContract" id="customControlInline" onChange={(e) => formikProps.values.isInContract = e.target.checked} />
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
                                                        <Field className="form-control firstName" type='text' name='firstName' id='firstName' />
                                                    </div>
                                                </div>
                                                <div className="col-12 col-sm-4">
                                                    <div className="form-group">
                                                        <label for="exampleFormControlInput1">Last Name</label>
                                                        <Field className="form-control lastName" type='text' name='lastName' id='lastName' />
                                                    </div>
                                                </div>
                                                <div className="col-12 col-sm-4">
                                                    <div className="form-group">
                                                        <label for="Specialty">Specialty</label>
                                                        <Select
                                                            defaultValue={[]}
                                                            isMulti={true}
                                                            name="specialties"
                                                            components={{ Option: CustomOption }}
                                                            hideSelectedOptions={false}
                                                            // controlShouldRenderValue = { false }
                                                            options={getSpecialties()}
                                                            className="multiselect"
                                                            classNamePrefix="multiselect"
                                                            onChange={selectedOption => {
                                                                formikProps.values.specialties = Array.isArray(selectedOption) ? selectedOption : [];
                                                                setSpecialtiesFlag(Array.isArray(selectedOption) && selectedOption.length);
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
                                                        <Field className="form-control address" type='text' name='address' id='address' />
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
                                                        <Field className="form-control postCode" type='text' name='postCode' id='postCode' />
                                                    </div>
                                                </div>
                                            </div>
                                            <h5 className="border-bottom pt-4 pb-2 "><i className="fas fa-key cdp-text-secondary mr-2"></i>Identifiers</h5>
                                            <div className="row">
                                                <div className="col-12 col-sm-4">
                                                    <div className="form-group">
                                                        <label for="OnekeyID">Onekey ID</label>
                                                        <Field className="form-control onekeyId" type='text' name='onekeyId' id='onekeyId' />
                                                    </div>
                                                </div>
                                                <div className="col-12 col-sm-4">
                                                    <div className="form-group">
                                                        <label for="Individual ">Individual - Identifier</label>
                                                        <Field className="form-control individual" type='text' name='individualEid' id='individual' />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="row">
                                                <div className="col-6">
                                                    <button type="reset" className="btn btn-block btn-secondary mt-4 p-2" onClick={() => resetSearch(formikProps)}>CLEAR</button>
                                                </div>
                                                <div className="col-6">
                                                    <button type="submit" className="btn btn-block text-white cdp-btn-secondary mt-4 p-2" disabled={!formikProps.values.countries || !formikProps.values.countries.length || !(formikProps.values.firstName || formikProps.values.lastName || formikProps.values.address || formikProps.values.city || formikProps.values.postCode || formikProps.values.onekeyId || formikProps.values.individualEid || specialtiesFlag)}>SEARCH</button>
                                                </div>
                                            </div>
                                        </Form>
                                    )}
                                </Formik>
                            </div>
                        </div>
                    </div>
                </div>
                {users.results && users.results.length > 0 &&
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
                                                <th>Specialty</th>
                                                <th>Workplace</th>
                                                <th>Onekey ID</th>
                                                <th>Individual - Identifier</th>
                                                <th>Country</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="cdp-table__body bg-white">
                                            {
                                                users.results.map((user, idx) => (
                                                    <tr key={idx}>
                                                        <td>{user.isInContract ? <i className="fas fa-circle mr-1 cdp-text-primary" title="In my contract"></i> : <i className="fas fa-circle mr-1 cdp-text-secondary" title="Not in my contract"></i>} {`${user.firstName} ${user.lastName}`}</td>
                                                        <td>{(user.specialties || ['--']).join(', ')}</td>
                                                        <td>
                                                            {
                                                                user.workplaces.map((item, idxOfWorkPlace) => (
                                                                    <div key={idxOfWorkPlace} className="currentWorkplace">
                                                                        {
                                                                            item.isValid ? <i className="fas fa-check mr-1 cdp-text-primary"></i> : <i className="fas fa-times mr-1 cdp-text-secondary"></i>
                                                                        }
                                                                        {[item.name, item.address, item.city].filter(i => i).join(', ')}
                                                                    </div>
                                                                ))
                                                            }
                                                        </td>
                                                        <td>
                                                            {
                                                                user.onekeyEidList.map((item, idxOfEid) => (<p key={idxOfEid}>{item}</p>))
                                                            }
                                                        </td>
                                                        <td>{user.individualEid}</td>
                                                        <td>{getCountryName(user.countryIso2)}</td>
                                                        <td><a type="button" className="link-with-underline" onClick={() => setSelectedIndividual({ id: user.individualEid, codbase: user.codbase })}>Details</a></td>
                                                    </tr>
                                                ))
                                            }
                                        </tbody>
                                    </table>
                                    {
                                        (Math.ceil(users.totalNumberOfResults / users.resultSize) >= 1) &&
                                        <div className="pagination justify-content-end align-items-center border-top p-3">
                                            <span className="cdp-text-primary font-weight-bold">{`Page ${currentPage} of ${Math.ceil(users.totalNumberOfResults / users.resultSize)}`}</span>
                                            <span className="pagination-btn" onClick={() => pageLeft()} disabled={currentPage === 1}><i className="icon icon-arrow-down ml-2 prev"></i></span>
                                            <span className="pagination-btn" onClick={() => pageRight()} disabled={Math.ceil(users.totalNumberOfResults / users.resultSize) === currentPage}><i className="icon icon-arrow-down ml-2 next"></i></span>
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                }

                {users.results && users.results.length <= 0 &&
                    <div className="p-3 bg-white">No Health Care Professionals found</div>
                }
            </div>

            {selectedIndividual && <OklaHcpDetails individual={selectedIndividual} setSelectedIndividual={setSelectedIndividual} />}
        </main>
    );
}

export default SearchProfessionalHcp;

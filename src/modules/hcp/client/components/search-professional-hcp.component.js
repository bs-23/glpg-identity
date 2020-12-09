import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Form, Formik, Field, ErrorMessage } from 'formik';
import Select, { components } from 'react-select';
import { getAllCountries } from '../../../core/client/country/country.actions';
import OklaHcpdetails from './okla-hcp-details.component';

const safeGet = (object, property) => {
    const propData = (object || {})[property];
    return (prop) => prop ? safeGet(propData, prop) : propData;
};

const flatten = (array) => {
    return Array.isArray(array) ? [].concat(...array.map(flatten)) : array;
}

const union = (a, b) => [...new Set([...a, ...b])];

const SearchProfessionalHcp = () => {
    const dispatch = useDispatch();

    const countries = useSelector(state => state.countryReducer.countries);
    const allCountries = useSelector(state => state.countryReducer.allCountries);
    const [userCountries, setUserCountries] = useState([]);

    const [selectedOption, setSelectedOption] = useState([]);
    const [specialties, setSpecialties] = useState([]);
    const [selectedIndividual, setSelectedIndividual] = useState(null);
    const [users, setUsers] = useState({});
    const [formData, setFormData] = useState({});
    const [currentPage, setCurrentPage] = useState(1);


    const resetSearch = (props) => {
        setFormData({});
        currentPage(1);
        setSelectedOption([]);
        setUsers([]);
        props.resetForm();
    };

    const pageLeft = () => {
        if(currentPage === 1) return;

        axios.post(`/api/okla/hcps/search?page?${currentPage-1}`, formData)
        .then(response => {
            setUsers(response.data);
            setCurrentPage(currentPage-1);
        })
        .catch(err => {
            console.log(err);
        })
    }

    const pageRight = () => {
        if(currentPage === Math.ceil(users.totalNumberOfResults / users.resultSize)) return;
        axios.post(`/api/okla/hcps/search?page?${currentPage+1}`, formData)
        .then(response => {
            setUsers(response.data);
            setCurrentPage(currentPage+1);
        })
        .catch(err => {
            console.log(err);
        })
    }

    const extractLoggedInUserCountries = (data) => {
        const profile_permission_sets = safeGet(data, 'profile')('permissionSets')();
        const profile_countries = profile_permission_sets ? profile_permission_sets.map(pps => safeGet(pps, 'countries')() || []) : [];

        const userRoles = safeGet(data, 'role')();
        const roles_countries = userRoles ? userRoles.map(role => {
            const role_permission_sets = safeGet(role, 'permissionSets')();
            return role_permission_sets.map(rps => safeGet(rps, 'countries')() || []);
        }) : [];

        const userCountries = union(flatten(profile_countries), flatten(roles_countries)).filter(e => e);

        return userCountries;
    }

    const fetchUserCountries = (args, allCountries) => {
        const countryList = [];
        args.forEach(element => {
            countryList.push(allCountries.find(x => x.country_iso2 == element));
        });
        return countryList.filter(c => c);
    }

    useEffect(() => {
        async function getCountries() {
            const userProfile = (await axios.get('/api/users/profile')).data;
            const userCountries = extractLoggedInUserCountries(userProfile);
            setUserCountries(fetchUserCountries(userCountries, countries));
        }

        const getSpecialties = async () =>{
            const codbases = selectedOption.map(item => `codbases=${item.value}`);
            const parameters = codbases.join('&');
            if(parameters){
                const response = await axios.get(`/api/hcps/specialties?${parameters}`);
                setSpecialties(response.data);
            }
            else setSpecialties([]);
        }
        getCountries();
        getSpecialties();
        dispatch(getAllCountries());
    }, [selectedOption, countries]);

    const getCountries = () => userCountries.map(country => ({ value: country.codbase, label: country.codbase_desc }));
    const getSpecialties = () => specialties.map( i => ({ value: i.codIdOnekey.split('.')[2], label: i.codDescription }));

    const getCountryName = (country_iso2) => {
        if (!allCountries || !country_iso2) return null;
        const country = allCountries.find(c => c.country_iso2.toLowerCase() === country_iso2.toLowerCase());
        return country && country.countryname;
    }

    const getCodbase = (country_iso2) => {
        if (!allCountries || !country_iso2) return null;
        const country = allCountries.find(c => c.country_iso2.toLowerCase() === country_iso2.toLowerCase());
        return country && country.codbase;
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
                                initialValues={{
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
                                }}
                                displayName="SearchForm"
                                onSubmit={async (values, actions) => {
                                    console.log(values);
                                    values.specialties = values.specialties.map(i => i.value);
                                    values.codbases = values.countries.map(i => i.value);
                                    // delete values.countries;
                                    const response = await axios.post('/api/okla/hcps/search', values);
                                    setUsers(response.data);
                                    setFormData(values);
                                    actions.setSubmitting(false);
                                }}
                            >
                                { formikProps => (
                                    <Form onSubmit={formikProps.handleSubmit}>
                                        <div className="row align-items-center">
                                            <div className="col-12 col-sm-6 col-lg-4">
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
                                                        value={selectedOption}
                                                        onChange = { selectedOption => {
                                                            formikProps.values.countries = selectedOption;
                                                            setSelectedOption(selectedOption || []);
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                              <div className="col-12 col-sm-6 col-lg-8 pt-3">
                                                <div className="custom-control custom-checkbox custom-control-inline my-1 mr-sm-2">
                                                    <input type="checkbox" className="custom-control-input" name="isInContract" id="customControlInline" onChange={(e) => formikProps.values.isInContract = e.target.checked}/>
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
                                                <button type="submit" className="btn btn-block text-white cdp-btn-secondary mt-4 p-2" disabled={!formikProps.values.countries || !formikProps.values.countries.length || !(formikProps.values.firstName  || formikProps.values.lastName || formikProps.values.address || formikProps.values.city || formikProps.values.postalCode || formikProps.values.onekeyId || formikProps.values.individualEid || (formikProps.values.specialties && formikProps.values.specialties.length))}>SEARCH</button>
                                            </div>
                                        </div>
                                    </Form>
                                )}
                            </Formik>
                            </div>
                        </div>
                    </div>
                </div>
                { users.results && users.results.length &&
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
                                            <th>Country</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="cdp-table__body bg-white">
                                        {
                                            users.results.map( (user, idx) => (
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
                                                                    {[item.name,item.address, item.city].filter(i => i).join(', ')}
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
                                                    <td><a type="button" className="link-with-underline" onClick={() => setSelectedIndividual({id: user.individualEid, codbase: getCodbase(user.countryIso2)})}>Details</a></td>
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </table>
                                {
                                (Math.floor(users.totalNumberOfResults / users.resultSize) >= 1 ) &&
                                    <div className="pagination justify-content-end align-items-center border-top p-3">
                                        <span className="cdp-text-primary font-weight-bold">{`Page ${currentPage} of ${Math.floor(users.totalNumberOfResults / users.resultSize)+1}`}</span>
                                        <span className="pagination-btn" onClick={() => pageLeft()} disabled={currentPage === 1}><i className="icon icon-arrow-down ml-2 prev"></i></span>
                                        <span className="pagination-btn" onClick={() => pageRight()} disabled={Math.ceil(users.totalNumberOfResults / users.resultSize) === currentPage}><i className="icon icon-arrow-down ml-2 next"></i></span>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
                }
            </div>

            {selectedIndividual && <OklaHcpdetails individual={selectedIndividual} setSelectedIndividual={setSelectedIndividual} />}
        </main>
    );
}

export default SearchProfessionalHcp;

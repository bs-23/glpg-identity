import axios from 'axios';
import React, { useRef, useEffect, useState } from 'react';
import { useLocation, Redirect } from 'react-router-dom';
import { useHistory } from "react-router";
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Form, Formik, Field } from 'formik';
import Select, { components } from 'react-select';
import Dropdown from 'react-bootstrap/Dropdown';
import { getAllCountries } from '../../../core/client/country/country.actions';
import OklaHcpDetails from './okla-hcp-details.component';
import getUserPermittedCountries from '../../../core/client/util/user-country';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { useToasts } from 'react-toast-notifications';

const SearchProfessionalHcp = () => {
    const dispatch = useDispatch();
    const formikRef = useRef();
    const location = useLocation();
    const { addToast } = useToasts();
    const history = useHistory();

    const countries = useSelector(state => state.countryReducer.countries);
    const allCountries = useSelector(state => state.countryReducer.allCountries);
    const userProfile = useSelector(state => state.userReducer.loggedInUser);
    const userCountries = getUserPermittedCountries(userProfile, countries);
    const [selectedCountries, setSelectedCountries] = useState([]);
    const [specialties, setSpecialties] = useState([]);
    const [selectedSpecialties, setSelectedSpecialties] = useState([]);
    const [selectedIndividual, setSelectedIndividual] = useState(null);
    const [isInContract, setIsInContract] = useState(false);
    const [phonetic, setPhonetic] = useState(false);
    const [duplicates, setDuplicates] = useState(false);
    const [users, setUsers] = useState({});
    const [formData, setFormData] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [hcpProfile, setHcpProfile] = useState(null);
    const [isAssigned, setIsAssigned] = useState(false);
    const [hcpSpecialty, setHcpSpecialty] = useState();

    const params = new URLSearchParams(window.location.search);

    const resetSearch = (props) => {
        setFormData({});
        setCurrentPage(1);
        setSelectedCountries([]);
        setSelectedSpecialties([]);
        setIsInContract(false);
        setDuplicates(false);
        setPhonetic(false);
        setUsers({});
        props.resetForm();
        setIsAssigned(false);
        setHcpProfile(null);
        setHcpSpecialty(null);

        if (params.get('id')) history.push('/hcps/discover-professionals');
    };

    const scrollToResult = (isEmpty) => {
        const searchResult = document.getElementById(isEmpty ? 'empty-search-result' : 'search-result');
        searchResult.scrollIntoView({ behavior: 'smooth' });
    };

    const searchHcps = (newPage) => {
        axios.post(`/api/okla/hcps/search?page=${newPage}`, formData)
            .then(response => {
                setUsers(response.data);
                setCurrentPage(newPage);
                scrollToResult(response.data.results.length === 0);
            })
            .catch(err => {
                const message = err.response.status === 400
                    ? err.response.data
                    : 'Sorry! Search failed. Please, try again.';
                addToast(message, {
                    appearance: 'error',
                    autoDismiss: true
                });
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
                const filtered = hcpSpecialty ? response.data.filter(i => i.codIdOnekey === hcpSpecialty) : [];
                if (filtered && filtered.length) {
                    setSelectedSpecialties([{ label: filtered[0].codDescription, value: filtered[0].codIdOnekey.split('.')[2] }]);
                    formikRef.current.setFieldValue('specialties', [{ label: filtered[0].codDescription, value: filtered[0].codIdOnekey.split('.')[2] }]);
                }
                setSpecialties(response.data);
            }
            else setSpecialties([]);
        }
        getSpecialties();
        dispatch(getAllCountries());
    }, [selectedCountries, hcpSpecialty]);

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
        if (params.get('id')) {

            if (hcpProfile) {
                formikRef.current.setFieldValue('firstName', hcpProfile.first_name || '');
                formikRef.current.setFieldValue('lastName', hcpProfile.last_name || '');
                formikRef.current.setFieldValue('individualEid', hcpProfile.individual_id_onekey || '');
                setHcpSpecialty(hcpProfile.specialty_onekey);
            }

            if (!isAssigned && userCountries && userCountries.length && hcpProfile && (!selectedCountries || !selectedCountries.length) && allCountries && allCountries.length) {
                const hcpCountry = allCountries.find(c => c.country_iso2.toLowerCase() === hcpProfile.country_iso2.toLowerCase());
                const country = (getCountries()).find(c => c.value.toLowerCase() === hcpCountry.codbase.toLowerCase());
                if (country) {
                    setSelectedCountries([country]);
                    formikRef.current.setFieldValue('countries', [country]);
                }
                setIsAssigned(true);
            }
        }

    }, [location, userCountries, hcpProfile, allCountries]);

    const getCountries = () => userCountries.map(country => ({ value: country.codbase, label: country.codbase_desc, countryIso2: country.country_iso2 }));
    const getSpecialties = () => specialties.map(i => ({ value: i.codIdOnekey.split('.')[2], label: i.codDescription }));

    const getCountryName = (country_iso2) => {
        if (!allCountries || !country_iso2) return null;
        const country = allCountries.find(c => c.country_iso2.toLowerCase() === country_iso2.toLowerCase());
        return country && country.countryname;
    }

    const changeUrl = () => {
        if (params.get('id')) {
            setHcpProfile(null);
            setIsAssigned(false);
            history.push('/hcps/discover-professionals');
        }
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

    const nameHintPopup = (
        <Popover id="popover-basic" className="shadow-lg">
            <Popover.Content className="px-3">
                <ul className="list-unstyled mb-0">
                    <li className="pl-0 pb-2"><i className="fas fa-circle mr-1 cdp-text-primary"></i> In my contract</li>
                    <li className="pl-0 pb-2"><i className="fas fa-circle mr-1 cdp-text-secondary"></i> Not In my contract</li>
                </ul>
            </Popover.Content>
        </Popover>
    );

    const workplaceHintPopup = (
        <Popover id="popover-basic" className="shadow-lg">
            <Popover.Content className="px-3">
                <ul className="list-unstyled mb-0">
                    <li className="pl-0 pb-2"><i className="fas fa-check mr-1 cdp-text-primary"></i> Valid</li>
                    <li className="pl-0 pb-2"><i className="fas fa-times mr-1 cdp-text-secondary"></i> Invalid </li>
                </ul>
            </Popover.Content>
        </Popover>
    );

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
                            <div className="d-flex justify-content-between align-items-center p-3">
                                <h4 className="cdp-text-primary font-weight-bold mb-0 mr-sm-4 mr-1">OKLA Search</h4>
                                <div className="d-flex align-items-center pl-3">
                                    <div>
                                        <NavLink className="custom-tab custom-tab__secondary px-3 py-3 border" to="/hcps/discover-professionals"><i className="far fa-user mr-2"></i><span className="d-none d-sm-inline-block">Health Care Professional</span></NavLink>
                                        <NavLink className="custom-tab custom-tab__secondary px-4 py-3 border" to="/hcps/discover-organizations"><i className="far fa-building mr-2"></i><span className="d-none d-sm-inline-block">Health Care Organization</span></NavLink>
                                    </div>
                                </div>
                            </div>
                            <div className="add-user mx-3 mt-0 p-3 bg-white rounded border">
                                <Formik
                                    innerRef={formikRef}
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
                                        const data = { ...values };
                                        data.specialties = data.specialties.map(i => i.value);
                                        data.codbases = data.countries.map(i => i.value);
                                        delete data.countries;

                                        axios.post('/api/okla/hcps/search', data)
                                            .then(response => {
                                                setUsers(response.data);
                                                setFormData(data);
                                                setCurrentPage(1);
                                                actions.setSubmitting(false);
                                                scrollToResult(response.data.results.length === 0);
                                            })
                                            .catch(err => {
                                                const message = err.response.status === 400
                                                    ? err.response.data
                                                    : 'Sorry! Search failed. Please, try again.';
                                                addToast(message, {
                                                    appearance: 'error',
                                                    autoDismiss: true
                                                });
                                            });
                                    }}
                                >
                                    {formikProps => (
                                        <Form
                                            onSubmit={formikProps.handleSubmit}
                                            onChange={e => {
                                                if (e.target.id !== 'isInContractCheckbox'
                                                    && e.target.id !== 'phoneticCheckbox'
                                                    && e.target.id !== 'duplicatesCheckbox') {
                                                    changeUrl();
                                                }
                                            }}
                                        >
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
                                                                setSelectedSpecialties([]);
                                                                changeUrl();
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="col-12 col-sm-6 col-lg-8 pt-3">
                                                    <div className="custom-control custom-checkbox custom-control-inline my-1 mr-sm-2">
                                                        <input
                                                            type="checkbox"
                                                            className="custom-control-input"
                                                            name="isInContract"
                                                            id="isInContractCheckbox"
                                                            checked={isInContract}
                                                            onChange={(e) => {
                                                                formikProps.values.isInContract = e.target.checked;
                                                                setIsInContract(e.target.checked);
                                                            }} />
                                                        <label className="custom-control-label" for="isInContractCheckbox">In My Contract</label>
                                                    </div>
                                                    <div className="custom-control custom-checkbox custom-control-inline my-1 mr-sm-2">
                                                        <input
                                                            type="checkbox"
                                                            className="custom-control-input"
                                                            name="phonetic"
                                                            id="phoneticCheckbox"
                                                            checked={phonetic}
                                                            onChange={(e) => {
                                                                formikProps.values.phonetic = e.target.checked;
                                                                setPhonetic(e.target.checked);
                                                            }} />
                                                        <label className="custom-control-label" for="phoneticCheckbox">Phonetic</label>
                                                    </div>
                                                    <div className="custom-control custom-checkbox custom-control-inline my-1 mr-sm-2">
                                                        <input
                                                            type="checkbox"
                                                            className="custom-control-input"
                                                            name="duplicates"
                                                            id="duplicatesCheckbox"
                                                            checked={duplicates}
                                                            onChange={(e) => {
                                                                formikProps.values.duplicates = e.target.checked;
                                                                setDuplicates(e.target.checked);
                                                            }} />
                                                        <label className="custom-control-label" for="duplicatesCheckbox">Duplicates</label>
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
                                                            value={selectedSpecialties}
                                                            onChange={selectedOption => {
                                                                formikProps.setFieldValue('specialties', Array.isArray(selectedOption) ? selectedOption : []);
                                                                setSelectedSpecialties(selectedOption || []);
                                                                changeUrl();
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
                                                    <button type="submit" className="btn btn-block text-white cdp-btn-secondary mt-4 p-2" disabled={!selectedCountries || !selectedCountries.length || !(formikProps.values.firstName || formikProps.values.lastName || formikProps.values.address || formikProps.values.city || formikProps.values.postCode || formikProps.values.onekeyId || formikProps.values.individualEid || (selectedSpecialties && selectedSpecialties.length))}>SEARCH</button>
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
                    <div className="row" id="search-result">
                        <div className="col-12">
                            <div className="my-3">
                                <div className="d-sm-flex justify-content-between align-items-center mb-3 mt-4">
                                    <h4 className="cdp-text-primary font-weight-bold mb-3 mb-sm-0">Search Result</h4>
                                    <div className="d-flex justify-content-between align-items-center">

                                    </div>
                                </div>


                                <div className="table-responsive shadow-sm bg-white">
                                    <table className="table table-hover table-sm mb-0 cdp-table">
                                        <thead className="cdp-bg-primary text-white cdp-table__header">
                                            <tr>
                                                <th>Name <OverlayTrigger trigger="click" rootClose placement="right" overlay={nameHintPopup}>
                                                    <i className="fas fa-info-circle ml-1 text-white" role="button"></i>
                                                </OverlayTrigger></th>
                                                <th>Specialty</th>
                                                <th>Workplace <OverlayTrigger trigger="click" rootClose placement="right" overlay={workplaceHintPopup}>
                                                    <i className="fas fa-info-circle ml-1 text-white" role="button"></i>
                                                </OverlayTrigger></th>
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
                                                                user.onekeyEidList.map((item, idxOfEid) => (<div key={idxOfEid}>{item}</div>))
                                                            }
                                                        </td>
                                                        <td>{user.individualEid}</td>
                                                        <td>{getCountryName(user.countryIso2)}</td>
                                                        <td>
                                                            <Dropdown>
                                                                <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle btn-sm py-0 px-1 dropdown-toggle btn">
                                                                </Dropdown.Toggle>
                                                                <Dropdown.Menu>
                                                                    <Dropdown.Item onClick={() => setSelectedIndividual({ id: user.individualEid, codbase: user.codbase })}>Details</Dropdown.Item>
                                                                </Dropdown.Menu>
                                                            </Dropdown>
                                                        </td>
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
                    <div className="row justify-content-center my-5 py-5 mb-3" id="empty-search-result">
                        <div className="col-12 col-sm-6 py-4 bg-white shadow-sm rounded text-center">
                            <i className="icon icon-team icon-6x cdp-text-secondary"></i>
                            <h3 className="font-weight-bold cdp-text-primary pt-4">No Health Care Professionals found</h3>
                            <h4 className="cdp-text-primary pt-3 pb-5">you might need to change some settings and search again</h4>
                        </div>
                    </div>
                }
            </div>

            {selectedIndividual && <OklaHcpDetails individual={selectedIndividual} setSelectedIndividual={setSelectedIndividual} />}
        </main>
    );
}

export default SearchProfessionalHcp;

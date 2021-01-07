import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Form, Formik, Field } from 'formik';
import Select, { components } from 'react-select';
import Dropdown from 'react-bootstrap/Dropdown';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { useToasts } from 'react-toast-notifications';

import OklaHcoDetails from './okla-hco-details.component';
import getUserPermittedCountries from '../../../../core/client/util/user-country';
import Faq from '../../../../platform/faq/client/faq.component';
import Modal from 'react-bootstrap/Modal';
import uuidAuthorities from '../uuid-authorities.json';

const SearchOrganizationHcp = () => {
    const { addToast } = useToasts();

    const countries = useSelector(state => state.countryReducer.countries);
    const allCountries = useSelector(state => state.countryReducer.allCountries);
    const userProfile = useSelector(state => state.userReducer.loggedInUser);
    const userCountries = getUserPermittedCountries(userProfile, countries);
    const [selectedCountries, setSelectedCountries] = useState([]);
    const [specialties, setSpecialties] = useState([]);
    const [selectedSpecialties, setSelectedSpecialties] = useState([]);
    const [selectedHco, setSelectedHco] = useState(null);
    const [hcos, setHcos] = useState({});
    const [formData, setFormData] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [showFaq, setShowFaq] = useState(false);
    const handleCloseFaq = () => setShowFaq(false);
    const handleShowFaq = () => setShowFaq(true);
    const [uuidLabel, setUuidLabel] = useState('UUID');

    const resetSearch = (props) => {
        setFormData({});
        setCurrentPage(1);
        setSelectedCountries([]);
        setSelectedSpecialties([]);
        setHcos({});
        props.resetForm();
    };

    const getUuidLabel = (selectedCountries) => {
        if (!selectedCountries || !selectedCountries.length) return 'UUID';

        const authorityByCountry = uuidAuthorities.filter(a => selectedCountries.some(s => a.codbase.toLowerCase() === s.value.toLowerCase())).map(a => a.name);

        return authorityByCountry.join('/');
    };

    const scrollToResult = (isEmpty) => {
        const searchResult = document.getElementById(isEmpty ? 'empty-search-result' : 'search-result');
        searchResult.scrollIntoView({ behavior: 'smooth' });
    };

    const namehintpopup = (
        <Popover id="popover-basic" className="shadow-lg">
            <Popover.Content className="px-3">
                <ul className="list-unstyled mb-0">
                    <li className="pl-0 pb-2"><i className="fas fa-circle mr-1 cdp-text-primary"></i> In my contract</li>
                    <li className="pl-0 pb-2"><i className="fas fa-circle mr-1 cdp-text-secondary"></i> Not In my contract</li>
                </ul>
            </Popover.Content>
        </Popover>
    );

    const searchHintPopup = (
        <Popover id="searchHintPopup" className="shadow-lg">
            <Popover.Content className="px-3">
                <p>To enable the search button please select countries filed and one other field. e.g.</p>
                <ul className="list-unstyled mb-0">
                    <li className="pl-0 pb-2"><strong>Countries</strong> Belgium</li>
                    <li className="pl-0 pb-2"><strong>Specialty</strong> Cardiology</li>
                </ul>
            </Popover.Content>
        </Popover>
    );

    const activityOnekeyIDHintPopup = (
        <Popover id="activityOnekeyIDHintPopup" className="shadow-lg remove-orange-triangle">
            <Popover.Content className="px-3">
                <p className="mb-0">HCO Professional Engagement</p>
            </Popover.Content>
        </Popover>
    );

    const searchHcos = (newPage) => {
        axios.post(`/api/okla/hcos/search?page=${newPage}`, formData)
            .then(response => {
                setHcos(response.data);
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
            })
    };

    const pageLeft = () => {
        if (currentPage === 1) return;
        searchHcos(currentPage - 1);
    };

    const pageRight = () => {
        if (currentPage === Math.ceil(hcos.totalNumberOfResults / hcos.resultSize)) return;
        searchHcos(currentPage + 1);
    }

    const groupSpecialties = specialtyList => {
        const marked = {};
        const idxMap = {};
        const groupedSpecialties = [];
        let idx = 0;

        specialtyList.forEach( specialty => {
            if(!specialty.codIdOnekey) return;
            const value = specialty.codDescription.toLowerCase().split(' ').join('');

            if(!marked[value]){
                marked[value] = true;
                idxMap[value] = idx++;
                groupedSpecialties.push({
                    codDescription: specialty.codDescription,
                    codIdOnekeys: [specialty.codIdOnekey],
                    codbases: [specialty.codbase]
                });
            }
            else {
                const index = idxMap[value];
                groupedSpecialties[index].codIdOnekeys.push(specialty.codIdOnekey);
                groupedSpecialties[index].codbases.push(specialty.codbase);
            }
        });
        return groupedSpecialties;
    }

    useEffect(() => {
        const fetchSpecialties = async () => {
            const codbases = selectedCountries.map(item => `codbases=${item.value}`);
            const parameters = codbases.join('&');
            if (parameters) {
                const response = await axios.get(`/api/hcps/specialties?${parameters}`);
                const groupedSpecialties = groupSpecialties(response.data);
                setSpecialties(groupedSpecialties);
            }
            else setSpecialties([]);
        }
        fetchSpecialties();
        setUuidLabel(getUuidLabel(selectedCountries));
    }, [selectedCountries, countries]);

    const getCountries = () => userCountries.map(country => ({ value: country.codbase, label: country.codbase_desc }));
    const getSpecialties = () => specialties.map(i => ({ value: i.codIdOnekeys, label: i.codDescription }));

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
                                <li className="breadcrumb-item"><NavLink to="/information">Information Management</NavLink></li>
                                <li className="breadcrumb-item active"><span>Discover HCPs</span></li>
                                <li className="ml-auto mr-3"><i type="button" onClick={handleShowFaq} className="icon icon-help icon-2x cdp-text-secondary"></i></li>
                            </ol>
                        </nav>
                        <Modal show={showFaq} onHide={handleCloseFaq} size="lg" centered>
                            <Modal.Header closeButton>
                                <Modal.Title>Questions You May Have</Modal.Title>
                            </Modal.Header>
                            <Modal.Body className="faq__in-modal"><Faq topic="discover-hcp" /></Modal.Body>
                        </Modal>
                    </div>
                </div>

                <div className="row">
                    <div className="col-12 px-0 px-sm-3">
                        <div className="shadow-sm bg-light pb-3">
                            <div className="d-flex justify-content-between align-items-center p-3">
                                <h4 className="cdp-text-primary font-weight-bold mb-0 mr-sm-4 mr-1">OKLA Search</h4>
                                <div className="d-flex align-items-center pl-3">
                                    <div>
                                        <NavLink className="custom-tab custom-tab__secondary px-3 py-3 border" to="/information/discover-professionals"><i className="far fa-user mr-2"></i><span className="d-none d-sm-inline-block">Health Care Professional</span></NavLink>
                                        <NavLink className="custom-tab custom-tab__secondary px-4 py-3 border" to="/information/discover-organizations"><i className="far fa-building mr-2"></i><span className="d-none d-sm-inline-block">Health Care Organization</span></NavLink>
                                    </div>
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
                                        workplaceEid: '',
                                        specialties: [],
                                    }}
                                    displayName="SearchForm"
                                    onSubmit={async (values, actions) => {
                                        const data = { ...values };
                                        const updatedSpecialties = []
                                        data.specialties.forEach(group => {
                                            group.value.forEach(item => {
                                                updatedSpecialties.push(item.split('.')[2]);
                                            });
                                        });
                                        data.specialties = updatedSpecialties;
                                        data.codbases = data.countries.map(i => i.value);
                                        delete data.countries;

                                        try {
                                            const response = await axios.post('/api/okla/hcos/search', data);
                                            setHcos(response.data);
                                            setFormData(data);
                                            setCurrentPage(1);
                                            actions.setSubmitting(false);
                                            scrollToResult(response.data.results.length === 0);
                                        } catch (err) {
                                            const message = err.response.status === 400
                                                ? err.response.data
                                                : 'Sorry! Search failed. Please, try again.';
                                            addToast(message, {
                                                appearance: 'error',
                                                autoDismiss: true
                                            });
                                        }
                                    }}
                                >
                                    {formikProps => (
                                        <Form onSubmit={formikProps.handleSubmit}>
                                            <div className="row align-items-center">
                                                <div className="col-12 col-sm-6 col-lg-4">
                                                    <div className="form-group">
                                                        <label for="exampleInputEmail1">Countries <span className="text-danger">*</span></label>
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
                                                                formikProps.setFieldValue('countries', selectedOption || []);
                                                                setSelectedCountries(selectedOption || []);
                                                                formikProps.values.specialties = [];
                                                                setSelectedSpecialties([]);
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-12 col-sm-6 col-lg-4 pt-3">
                                                    <div className="custom-control custom-checkbox custom-control-inline my-1 mr-sm-4">
                                                        <input type="checkbox" className="custom-control-input" name="isInContract" id="customControlInline" onChange={(e) => formikProps.values.isInContract = e.target.checked} />
                                                        <label className="custom-control-label" for="customControlInline">In My Contract</label>
                                                    </div>
                                                </div>
                                                <div className="col-12 col-sm-6 col-lg-4">
                                                    <div className="form-group">
                                                        <label className="d-block">Influence Search Results</label>
                                                        <div className="custom-control custom-checkbox custom-control-inline my-1 mr-sm-4">
                                                            <input type="checkbox" className="custom-control-input" name="phonetic" id="customControlInline2" onChange={(e) => formikProps.values.phonetic = e.target.checked} />
                                                            <label className="custom-control-label" for="customControlInline2">Phonetic</label>
                                                        </div>
                                                        <div className="custom-control custom-checkbox custom-control-inline my-1 mr-sm-2">
                                                            <input type="checkbox" className="custom-control-input" name="duplicates" id="customControlInline3" onChange={(e) => formikProps.values.duplicates = e.target.checked} />
                                                            <label className="custom-control-label" for="customControlInline3">Duplicates</label>
                                                        </div>
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
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <h5 className="border-bottom pt-4 pb-2 "><i className="fas fa-key cdp-text-secondary mr-2"></i>Identifiers</h5>
                                            <div className="row">
                                                <div className="col-12 col-sm-4">
                                                    <div className="form-group">
                                                        <label for="OnekeyID">
                                                            Workplace Onekey ID
                                                            <OverlayTrigger trigger="click" rootClose placement="top" overlay={activityOnekeyIDHintPopup}>
                                                                <i className="fas fa-info-circle ml-1 text-secondary" role="button"></i>
                                                            </OverlayTrigger>
                                                        </label>
                                                        <Field className="form-control onekeyId" type='text' name='onekeyId' id='onekeyId' />
                                                    </div>
                                                </div>
                                                <div className="col-12 col-sm-4">
                                                    <div className="form-group">
                                                        <label for="workplaceEid">{uuidLabel}</label>
                                                        <Field className="form-control individual" type='text' name='workplaceEid' id='workplaceEid' />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="row">
                                                <div className="col-6">
                                                    <button type="reset" className="btn btn-block btn-secondary mt-4 p-2" onClick={() => resetSearch(formikProps)}>CLEAR</button>
                                                </div>
                                                <div className="col-6">
                                                    <div className="d-flex align-items-center">
                                                        <button type="submit" className="btn btn-block text-white cdp-btn-secondary mt-4 p-2 okla-search__btn-search" disabled={!formikProps.values.countries || !formikProps.values.countries.length || !(formikProps.values.address || formikProps.values.city || formikProps.values.postCode || formikProps.values.onekeyId || formikProps.values.workplaceEid || (selectedSpecialties && selectedSpecialties.length))}> SEARCH </button>
                                                        <OverlayTrigger trigger="click" rootClose placement="left" overlay={searchHintPopup}>
                                                            <i className="fas fa-info-circle mt-4 ml-2 cdp-text-primary" role="button"></i>
                                                        </OverlayTrigger>
                                                    </div>
                                                </div>
                                            </div>
                                        </Form>
                                    )}
                                </Formik>
                            </div>
                        </div>
                    </div>
                </div>
                {hcos.results && hcos.results.length > 0 &&
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
                                                <th>Name <OverlayTrigger trigger="click" rootClose placement="right" overlay={namehintpopup}>
                                                    <i className="fas fa-info-circle ml-1 text-white" role="button"></i>
                                                </OverlayTrigger></th>
                                                <th>Specialty</th>
                                                <th>Address</th>
                                                <th>City</th>
                                                <th>Country</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="cdp-table__body bg-white">
                                            {
                                                hcos.results.map((hco, idx) => (
                                                    <tr key={idx}>
                                                        <td>{hco.isInContract ? <i className="fas fa-circle mr-1 cdp-text-primary" title="In my contract"></i> : <i className="fas fa-circle mr-1 cdp-text-secondary" title="Not In my contract"></i>} {`${hco.name}`}</td>
                                                        <td>{(hco.specialties || ['--']).join(', ')}</td>
                                                        <td>{hco.address}</td>
                                                        <td>{hco.city}</td>
                                                        <td>{getCountryName(hco.countryIso2)}</td>
                                                        <td>
                                                            <Dropdown>
                                                                <Dropdown.Toggle variant="" className="cdp-btn-outline-primary dropdown-toggle btn-sm py-0 px-1 dropdown-toggle btn">
                                                                </Dropdown.Toggle>
                                                                <Dropdown.Menu>
                                                                    <Dropdown.Item onClick={() => setSelectedHco({ id: hco.workplaceEid, codbase: hco.codbase })}>Details</Dropdown.Item>
                                                                </Dropdown.Menu>
                                                            </Dropdown>
                                                        </td>
                                                    </tr>
                                                ))
                                            }
                                        </tbody>
                                    </table>
                                    {
                                        (Math.ceil(hcos.totalNumberOfResults / hcos.resultSize) >= 1) &&
                                        <div className="pagination justify-content-end align-items-center border-top p-3">
                                            <span className="cdp-text-primary font-weight-bold">{`Page ${currentPage} of ${Math.ceil(hcos.totalNumberOfResults / hcos.resultSize)}`}</span>
                                            <span className="pagination-btn" onClick={() => pageLeft()} disabled={currentPage === 1}><i className="icon icon-arrow-down ml-2 prev"></i></span>
                                            <span className="pagination-btn" onClick={() => pageRight()} disabled={Math.ceil(hcos.totalNumberOfResults / hcos.resultSize) === currentPage}><i className="icon icon-arrow-down ml-2 next"></i></span>
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                }

                {hcos.results && hcos.results.length <= 0 &&
                    <div className="row justify-content-center my-5 py-5 mb-3" id="empty-search-result">
                        <div className="col-12 col-sm-6 py-4 bg-white shadow-sm rounded text-center">
                            <i className="far fa-building fa-4x cdp-text-secondary"></i>
                            <h3 className="font-weight-bold cdp-text-primary pt-4">No Health Care Organizations found</h3>
                            <h4 className="cdp-text-primary pt-3 pb-5">you might need to change some settings and search again</h4>
                        </div>
                    </div>
                }
            </div>

            {selectedHco && <OklaHcoDetails hco={selectedHco} setSelectedHco={setSelectedHco} />}
        </main>
    );
}

export default SearchOrganizationHcp;

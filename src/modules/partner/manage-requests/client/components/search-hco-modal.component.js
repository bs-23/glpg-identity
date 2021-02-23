import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Form, Formik, Field } from 'formik';
import Select, { components } from 'react-select';
import Modal from 'react-bootstrap/Modal';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { useToasts } from 'react-toast-notifications';
import axios from 'axios';

import { getCountryDetailsFromISO } from '../../../../core/client/util/user-country';
import uuidAuthorities from '../../../../information/hcp/client/uuid-authorities.json';

const SearchHcoModal = (props) => {
    let {
        show,
        searchInput,
        resultSelected
    } = props;

    const dispatch = useDispatch();
    const { addToast } = useToasts();
    const formikRef = useRef();

    const countries = useSelector(state => state.countryReducer.countries);
    const allCountries = useSelector(state => state.countryReducer.allCountries);
    const userProfile = useSelector(state => state.userReducer.loggedInUser);
    const userCountries = getCountryDetailsFromISO(userProfile.countries, countries);

    const [hcos, setHcos] = useState({});
    const [selectedCountries, setSelectedCountries] = useState([]);
    const [specialties, setSpecialties] = useState([]);
    const [selectedSpecialties, setSelectedSpecialties] = useState([]);
    const [isInContract, setIsInContract] = useState(false);
    const [phonetic, setPhonetic] = useState(false);
    const [duplicates, setDuplicates] = useState(false);
    const [formData, setFormData] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [hcoSpecialty, setHcoSpecialty] = useState();
    const [uuidLabel, setUuidLabel] = useState('UUID');

    function clearFileds() {
        searchInput = null;
        setFormData({});
        setCurrentPage(1);
        setSelectedCountries([]);
        setSelectedSpecialties([]);
        setIsInContract(false);
        setDuplicates(false);
        setPhonetic(false);
        setHcos({});
        setHcoSpecialty(null);
    };

    const handleClose = (hcoDetails) => {
        resultSelected(hcoDetails);
        clearFileds();
    };

    const resetSearch = (properties) => {
        properties.resetForm();
        clearFileds();
    };

    const handleResultSelection = (hco) => {
        axios.get(`/api/okla/hcos/${hco.codbase}/${hco.workplaceEid}`)
            .then(response => {
                handleClose(response.data);
            })
            .catch(err => {
                const message = err.response.status === 400
                    ? err.response.data
                    : 'Sorry! Failed to fetch data. Please, try again.';
                addToast(message, {
                    appearance: 'error',
                    autoDismiss: true
                });
            });
    }

    const getCountryName = (country_iso2) => {
        if (!allCountries || !country_iso2) return null;
        const country = allCountries.find(c => c.country_iso2.toLowerCase() === country_iso2.toLowerCase());
        return country && country.countryname;
    }

    const getCountries = () => userCountries.map(country => ({ value: country.codbase, label: country.codbase_desc, countryIso2: country.country_iso2 }));
    const getSpecialties = () => specialties.map(i => ({ value: i.codIdOnekeys, label: i.codDescription }));

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

    const groupSpecialties = specialtyList => {
        const marked = {};
        const idxMap = {};
        const groupedSpecialties = [];
        let idx = 0;

        specialtyList.forEach(specialty => {
            const value = specialty.codDescription.toLowerCase().split(' ').join('');
            if (!specialty.codIdOnekey) return;

            if (!marked[value]) {
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
    };

    const scrollToResult = (isEmpty) => {
        const searchResult = document.getElementById(isEmpty ? 'empty-search-result' : 'search-result');
        searchResult.scrollIntoView({ behavior: 'smooth' });
    };

    const searchHcos = (newPage) => {
        axios.post(`/api/okla/hcos/search?page=${newPage}`, formData)
            .then(response => {
                setHcos(response.data);
                setCurrentPage(newPage);
                try {
                    scrollToResult(response.data.results.length === 0);
                }
                catch (err) {
                    addToast('Error! Please try again.', {
                        appearance: 'error',
                        autoDismiss: true
                    });
                }
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
        searchHcos(currentPage - 1);
    };

    const pageRight = () => {
        if (currentPage === Math.ceil(hcos.totalNumberOfResults / hcos.resultSize)) return;
        searchHcos(currentPage + 1);
    };

    const getUuidLabel = (selectedCountries) => {
        if (!selectedCountries || !selectedCountries.length) return 'UUID';

        const authorityByCountry = uuidAuthorities.filter(a => selectedCountries.some(s => a.codbase.toLowerCase() === s.value.toLowerCase())).map(a => a.name);

        return authorityByCountry.join('/');
    };

    useEffect(() => {
        if (searchInput) {
            const countries = getCountries().filter(c => c.countryIso2 === searchInput.countryIso2);
            setSelectedCountries(countries);

            if (countries) formikRef.current.setFieldValue('countries', countries);

            if (searchInput.uuid) formikRef.current.setFieldValue('workplaceEid', searchInput.uuid);

            if (searchInput.specialty) setHcoSpecialty(searchInput.specialty);
        }
    }, [searchInput]);

    useEffect(() => {
        const fetchSpecialties = async () => {
            const codbases = selectedCountries.map(item => `codbases=${item.value}`);
            const parameters = codbases.join('&');
            if (parameters) {
                const response = await axios.get(`/api/hcps/specialties?${parameters}`);
                const groupedSpecialties = groupSpecialties(response.data);

                const filtered = hcoSpecialty ? groupedSpecialties.filter(i => i.codIdOnekeys.includes(hcoSpecialty)) : [];

                if (filtered && filtered.length) {
                    setSelectedSpecialties([{ label: filtered[0].codDescription, value: filtered[0].codIdOnekeys }]);
                    formikRef.current.setFieldValue('specialties', [{ label: filtered[0].codDescription, value: filtered[0].codIdOnekeys }]);
                }
                setSpecialties(groupedSpecialties);
            }
            else setSpecialties([]);
        }
        fetchSpecialties();
        setUuidLabel(getUuidLabel(selectedCountries));
    }, [selectedCountries, hcoSpecialty]);

    return <Modal
        centered
        size="okla-width"
        animation
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}>
        <Modal.Header closeButton>
            <Modal.Title className="modal-title_small">OKLA Search</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <div className="row">
                <div className="col-12 px-0 px-sm-3">
                    <div className="shadow-sm bg-light pb-3">
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
                                    specialties: []
                                }}
                                innerRef={formikRef}
                                enableReinitialize={true}
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
                                                    <input
                                                        type="checkbox"
                                                        className="custom-control-input"
                                                        name="isInContract"
                                                        checked={isInContract}
                                                        id="customControlInline"
                                                        onChange={(e) => {
                                                            formikProps.values.isInContract = e.target.checked;
                                                            setIsInContract(e.target.checked);
                                                        }} />
                                                    <label className="custom-control-label" for="customControlInline">In My Contract</label>
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-6 col-lg-4">
                                                <div className="form-group">
                                                    <label className="d-block">Influence Search Results</label>
                                                    <div className="custom-control custom-checkbox custom-control-inline my-1 mr-sm-4">
                                                        <input
                                                            type="checkbox"
                                                            className="custom-control-input"
                                                            name="phonetic"
                                                            checked={phonetic}
                                                            id="customControlInline2"
                                                            onChange={(e) => {
                                                                formikProps.values.phonetic = e.target.checked;
                                                                setPhonetic(e.target.checked);
                                                            }} />
                                                        <label className="custom-control-label" for="customControlInline2">Phonetic</label>
                                                    </div>
                                                    <div className="custom-control custom-checkbox custom-control-inline my-1 mr-sm-2">
                                                        <input
                                                            type="checkbox"
                                                            className="custom-control-input"
                                                            name="duplicates"
                                                            checked={duplicates}
                                                            id="customControlInline3"
                                                            onChange={(e) => {
                                                                formikProps.values.duplicates = e.target.checked;
                                                                setDuplicates(e.target.checked);
                                                            }} />
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
                                        <div className="row align-items-end">
                                            <div className="col-12 col-sm-4">
                                                <div className="form-group">
                                                    <label for="OnekeyID">
                                                        Workplace Onekey ID
                                                        {/* <OverlayTrigger trigger="click" rootClose placement="top" overlay={activityOnekeyIDHintPopup}>
                                                            <i className="fas fa-info-circle ml-1 text-secondary" role="button"></i>
                                                        </OverlayTrigger> */}
                                                    </label>
                                                    <Field className="form-control onekeyId" type='text' name='onekeyId' id='onekeyId' />
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-4">
                                                <div className="form-group">
                                                    <label for="workplaceEid" className="text-break">{uuidLabel}</label>
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
                                                    {/* <OverlayTrigger trigger="click" rootClose placement="left" overlay={searchHintPopup}>
                                                        <i className="fas fa-info-circle mt-4 ml-2 cdp-text-primary" role="button"></i>
                                                    </OverlayTrigger> */}
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


                        <div className="table-responsive shadow-sm bg-white cdp-table__responsive-wrapper">
                            <table className="table table-hover table-sm mb-0 cdp-table cdp-table__responsive">
                                    <thead className="cdp-bg-primary text-white cdp-table__header">
                                    <tr>
                                        <th>Select</th>
                                        <th>
                                            Name
                                            {/* <OverlayTrigger trigger="click" rootClose placement="right" overlay={namehintpopup}>
                                                <i className="fas fa-info-circle ml-1 text-white" role="button"></i>
                                            </OverlayTrigger> */}
                                        </th>
                                        <th>Specialty</th>
                                        <th>Address</th>
                                        <th>City</th>
                                        <th>Country</th>
                                    </tr>
                                    </thead>
                                    <tbody className="cdp-table__body bg-white">
                                        {
                                            hcos.results.map((hco, idx) => (
                                                <tr key={idx} className={searchInput.onekeyId && searchInput.onekeyId === hco.workplaceEid ? 'selected' : ''}>
                                                    <td data-for="Select">
                                                        <div className="custom-control custom-radio">
                                                            <input
                                                                type="radio"
                                                                className="custom-control-input"
                                                                id={'hco-selection-' + idx}
                                                                name="hco-result"
                                                                checked={searchInput.onekeyId && searchInput.onekeyId === hco.workplaceEid}
                                                                onChange={() => handleResultSelection(hco)} />
                                                            <label className="custom-control-label" for={'hco-selection-' + idx}></label>
                                                        </div>
                                                    </td>
                                                    <td data-for="Name">{hco.isInContract ? <i className="fas fa-circle mr-1 cdp-text-primary" title="In my contract"></i> : <i className="fas fa-circle mr-1 cdp-text-secondary" title="Not In my contract"></i>} {`${hco.name}`}</td>
                                                    <td data-for="Specialty">{(hco.specialties || ['--']).join(', ')}</td>
                                                    <td data-for="Address">{hco.address}</td>
                                                    <td data-for="City">{hco.city}</td>
                                                    <td data-for="Country">{getCountryName(hco.countryIso2)}</td>
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
        </Modal.Body>
    </Modal>
};

export default SearchHcoModal;

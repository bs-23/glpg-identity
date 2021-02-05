import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Form, Formik, Field } from 'formik';
import Select, { components } from 'react-select';
import Modal from 'react-bootstrap/Modal';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { useToasts } from 'react-toast-notifications';
import axios from 'axios';

import getUserPermittedCountries from '../../../../core/client/util/user-country';
import uuidAuthorities from '../../../../information/hcp/client/uuid-authorities.json';

const OklaSearch = (props) => {
    let {
        show,
        searchInput,
        resultSelected
    } = props;

    const defaultFormValue = {
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
        externalIdentifier: '',
        specialties: [],
    };

    const dispatch = useDispatch();
    const formikRef = useRef();
    const { addToast } = useToasts();

    const countries = useSelector(state => state.countryReducer.countries);
    const allCountries = useSelector(state => state.countryReducer.allCountries);
    const userProfile = useSelector(state => state.userReducer.loggedInUser);
    const userCountries = getUserPermittedCountries(userProfile, countries);

    const [initVal, setInitVal] = useState(defaultFormValue);
    const [users, setUsers] = useState({});
    const [selectedCountries, setSelectedCountries] = useState([]);
    const [specialties, setSpecialties] = useState([]);
    const [selectedSpecialties, setSelectedSpecialties] = useState([]);
    const [isInContract, setIsInContract] = useState(false);
    const [phonetic, setPhonetic] = useState(false);
    const [duplicates, setDuplicates] = useState(false);
    const [formData, setFormData] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [hcpSpecialty, setHcpSpecialty] = useState();
    const [uuidLabel, setUuidLabel] = useState('UUID');

    useEffect(() => {
        if (searchInput) {
            const countries = getCountries().filter(c => c.countryIso2 === searchInput.countryIso2);
            setSelectedCountries(countries);

            setInitVal({
                ...defaultFormValue,
                countries: countries || [],
                firstName: searchInput.firstName || '',
                lastName: searchInput.lastName || '',
                externalIdentifier: searchInput.uuid || ''
            });
        }
    }, [searchInput]);

    function clearFileds() {
        searchInput = null;
        setInitVal(defaultFormValue);
        setFormData({});
        setCurrentPage(1);
        setSelectedCountries([]);
        setSelectedSpecialties([]);
        setIsInContract(false);
        setDuplicates(false);
        setPhonetic(false);
        setUsers({});
        setHcpSpecialty(null);
    };

    const handleClose = (hcpDetails) => {
        resultSelected(hcpDetails);
        clearFileds();
    };

    const resetSearch = (properties) => {
        properties.resetForm();
        clearFileds();
    };

    const handleResultSelection = (hcp) => {
        axios.get(`/api/okla/hcps/${hcp.codbase}/${hcp.individualEid}`)
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

    const searchHcps = (newPage) => {
        axios.post(`/api/okla/hcps/search?page=${newPage}`, formData)
            .then(response => {
                setUsers(response.data);
                setCurrentPage(newPage);
                try {
                    scrollToResult(response.data.results.length === 0);
                }
                catch (err) {
                    console.log(err);
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
        searchHcps(currentPage - 1);
    };

    const pageRight = () => {
        if (currentPage === Math.ceil(users.totalNumberOfResults / users.resultSize)) return;
        searchHcps(currentPage + 1);
    };

    const getUuidLabel = (selectedCountries) => {
        if (!selectedCountries || !selectedCountries.length) return 'UUID';

        const authorityByCountry = uuidAuthorities.filter(a => selectedCountries.some(s => a.codbase.toLowerCase() === s.value.toLowerCase())).map(a => a.name);

        return authorityByCountry.join('/');
    };

    useEffect(() => {
        const fetchSpecialties = async () => {
            const codbases = selectedCountries.map(item => `codbases=${item.value}`);
            const parameters = codbases.join('&');
            if (parameters) {
                const response = await axios.get(`/api/hcps/specialties?${parameters}`);
                const groupedSpecialties = groupSpecialties(response.data);

                const filtered = hcpSpecialty ? groupedSpecialties.filter(i => i.codIdOnekeys.includes(hcpSpecialty)) : [];

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
    }, [selectedCountries, hcpSpecialty]);

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
                                innerRef={formikRef}
                                enableReinitialize={true}
                                initialValues={initVal}
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

                                    axios.post('/api/okla/hcps/search', data)
                                        .then(response => {
                                            setUsers(response.data);
                                            setFormData(data);
                                            setCurrentPage(1);
                                            actions.setSubmitting(false);
                                            try {
                                                scrollToResult(response.data.results.length === 0);
                                            }
                                            catch (err) {
                                                console.log(err);
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
                                }}
                            >
                                {formikProps => (
                                    <Form
                                        onSubmit={formikProps.handleSubmit}
                                        onChange={e => {
                                            if (e.target.id !== 'isInContractCheckbox'
                                                && e.target.id !== 'phoneticCheckbox'
                                                && e.target.id !== 'duplicatesCheckbox') {
                                                // changeUrl();
                                            }
                                        }}
                                    >
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
                                                            formikProps.values.countries = selectedOption;
                                                            setSelectedCountries(selectedOption || []);
                                                            formikProps.values.specialties = [];
                                                            setSelectedSpecialties([]);
                                                            // changeUrl();
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
                                                        id="isInContractCheckbox"
                                                        checked={isInContract}
                                                        onChange={(e) => {
                                                            formikProps.values.isInContract = e.target.checked;
                                                            setIsInContract(e.target.checked);
                                                        }} />
                                                    <label className="custom-control-label" for="isInContractCheckbox">In My Contract</label>
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
                                                            // changeUrl();
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
                                        <div className="row align-items-end">
                                            <div className="col-12 col-sm-4">
                                                <div className="form-group">
                                                    <label for="OnekeyID">
                                                        Activity Onekey Id
                                                        {/* <OverlayTrigger trigger="click" rootClose placement="top" overlay={activityOnekeyIDHintPopup}>
                                                            <i className="fas fa-info-circle ml-1 text-secondary" role="button"></i>
                                                        </OverlayTrigger> */}
                                                    </label>
                                                    <Field className="form-control onekeyId" type='text' name='onekeyId' id='onekeyId' />
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-4">
                                                <div className="form-group">
                                                    <label for="Individual ">Individual Onekey ID</label>
                                                    <Field className="form-control individual" type='text' name='individualEid' id='individual' />
                                                </div>
                                            </div>
                                            <div className="col-12 col-sm-4">
                                                <div className="form-group">
                                                    <label for="Individual" className="text-break">{uuidLabel}</label>
                                                    <Field className="form-control externalIdentifier" type='text' name='externalIdentifier' id='externalIdentifier' />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-6">
                                                <button type="reset" className="btn btn-block btn-secondary mt-4 p-2" onClick={() => resetSearch(formikProps)}>CLEAR</button>
                                            </div>
                                            <div className="col-6">
                                                <div className="d-flex align-items-center">
                                                    <button type="submit" className="btn btn-block text-white cdp-btn-secondary mt-4 p-2 okla-search__btn-search" disabled={!selectedCountries || !selectedCountries.length || !(formikProps.values.firstName || formikProps.values.lastName || formikProps.values.address || formikProps.values.city || formikProps.values.postCode || formikProps.values.onekeyId || formikProps.values.individualEid || formikProps.values.externalIdentifier || (selectedSpecialties && selectedSpecialties.length))}>SEARCH</button>
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
                                            <th>Name
                                                {/* <OverlayTrigger trigger="click" rootClose placement="right" overlay={nameHintPopup}>
                                                    <i className="fas fa-info-circle ml-1 text-white" role="button"></i>
                                                </OverlayTrigger> */}
                                            </th>
                                            <th>Specialty</th>
                                            <th>Workplace
                                                {/* <OverlayTrigger trigger="click" rootClose placement="right" overlay={workplaceHintPopup}>
                                                    <i className="fas fa-info-circle ml-1 text-white" role="button"></i>
                                                </OverlayTrigger> */}
                                            </th>
                                            <th>Individual Onekey ID</th>
                                            <th>Country</th>
                                        </tr>
                                    </thead>
                                    <tbody className="cdp-table__body bg-white">
                                        {
                                            users.results.map((user, idx) => (
                                                <tr key={idx} onClick={() => handleResultSelection(user)}>
                                                    <td>{user.isInContract ? <i className="fas fa-circle mr-1 cdp-text-primary" title="In my contract"></i> : <i className="fas fa-circle mr-1 cdp-text-secondary" title="Not in my contract"></i>} {`${user.firstName} ${user.lastName}`}</td>
                                                    <td>{(user.specialties || ['--']).join(', ')}</td>
                                                    <td>
                                                        {
                                                            user.workplaces.map((item, idxOfWorkPlace) => (
                                                                <div key={idxOfWorkPlace} className="currentWorkplace">
                                                                    <span className="okla-search__workplace-icons position-relative">
                                                                        {
                                                                            item.isInContract ? <i className="fas fa-circle mr-1 cdp-text-primary" title="In my contract"></i> : <i className="fas fa-circle mr-1 cdp-text-secondary" title="Not in my contract"></i>
                                                                        }
                                                                        {
                                                                            item.isValid ? <i className="fas fa-check cdp-text-primary border-left"></i> : <i className="fas fa-times cdp-text-secondary border-left"></i>
                                                                        }
                                                                    </span>
                                                                    {[item.name, item.address, item.city].filter(i => i).join(', ')}
                                                                </div>
                                                            ))
                                                        }
                                                    </td>
                                                    <td>{user.individualEid}</td>
                                                    <td>{getCountryName(user.countryIso2)}</td>
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
        </Modal.Body>
    </Modal>
};

export default OklaSearch;

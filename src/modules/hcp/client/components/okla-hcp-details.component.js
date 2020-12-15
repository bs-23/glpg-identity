import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Modal from 'react-bootstrap/Modal';
import { getOklaHcpDetails, setOklaHcpDetails } from '../hcp.actions';
import MapView from './map-view';
import { Tabs, Tab } from 'react-bootstrap';
import Dropdown from 'react-bootstrap/Dropdown';

const OklaHcpDetails = ({ individual, setSelectedIndividual }) => {
    const dispatch = useDispatch();
    const [selectedWorkplace, setSelectedWorkplace] = useState(null);
    const [selectedTab, setSelectedTab] = useState('Individual');

    const hcpDetails = useSelector(state => state.hcpReducer.oklaHcpDetails);
    const allCountries = useSelector(state => state.countryReducer.allCountries);

    const hideHcpDetails = () => {
        dispatch(setOklaHcpDetails(null));
        setSelectedIndividual(null);
    };

    const getCountryName = (countryIso2) => {
        const country = allCountries.find(c => c.country_iso2.toLowerCase() === countryIso2.toLowerCase());
        return country ? country.countryname : '--';
    };

    useEffect(() => {
        dispatch(getOklaHcpDetails(individual.codbase, individual.id));
    }, [individual]);

    useEffect(() => {
        if (hcpDetails) {
            hcpDetails.workplaces.forEach((wp, idx) => {
                if (!wp.name) {
                    wp.alternateName = `Workplace - ${idx + 1} (${wp.type})`
                }
            });
        }
        if (hcpDetails && selectedTab === 'Workplace') setSelectedWorkplace(hcpDetails.workplaces[0]);
    }, [hcpDetails, selectedTab]);

    return <Modal
        size="lg"
        centered
        show={!!hcpDetails}
        onHide={() => hideHcpDetails()}>
        <Modal.Header closeButton>
            <Modal.Title>
                HCP Details
            </Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {hcpDetails ? (
                <div className="okla-search__details">
                    <Tabs defaultActiveKey={selectedTab} className="okla-search__tabs" onSelect={(activeKey, e) => setSelectedTab(activeKey)}>
                        <Tab eventKey="Individual" title="Individual">
                            <ul className="okla-search__details-items">
                                <li className="okla-search__details-item">
                                    <strong className="okla-search__details-title">Salutation</strong>
                                    <span className="okla-search__details-value">{hcpDetails.salutation}</span>
                                </li>
                                <li className="okla-search__details-item">
                                    <strong className="okla-search__details-title">Name</strong>
                                    <span className="okla-search__details-value">{hcpDetails?.firstName} {hcpDetails?.lastName}</span>
                                </li>
                                <li className="okla-search__details-item">
                                    <strong className="okla-search__details-title">Title</strong>
                                    <span className="okla-search__details-value">{hcpDetails.title}</span>
                                </li>
                                <li className="okla-search__details-item">
                                    <strong className="okla-search__details-title">Gender</strong>
                                    <span className="okla-search__details-value">{hcpDetails.gender}</span>
                                </li>
                                <li className="okla-search__details-item">
                                    <strong className="okla-search__details-title">Graduation Year</strong>
                                    <span className="okla-search__details-value">{hcpDetails.graduationYear}</span>
                                </li>
                                <li className="okla-search__details-item">
                                    <strong className="okla-search__details-title">Birth Year</strong>
                                    <span className="okla-search__details-value">{hcpDetails.birthYear}</span>
                                </li>
                                <li className="okla-search__details-item">
                                    <strong className="okla-search__details-title">Country</strong>
                                    <span className="okla-search__details-value">{hcpDetails.countryIso2}</span>
                                </li>
                                <li className="okla-search__details-item">
                                    <strong className="okla-search__details-title">Country</strong>
                                    <span className="okla-search__details-value">{hcpDetails.specialties.join(', ')}</span>
                                </li>
                            </ul>
                        </Tab>
                        <Tab eventKey="Identifiers" title="Identifiers">
                            <div>
                                <div>
                                    Identifiers:
                                    <div className="ml-3">OneKey Individual ID: {hcpDetails.individualEid}</div>
                                    {
                                        hcpDetails.externalIdentifiers.map((identifier, identifierIdx) => (
                                            <div key={identifierIdx} className="ml-3">{identifier.name}: {identifier.value}</div>
                                        ))
                                    }
                                </div>

                                <div>Status: {hcpDetails.isValid ? 'Valid' : 'Invalid'}</div>
                            </div>
                        </Tab>
                        <Tab eventKey="Workplace" title="Workplace">
                            {/* <div>
                                {selectedWorkplace && <MapView location={selectedWorkplace.location} />}

                                <div>Workplaces:</div>
                                {
                                    hcpDetails.workplaces.map((workplace, idx) => (
                                        <div key={workplace.id} className={`p-2 border-bottom ${selectedWorkplace && workplace.id === selectedWorkplace.id ? 'selected' : ''}`} id={'wp-' + idx} onClick={() => { setSelectedWorkplace(workplace); }}>
                                            <span>{workplace.isMainActivity
                                                ? '★'
                                                : workplace.isValid
                                                    ? <i className="fas fa-check mr-1 cdp-text-primary"></i>
                                                    : <i className="fas fa-times mr-1 cdp-text-secondary"></i>}
                                            </span>
                                            <span className="ml-1">{workplace.name}</span>
                                            <span className="ml-1">| {workplace.type}</span>
                                            <span className="ml-1">| {workplace.address}</span>
                                            <span className="ml-1">| {workplace.city}, {workplace.postCode}</span>
                                            {workplace.contactNumbers.map((c, i) => (<div key={'tel-' + i}>{c.type}: {c.number}</div>))}
                                        </div>
                                    ))
                                }
                            </div> */}
                            <Dropdown>
                                <Dropdown.Toggle
                                    variant=""
                                    className="cdp-btn-outline-primary dropdown-toggle btn-sm py-0 px-1 dropdown-toggle btn">
                                    {selectedWorkplace?.name || selectedWorkplace?.alternateName}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    {hcpDetails.workplaces.map((workplace, idx) => (
                                        <Dropdown.Item
                                            key={'wp-' + idx}
                                            onClick={() => { setSelectedWorkplace(workplace); }}>
                                            {workplace.name || workplace.alternateName}
                                        </Dropdown.Item>
                                    ))}
                                </Dropdown.Menu>
                            </Dropdown>

                            {selectedWorkplace &&
                                <div className="row">
                                    <div className="row">
                                        <div className="col-6">
                                            <div className="mt-1 font-weight-bold">Name</div>
                                            <div>{selectedWorkplace.name || '--'}</div>
                                        </div>
                                        <div className="col-6">
                                            <div className="mt-1 font-weight-bold">Type</div>
                                            <div>{selectedWorkplace.type}</div>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-6">
                                            <div className="mt-1 font-weight-bold">Main activity?</div>
                                            <div>{selectedWorkplace.isMainActivity ? 'Yes' : 'No'}</div>
                                        </div>
                                        <div className="col-6">
                                            <div className="mt-1 font-weight-bold">Status</div>
                                            <div>{selectedWorkplace.isValid ? 'Valid' : 'Invalid'}</div>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-4">
                                            <div className="mt-1 font-weight-bold">Address</div>
                                            <div>{selectedWorkplace.address}</div>
                                        </div>
                                        <div className="col-4">
                                            <div className="mt-1 font-weight-bold">City</div>
                                            <div>{selectedWorkplace.city}</div>
                                        </div>

                                        <div className="col-4">
                                            <div className="mt-1 font-weight-bold">Post Code</div>
                                            <div>{selectedWorkplace.postCode}</div>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-12">
                                            <div className="mt-1 font-weight-bold">Contact Numbers:</div>
                                            {selectedWorkplace.contactNumbers.map((c, i) => (<div key={'tel-' + i}>{c.type}: {c.number}</div>))}
                                        </div>
                                    </div>
                                </div>}

                            {selectedWorkplace && <MapView location={selectedWorkplace.location} />}
                        </Tab>
                    </Tabs>
                </div>
            ) : (<div></div>)}
        </Modal.Body>
    </Modal>
};

export default OklaHcpDetails;

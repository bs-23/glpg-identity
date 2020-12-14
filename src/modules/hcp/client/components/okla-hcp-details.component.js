import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Modal from 'react-bootstrap/Modal';
import { getOklaHcpDetails, setOklaHcpDetails } from '../hcp.actions';
import MapView from './map-view';
import { Tabs, Tab } from 'react-bootstrap';

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
        if (hcpDetails && selectedTab === 'Workplace') setSelectedWorkplace(hcpDetails.workplaces[0]);
    }, [hcpDetails, selectedTab]);

    return <Modal
        size="lg"
        centered
        show={!!hcpDetails}
        onHide={() => hideHcpDetails()}>
        <Modal.Header closeButton>
            <Modal.Title>
            {hcpDetails?.firstName} {hcpDetails?.lastName}
            </Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {hcpDetails ? (
                <div className="okla-search__details">
                    <Tabs defaultActiveKey={selectedTab} className="okla-search__tabs" onSelect={(activeKey,e) => setSelectedTab(activeKey)}>
                        <Tab eventKey="Individual" title="Individual">
                            <div>
                                <div>Salutation: {hcpDetails.salutation}</div>
                                <div>Title: {hcpDetails.title}</div>
                                <div>Gender: {hcpDetails.gender}</div>
                                <div>Graduation Year: {hcpDetails.graduationYear}</div>
                                <div>Birth Year: {hcpDetails.birthYear}</div>
                                <div>Country: {getCountryName(hcpDetails.countryIso2)}</div>
                                <div>Specialties: {hcpDetails.specialties.join(', ')}</div>
                            </div>
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
                            <div>
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
                            </div>
                        </Tab>
                    </Tabs>
                </div>
            ) : (<div></div>)}
        </Modal.Body>
    </Modal>
};

export default OklaHcpDetails;

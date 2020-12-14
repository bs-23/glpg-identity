import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Modal from 'react-bootstrap/Modal';
import { getOklaHcoDetails, setOklaHcoDetails } from '../hcp.actions';
import MapView from './map-view';
import { Tabs, Tab } from 'react-bootstrap';

const OklaHcoDetails = ({ hco, setSelectedHco }) => {
    const dispatch = useDispatch();
    const [selectedTab, setSelectedTab] = useState('Identifiers');

    const hcoDetails = useSelector(state => state.hcpReducer.oklaHcoDetails);
    const allCountries = useSelector(state => state.countryReducer.allCountries);

    const hideHcoDetails = () => {
        dispatch(setOklaHcoDetails(null));
        setSelectedHco(null);
    };

    const getCountryName = (countryIso2) => {
        const country = allCountries.find(c => c.country_iso2.toLowerCase() === countryIso2.toLowerCase());
        return country ? country.countryname : '--';
    };

    useEffect(() => {
        dispatch(getOklaHcoDetails(hco.codbase, hco.id));
    }, [hco]);

    return <Modal
        size="lg"
        centered
        show={!!hcoDetails}
        onHide={() => hideHcoDetails()}>
        <Modal.Header closeButton>
            <Modal.Title>
                {hcoDetails?.name}
            </Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {hcoDetails ? (
                <div className="okla-search__details">
                    <Tabs defaultActiveKey={selectedTab} className="okla-search__tabs" onSelect={(activeKey,e) => setSelectedTab(activeKey)}>
                        <Tab eventKey="Identifiers" title="Identifiers">
                            <div>
                                <div>OneKey Workplace ID: {hcoDetails.workplaceEid}</div>
                                <div>Specialties: {hcoDetails.specialties.join(', ')}</div>
                                <div>Status: {hcoDetails.isValid ? 'Valid' : 'Invalid'}</div>
                                <div>Contract status: {hcoDetails.isInContract ? 'In my contract' : 'Not in my contract'}</div>
                                <div>Type: {hcoDetails.type}</div>
                                <div>Activity: {hcoDetails.activity}</div>
                            </div>
                        </Tab>
                        <Tab eventKey="Workplace" title="Workplace">
                            <div>
                                {hcoDetails.contactNumbers.map((c, i) => (<div key={'tel-' + i}>{c.type}: {c.number}</div>))}

                                <div>Address: {hcoDetails.address}</div>
                                <div>City: {hcoDetails.city}</div>
                                <div>Post Code: {hcoDetails.postCode}</div>
                                <div>Country: {getCountryName(hcoDetails.countryIso2)}</div>
                                {selectedTab === 'Workplace' && <MapView location={hcoDetails.location} />}
                            </div>
                        </Tab>

                    </Tabs>
                </div>
            ) : (<div></div>)}
        </Modal.Body>
    </Modal>
};

export default OklaHcoDetails;

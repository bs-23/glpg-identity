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
               HCO Details
            </Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {hcoDetails ? (
                <div className="okla-search__details">
                    <Tabs defaultActiveKey={selectedTab} className="okla-search__tabs" onSelect={(activeKey,e) => setSelectedTab(activeKey)}>
                        <Tab eventKey="Identifiers" title="Identifiers">
                            <div className="row">
                                <div className="col-12 mb-3">
                                    <strong className="okla-search__details-title">Name</strong>
                                    <span className="okla-search__details-value">{hcoDetails?.name}</span>
                                </div>
                                <div className="col-12 col-sm-6 mb-3">
                                    <strong className="okla-search__details-title">OneKey Workplace ID</strong>
                                    <span className="okla-search__details-value">{hcoDetails.workplaceEid}</span>
                                </div>
                                <div className="col-12 col-sm-6 mb-3">
                                    <strong className="okla-search__details-title">Specialties</strong>
                                    <span className="okla-search__details-value">{hcoDetails.specialties.join(', ')}</span>
                                </div>
                                <div className="col-12 col-sm-6 mb-3">
                                    <strong className="okla-search__details-title">Status</strong>
                                    <span className="okla-search__details-value">{hcoDetails.isValid ? 'Valid' : 'Invalid'}</span>
                                </div>
                                <div className="col-12 col-sm-6 mb-3">
                                    <strong className="okla-search__details-title">Contract status</strong>
                                    <span className="okla-search__details-value">{hcoDetails.isInContract ? 'In my contract' : 'Not in my contract'}</span>
                                </div>
                                <div className="col-12 col-sm-6 mb-3">
                                    <strong className="okla-search__details-title">Type</strong>
                                    <span className="okla-search__details-value">{hcoDetails.type}</span>
                                </div>
                                <div className="col-12 col-sm-6 mb-3">
                                    <strong className="okla-search__details-title">Activity</strong>
                                    <span className="okla-search__details-value">{hcoDetails.activity}</span>
                                </div>
                            </div>
                        </Tab>
                        <Tab eventKey="Workplace" title="Workplace">
                            <div className="row mb-3">
                                {hcoDetails.contactNumbers.map((c, i) => (<div className="col-12 col-sm-6 mb-3" key={'tel-' + i}>
                                    <strong className="okla-search__details-title">{c.type}</strong>
                                    <span className="okla-search__details-value">{c.number}</span>
                                </div>))}

                                <div className="col-12 col-sm-6 mb-3">
                                    <strong className="okla-search__details-title">Address</strong>
                                    <span className="okla-search__details-value">{hcoDetails.address}</span>
                                </div>
                                <div className="col-12 col-sm-6 mb-3">
                                    <strong className="okla-search__details-title">City</strong>
                                    <span className="okla-search__details-value">{hcoDetails.city}</span>
                                </div>
                                <div className="col-12 col-sm-6 mb-3">
                                    <strong className="okla-search__details-title">Post Code</strong>
                                    <span className="okla-search__details-value">{hcoDetails.postCode}</span>
                                </div>
                                <div className="col-12 col-sm-6 mb-3">
                                    <strong className="okla-search__details-title">Country</strong>
                                    <span className="okla-search__details-value">{getCountryName(hcoDetails.countryIso2)}</span>
                                </div>
                            </div>
                            {selectedTab === 'Workplace' && <MapView location={hcoDetails.location} />}
                        </Tab>

                    </Tabs>
                </div>
            ) : (<div></div>)}
        </Modal.Body>
    </Modal>
};

export default OklaHcoDetails;

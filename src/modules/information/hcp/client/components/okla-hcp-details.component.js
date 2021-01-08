import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Modal from 'react-bootstrap/Modal';
import { getOklaHcpDetails, setOklaHcpDetails } from '../hcp.actions';
import MapView from '../../../../core/client/components/map-view';
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

        if (hcpDetails && selectedTab === 'Workplace') {
            const mainWorkplace = hcpDetails.workplaces.find(w => w.isMainActivity);
            setSelectedWorkplace(mainWorkplace || hcpDetails.workplaces[0]);
        }
    }, [hcpDetails, selectedTab]);

    return <Modal
        dialogClassName='custom-modal-size'
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
                                    <span className="okla-search__details-value">{hcpDetails.salutation || '--'}</span>
                                </li>
                                <li className="okla-search__details-item">
                                    <strong className="okla-search__details-title">Name</strong>
                                    <span className="okla-search__details-value">{hcpDetails.firstName} {hcpDetails.lastName}</span>
                                </li>
                                <li className="okla-search__details-item">
                                    <strong className="okla-search__details-title">Title</strong>
                                    <span className="okla-search__details-value">{hcpDetails.title || '--'}</span>
                                </li>
                                <li className="okla-search__details-item">
                                    <strong className="okla-search__details-title">Gender</strong>
                                    <span className="okla-search__details-value">{hcpDetails.gender || '--'}</span>
                                </li>
                                <li className="okla-search__details-item">
                                    <strong className="okla-search__details-title">Graduation Year</strong>
                                    <span className="okla-search__details-value">{hcpDetails.graduationYear || '--'}</span>
                                </li>
                                <li className="okla-search__details-item">
                                    <strong className="okla-search__details-title">Birth Year</strong>
                                    <span className="okla-search__details-value">{hcpDetails.birthYear || '--'}</span>
                                </li>
                                <li className="okla-search__details-item">
                                    <strong className="okla-search__details-title">Country</strong>
                                    <span className="okla-search__details-value">{getCountryName(hcpDetails.countryIso2)}</span>
                                </li>
                                <li className="okla-search__details-item">
                                    <strong className="okla-search__details-title">Specialty</strong>
                                    <span className="okla-search__details-value">{hcpDetails.specialties ? hcpDetails.specialties.join(', ') : '--'}</span>
                                </li>
                                <li className="okla-search__details-item">
                                    <strong className="okla-search__details-title">Contract status</strong>
                                    <span className="okla-search__details-value">{hcpDetails.isInContract ? 'In my contract' : 'Not in my contract'}</span>
                                </li>
                            </ul>
                        </Tab>
                        <Tab eventKey="Identifiers" title="Identifiers">
                            <ul className="okla-search__details-items">
                                <li className="okla-search__details-item">
                                    <strong className="okla-search__details-title">OneKey Individual ID</strong>
                                    <span className="okla-search__details-value">{hcpDetails.individualEid || '--'}</span>
                                </li>
                                {
                                    hcpDetails.externalIdentifiers.map((identifier, identifierIdx) => (
                                        <li className="okla-search__details-item" key={'id-' + identifierIdx}>
                                            <strong className="okla-search__details-title">{identifier.name}</strong>
                                            <span className="okla-search__details-value">{identifier.value}</span>
                                        </li>
                                    ))
                                }
                                <li className="okla-search__details-item">
                                    <strong className="okla-search__details-title">Status</strong>
                                    <span className="okla-search__details-value">{hcpDetails.isValid ? 'Valid' : 'Invalid'}</span>
                                </li>
                            </ul>
                        </Tab>
                        <Tab eventKey="Workplace" title="Workplace">
                            <Dropdown>
                                <Dropdown.Toggle
                                    variant=""
                                    className="cdp-btn-outline-primary dropdown-toggle btn d-flex align-items-center dropdown-toggle btn">
                                    {selectedWorkplace ? selectedWorkplace.name || selectedWorkplace.alternateName : ''}
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
                                <div className="py-5">
                                    <div className="row">
                                        <div className="col-12 col-sm-6 pb-3">
                                            <div className="mt-1 font-weight-bold">Name</div>
                                            <div>{selectedWorkplace.name || '--'}</div>
                                        </div>
                                        <div className="col-12 col-sm-6 pb-3">
                                            <div className="mt-1 font-weight-bold">Type</div>
                                            <div>{selectedWorkplace.type}</div>
                                        </div>
                                        <div className="col-12 col-sm-6 pb-3">
                                            <div className="mt-1 font-weight-bold">Main activity?</div>
                                            <div>{selectedWorkplace.isMainActivity ? 'Yes' : 'No'}</div>
                                        </div>
                                        <div className="col-12 col-sm-6 pb-3">
                                            <div className="mt-1 font-weight-bold">Status</div>
                                            <div>{selectedWorkplace.isValid ? 'Valid' : 'Invalid'}</div>
                                        </div>
                                        <div className="col-12 col-sm-6 pb-3">
                                            <div className="mt-1 font-weight-bold">Contract status</div>
                                            <div>{selectedWorkplace.isInContract ? 'In my contract' : 'Not in my contract'}</div>
                                        </div>
                                        <div className="col-12 col-sm-6 pb-3">
                                            <div className="mt-1 font-weight-bold">Address</div>
                                            <div>{selectedWorkplace.address}</div>
                                        </div>
                                        <div className="col-12 col-sm-6 pb-3">
                                            <div className="mt-1 font-weight-bold">City</div>
                                            <div>{selectedWorkplace.city}</div>
                                        </div>
                                        <div className="col-12 col-sm-6 pb-3">
                                            <div className="mt-1 font-weight-bold">Post Code</div>
                                            <div>{selectedWorkplace.postCode}</div>
                                        </div>
                                        <div className="col-12">
                                            <div className="mt-1 font-weight-bold">Contact Numbers:</div>
                                            {selectedWorkplace.contactNumbers.map((c, i) => (<div key={'tel-' + i}>{c.type}: {c.number}</div>))}
                                        </div>
                                    </div>
                                </div>}

                            {selectedWorkplace && selectedWorkplace.location && <MapView location={selectedWorkplace.location} />}
                        </Tab>
                    </Tabs>
                </div>
            ) : (<div></div>)}
        </Modal.Body>
    </Modal>
};

export default OklaHcpDetails;

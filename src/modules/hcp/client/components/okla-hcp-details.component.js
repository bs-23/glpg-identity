import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Modal from 'react-bootstrap/Modal';
import { getOklaHcpDetails, setOklaHcpDetails } from '../hcp.actions';
import MapView from './map-view';

const OklaHcpDetails = ({ individual, setSelectedIndividual }) => {
    const dispatch = useDispatch();
    const [selectedWorkplace, setSelectedWorkplace] = useState(null);

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
        hcpDetails && setSelectedWorkplace(hcpDetails.workplaces[0]);
    }, [hcpDetails]);

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
                <div>
                    <div>Salutation: {hcpDetails.salutation}</div>
                    <div>Title: {hcpDetails.title}</div>
                    <div>Gender: {hcpDetails.gender}</div>
                    <div>Graduation Year: {hcpDetails.graduationYear}</div>
                    <div>Birth Year: {hcpDetails.birthYear}</div>
                    <div>Country: {getCountryName(hcpDetails.countryIso2)}</div>
                    <div>Specialties: {hcpDetails.specialties.join(', ')}</div>
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


                    { selectedWorkplace && <MapView location={selectedWorkplace.location} />}

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
            ) : (<div></div>)}
        </Modal.Body>
    </Modal>
};

export default OklaHcpDetails;

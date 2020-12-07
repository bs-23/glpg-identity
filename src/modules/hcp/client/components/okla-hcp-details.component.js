import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Modal from 'react-bootstrap/Modal';
import { getOklaHcpDetails, setOklaHcpDetails } from '../hcp.actions';
import MapView from './map-view';

const OklaHcpdetails = ({ individual, setSelectedIndividual }) => {
    const dispatch = useDispatch();
    const [selectedWorkplace, setSelectedWorkplace] = useState(null);

    const hcpDetails = useSelector(state => state.hcpReducer.oklaHcpDetails);

    const hideHcpDetails = () => {
        dispatch(setOklaHcpDetails(null));
        setSelectedIndividual(null);
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
        show={!!individual}
        onHide={() => hideHcpDetails()}>
        <Modal.Header closeButton>
            <Modal.Title>
                HCP details
            </Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {hcpDetails ? (
                <div>
                    <div>First Name: {hcpDetails.firstName}</div>
                    <div>Last Name: {hcpDetails.lastName}</div>
                    <div>Country: {hcpDetails.countryIso2}</div>
                    <div>Individual-Id: {hcpDetails.individualEid}</div>
                    <div>Specialties: {hcpDetails.specialties.join(', ')}</div>

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
                                <span>{workplace.name}</span>
                                <span>{workplace.address}</span>
                                <span>{workplace.city}</span>
                                {workplace.contactNumbers.map((c, i) => (<div key={'tel-' + i}>{c.type}: {c.number}</div>))}
                            </div>
                        ))
                    }
                </div>
            ) : (<div></div>)}
        </Modal.Body>
    </Modal>
};

export default OklaHcpdetails;

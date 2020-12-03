import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Modal from 'react-bootstrap/Modal';
import { getOklaHcpDetails, setOklaHcpDetails } from '../hcp.actions';

const OklaHcpdetails = ({ individual, setSelectedIndividual }) => {
    const dispatch = useDispatch();

    const hcpDetails = useSelector(state => state.hcpReducer.oklaHcpDetails);

    const hideHcpDetails = () => {
        dispatch(setOklaHcpDetails(null));
        setSelectedIndividual(null);
    };

    useEffect(() => {
        dispatch(getOklaHcpDetails(individual.codbase, individual.id));
    }, [individual]);

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

                    <div>Workplaces:</div>
                    {
                        hcpDetails.workplaces.map(workplace => (
                            <div>
                                <span>{workplace.isMainActivity
                                    ? '★'
                                    : workplace.isValid
                                        ? <i className="fas fa-check mr-1 cdp-text-primary"></i>
                                        : <i className="fas fa-times mr-1 cdp-text-secondary"></i>}
                                </span>
                                <span>{workplace.name}</span>
                                <span>{workplace.address}</span>
                                <span>{workplace.city}</span>
                            </div>
                        ))
                    }
                </div>
            ) : (<div></div>)}
        </Modal.Body>
    </Modal>
};

export default OklaHcpdetails;

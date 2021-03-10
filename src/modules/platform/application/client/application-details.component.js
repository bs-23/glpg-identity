import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import { Modal } from "react-bootstrap";

const ApplicationDetails = ({ applicationId }) => {
    const [applicationDetails, setApplicationDetails] = useState();
    const nullValueToken = '--';

    const getApplication = async () => {
        if(!applicationId) return;
        const response = await Axios.get(`/api/applications/${applicationId}`);
        setApplicationDetails(response.data);
    }

    useEffect(() => {
        getApplication();
    }, []);

    return <div className="profile-detail p-3 mb-3 mb-sm-0">
        <h2 className="profile-detail__name pb-3">{ applicationDetails && applicationDetails.name ? applicationDetails.name  : '' }</h2>
        <div className="row pb-0 pb-sm-2">
            <div className="col-12 col-md-4 pb-3">
                <span className="mr-2 d-block profile-detail__label">Email</span>
                <span className="profile-detail__value">{applicationDetails && applicationDetails.email ? applicationDetails.email : nullValueToken}</span>
            </div>
            <div className="col-6 col-md-4 pb-3">
                <span className="mr-2 d-block profile-detail__label">Type</span>
                <span className="profile-detail__value">{applicationDetails && applicationDetails.type ? applicationDetails.type : nullValueToken}</span>
            </div>
            <div className="col-6 col-md-4 pb-3">
                <span className="mr-2 d-block profile-detail__label">Is Active</span>
                <span className="profile-detail__value">{applicationDetails && applicationDetails.is_active ? 'Active' : 'Inactive'}</span>
            </div>
            <div className="col-12 pb-3">
                <span className="mr-2 d-block profile-detail__label">Metadata</span>
                <span className="profile-detail__value">{applicationDetails && applicationDetails.metadata ? JSON.stringify(applicationDetails.metadata) : nullValueToken}</span>
            </div>
            <div className="col-12 pb-3">
                <span className="mr-2 d-block profile-detail__label">Description</span>
                <span className="profile-detail__value">{applicationDetails && applicationDetails.description ? applicationDetails.description : nullValueToken}</span>
            </div>
        </div>
    </div>
}

const ApplicationDetailsModal = ({ applicationId, show, onHide, ...rest }) => {
    return <Modal
        show={show}
        onHide={onHide}
        dialogClassName="modal-90w modal-customize"
        aria-labelledby="example-custom-modal-styling-title"
        centered
        size="lg"
        {...rest}
    >
        <Modal.Header closeButton>
            <Modal.Title id="example-custom-modal-styling-title">
                Application Details
            </Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <ApplicationDetails applicationId={applicationId} />
        </Modal.Body>
    </Modal>
}

export default ApplicationDetailsModal;

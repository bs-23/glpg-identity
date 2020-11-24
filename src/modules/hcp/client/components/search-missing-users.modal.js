import React from "react";
import SearchMissingUsers from './search-missing-users.component';
import Modal from 'react-bootstrap/Modal';

const ConsentComponent = () => {
    return <Modal
        size="lg"
        centered
        show={!!consentId}
        onHide={() => hideConsentDetails()}>
        <Modal.Header closeButton>
            <Modal.Title>
                Consent details
            </Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <SearchMissingUsers />
        </Modal.Body>
    </Modal>
};

export default ConsentComponent;

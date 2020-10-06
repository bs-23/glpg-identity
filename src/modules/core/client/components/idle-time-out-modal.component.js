import React, { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

export const IdleTimeOutModal = ({showModal, handleClose, handleLogout, remainingTime}) => {
    const [time, setTime] = useState(60);

    useEffect(() => {
        setTimeout(() => {
            const decreased_time = time;
            setTime(decreased_time - 1);
        }, 1000);
    });

    return (
        <Modal show={showModal} onHide={handleClose}>
            <Modal.Header closeButton>
            <Modal.Title>You Have Been Idle!</Modal.Title>
            <Modal.Title>{time}</Modal.Title>
            </Modal.Header>
            <Modal.Body>You Will Get Timed Out. You want to stay?</Modal.Body>
            <Modal.Footer>
            <Button variant="danger" onClick={handleLogout}>
                Logout
            </Button>
            <Button variant="primary" onClick={handleClose}>
                Stay
            </Button>
            </Modal.Footer>
        </Modal>
    )
}
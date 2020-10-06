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
        <Modal show={showModal} onHide={handleClose} centered>
            <Modal.Body >
                <div className="text-center">
                    <div className="my-3">
                        <img alt="stop clock" src="/assets/images/stop-clock.svg" height="150" />
                    </div>
                    <p className="pt-2">Your session is about to expire</p>
                    <p>You will be logged out in <strong>{time}</strong> seconds</p>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={handleLogout} className="btn btn-secondary border-0">
                Logout
            </Button>
            <Button onClick={handleClose} className="btn cdp-btn-primary border-0">
                Continue Session
            </Button>
            </Modal.Footer>
        </Modal>
    )
}

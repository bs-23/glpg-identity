import React, { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

export const IdleTimeOutModal = ({showModal, handleClose, handleLogout, remainingTime}) => {
    return (
        <Modal show={showModal} onHide={handleClose} centered>
            <Modal.Body >
                <div className="text-center">
                    <div className="my-3">
                        <img alt="stop clock" src="/assets/images/stop-clock.svg" height="150" />
                    </div>
                    <p className="pt-2">Your session is about to expire</p>
                    <p>You will be logged out in <strong>{remainingTime}</strong> seconds</p>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={handleLogout} variant="link" className="cdp-btn-link-secondary border-0">
                    Sign out
                </Button>

                <Button onClick={handleClose} className="btn cdp-btn-primary border-0">
                    Continue Session
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { useCookies } from 'react-cookie';
import { useLocation } from 'react-router-dom';
import { useIdleTimer } from 'react-idle-timer';
import React, { useEffect, useState } from 'react';

export default function IdleTimeOutModalComponent(props) {
    const location = useLocation();
    const [show, setShow] = useState(props.show);
    const [, setCookie, removeCookie] = useCookies();

    const handleShow = () => setShow(true);
    const handleClose = () => setShow(false);

    const handleLogout = () => {
        setCookie('logged_in', '', { path: '/' });
        removeCookie('logged_in');

        window.location.assign('/api/logout');
    };

    useIdleTimer({
        timeout: 1000 * 60 * 14,
        onIdle: handleShow,
        debounce: 500
    });

    const [remainingTime, setRemainingTime] = useState(59);

    useEffect(() => {
        setTimeout(() => {
            const t = remainingTime - 1;

            if(show) {
                if(remainingTime) setRemainingTime(t);
                if(remainingTime === 0) {
                    handleLogout();
                }
            } else setRemainingTime(59);
        }, 1000);
    });

    return (
        <Modal show={location.pathname !== '/login' && show} onHide={handleClose} centered backdrop="static" keyboard={false}>
            <Modal.Body >
                <div className="text-center">
                    <div className="my-3">
                        <img alt="stop clock" src="/assets/images/stop-clock.svg" height="150"/>
                    </div>
                    <p className="pt-2">Your session is about to expire. Logging out in <strong>{remainingTime}</strong> seconds!</p>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={handleLogout} variant="link" className="cdp-btn-link-secondary border-0" href="/api/logout">
                    Logout
                </Button>

                <Button onClick={handleClose} className="btn cdp-btn-primary border-0">
                    Stay Logged In
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

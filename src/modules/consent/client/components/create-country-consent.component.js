
import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal'
import { Form, Formik, Field, FieldArray, ErrorMessage } from "formik";
import { useSelector, useDispatch } from 'react-redux';
import { getCdpConsents } from '../consent.action';

const CreateCountryConsent = (props) => {


    const [show, setShow] = useState(false);

    const handleClose = () => {

        setShow(false);
        props.changeShow(false);
    }


    return (
        <Modal show={props.show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Modal heading</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {props.consents && props.consents.map(x => (
                    <span>{x.title}</span>
                ))}
            </Modal.Body>
            <Modal.Footer>
                <button className="btn btn-secondary" onClick={handleClose}>
                    Close
          </button>
                <button className="btn btn-primary" onClick={handleClose}>
                    Save Changes
          </button>
            </Modal.Footer>
        </Modal>
    );
}

export default CreateCountryConsent;

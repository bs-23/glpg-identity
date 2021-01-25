import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import { getPartnerById } from '../manage-partners.actions';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { useToasts } from 'react-toast-notifications';

const PartnerDetails = (props) => {
    const [, setDetailShow] = useState(false);
    const dispatch = useDispatch();
    const { addToast } = useToasts();
    const partner = useSelector(state => state.managePartnerReducer.partner);
    const handleClose = () => {
        setDetailShow(false);
        props.changeDetailShow(false);
    };

    useEffect(() => {
        console.log();
        dispatch(getPartnerById(props.detailId, props.detailType));

    }, [props.detailId]);

    const downloadFile = (id) => {
        axios.get(`/api/partner/document/${id}`)
            .then(({ data }) => {
                const newWindow = window.open(data, '_blank', 'noopener,noreferrer')
                if (newWindow) newWindow.opener = null
            })
            .catch(err => {
                addToast('Could not download file', {
                    appearance: 'error',
                    autoDismiss: true
                });
            });
    }

    return (
        <Modal size="lg" centered show={props.detailShow} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title className="modal-title_small">
                    {props.detailType === 'hcp' ? 'HCP' :
                        props.detailType === 'hco' ? 'HCO' :
                            props.detailType === 'wholesalers' ? 'WHOLESALER' :
                                props.detailType === 'vendors' ? 'VENDOR' : null
                    } Business Partner Request Details
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {props.countries && props.countries.length > 0 && partner &&
                    <div className="row">
                        <div className="col-12">
                            <h6>{props.detailType === 'hcp' ?
                                partner.first_name + ' ' + partner.last_name : partner.requestor_first_name + ' ' + partner.requestor_last_name}</h6>

                        </div>
                        <div className="col-6">
                            <p className="text-success">Information</p>
                            <p>Beneficiary Type</p>
                            <p>{partner.beneficiary_category}</p>
                            <p>Customer OneKey Id </p>
                            <p>{partner.onekey_id}</p>
                            <p>Local UUID</p>
                            <p>{partner.uuid}</p>
                        </div>
                        <div className="col-6">
                            <p className="text-success">Address</p>
                            <p>Streetname & House no</p>
                            <p>{partner.address}</p>
                            <p>Postcode & City </p>
                            <p>{partner.post_code + ' ' + partner.city}</p>
                            <p>Country</p>
                            {partner.country_iso2 && <p>{(props.countries.find(i => i.country_iso2.toLowerCase() === partner.country_iso2.toLowerCase())).countryname}</p>}
                        </div>
                        <div className="col-12">
                            <p>Galapagos Contracts</p>
                            {partner.documents && partner.documents.map(doc => (
                                <a key={doc.id} onClick={() => downloadFile(doc.id)} className="d-block text-primary">{doc.name}</a>
                            ))
                            }
                        </div>
                    </div>
                }
            </Modal.Body>

        </Modal >
    )
};

export default PartnerDetails;

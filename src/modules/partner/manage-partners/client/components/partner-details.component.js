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
        if (props.detailShow) dispatch(getPartnerById(props.detailId, props.detailType));
    }, [props.detailShow]);

    const downloadFile = (id) => {
        axios.get(`/api/partners/documents/${id}`)
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
                    {props.detailType === 'hcps' ? 'HCP' :
                        props.detailType === 'hcos' ? 'HCO' :
                            props.detailType === 'wholesalers' ? 'WHOLESALER' :
                                props.detailType === 'vendors' ? 'VENDOR' : null
                    } Business Partner Request Details
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-3 p-sm-5">
                {props.countries && props.countries.length > 0 && partner &&
                    <div className="row">
                        <div className="col-12">
                            <h4 className="mb-3">{props.detailType === 'hcps' || props.detailType === 'hcos' ?
                                partner.first_name + ' ' + partner.last_name : partner.requestor_first_name + ' ' + partner.requestor_last_name}</h4>

                        </div>
                        {props.detailType === 'hcps' || props.detailType === 'hcos' &&
                            <div className="col-12">
                                <div className="row">
                                    <div className="col-12 col-sm-6">
                                        <div className="border rounded">
                                            <h5 className="bg-light p-3 cdp-text-primary font-weight-bold-light rounded-top">Information</h5>
                                            <ul className="p-3 m-0 list-unstyled">
                                                <li className="pb-3">
                                                    <strong className="h5 font-weight-bold-light d-block">Beneficiary Type</strong>
                                                    <span className="h5 d-block">{partner.beneficiary_category}</span>
                                                </li>
                                                <li className="pb-3">
                                                    <strong className="h5 font-weight-bold-light d-block">Customer OneKey Id</strong>
                                                    <span className="h5 d-block">{partner.onekey_id}</span>
                                                </li>
                                                <li className="pb-3">
                                                    <strong className="h5 font-weight-bold-light d-block">Local UUID</strong>
                                                    <span className="h5 d-block">{partner.uuid}</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="col-12 col-sm-6 ">
                                        <div className="border rounded">
                                            <h5 className="bg-light p-3 cdp-text-primary font-weight-bold-light rounded-top">Address</h5>
                                            <ul className="p-3 m-0 list-unstyled">
                                                <li className="pb-3">
                                                    <strong className="h5 font-weight-bold-light d-block">Streetname & House no</strong>
                                                    <span className="h5 d-block">{partner.address}</span>
                                                </li>
                                                <li className="pb-3">
                                                    <strong className="h5 font-weight-bold-light d-block">Postcode & City</strong>
                                                    <span className="h5 d-block">{partner.post_code + ' ' + partner.city}</span>
                                                </li>
                                                <li className="pb-3">
                                                    <strong className="h5 font-weight-bold-light d-block">Country</strong>
                                                    {partner.country_iso2 && <span className="h5 d-block">{(props.countries.find(i => i.country_iso2.toLowerCase() === partner.country_iso2.toLowerCase())).countryname}</span>}
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }
                        <div className="col-12">
                            <div className="border rounded shadow-sm mt-4">
                                <h6 className="bg-light p-3 font-weight-bold-light rounded-top">Galapagos Contracts</h6>
                                <div className="p-3">
                                    {partner.documents && partner.documents.map(doc => (
                                        <a key={doc.id} onClick={() => downloadFile(doc.id)} className="d-block text-primary">{doc.name}</a>
                                    ))
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                }
            </Modal.Body>

        </Modal >
    )
};

export default PartnerDetails;

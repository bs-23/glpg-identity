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
                    {props.detailType === 'hcps' ? <span><i className="fas fa-user-md fa-1_5x pr-2"></i> HCP</span> :
                        props.detailType === 'hcos' ? <span><i className="fas fa-hospital fa-1_5x pr-2"></i> HCO</span> :
                            props.detailType === 'wholesalers' ? <span><i className="fas fa-hospital-user fa-1_5x pr-2"></i> Wholesaler</span> :
                                props.detailType === 'vendors' ? <span><i className="fas fa-dolly fa-1_5x pr-2"></i> Vendor</span> : null
                    } Business Partner Request Details
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-3 p-sm-5">
                {props.countries && props.countries.length > 0 && partner &&
                    <div className="row">
                        <div className="col-12">
                            <h4 className="mb-4 pb-2 font-weight-bold-light">{(props.detailType === 'hcps' || props.detailType === 'hcos') ?
                                partner.first_name + ' ' + partner.last_name : partner.name}</h4>

                        </div>

                        <div className="col-12">
                            <div className="row">

                                <div className="col-12 col-sm-6">
                                    <div className="border rounded">
                                        <h5 className="bg-light p-3 cdp-text-primary font-weight-bold-light rounded-top">Information</h5>
                                        {(props.detailType === 'hcps' || props.detailType === 'hcos') ?
                                            <ul className="p-3 m-0 list-unstyled">
                                                {props.detailType !== 'hcos' && <li className="pb-3">
                                                    <strong className="h6 font-weight-bold-light d-block">Beneficiary Type</strong>
                                                    <span className="h6 d-block text-secondary">{partner.beneficiary_category}</span>
                                                </li>}
                                                <li className="pb-3">
                                                    <strong className="h6 font-weight-bold-light d-block">Customer OneKey Id</strong>
                                                    <span className="h6 d-block text-secondary">{partner.onekey_id}</span>
                                                </li>
                                                <li className="pb-3">
                                                    <strong className="h6 font-weight-bold-light d-block">Local UUID</strong>
                                                    <span className="h6 d-block text-secondary">{partner.uuid}</span>
                                                </li>
                                            </ul>
                                            :
                                            <ul className="p-3 m-0 list-unstyled">
                                                <li className="pb-3">
                                                    <strong className="h6 font-weight-bold-light d-block">Requestor Name</strong>
                                                    <span className="h6 d-block  text-secondary">{partner.requestor_first_name + ' ' + partner.requestor_last_name}</span>
                                                </li>
                                                <li className="pb-3">
                                                    <strong className="h6 font-weight-bold-light d-block">Registration no/VAT code</strong>
                                                    <span className="h6 d-block text-secondary">{partner.registration_number}</span>
                                                </li>
                                                <li className="pb-3">
                                                    <strong className="h6 font-weight-bold-light d-block">Purchasing Organization</strong>
                                                    <span className="h6 d-block text-secondary">{partner.purchasing_org}</span>
                                                </li>
                                            </ul>

                                        }
                                    </div>
                                </div>

                                <div className="col-12 col-sm-6 ">
                                    <div className="border rounded">
                                        <h5 className="bg-light p-3 cdp-text-primary font-weight-bold-light rounded-top">Address</h5>
                                        <ul className="p-3 m-0 list-unstyled">
                                            <li className="pb-3">
                                                <strong className="h6 font-weight-bold-light d-block">Streetname & House no</strong>
                                                <span className="h6 d-block text-secondary">{partner.address}</span>
                                            </li>
                                            <li className="pb-3">
                                                <strong className="h6 font-weight-bold-light d-block">Postcode & City</strong>
                                                <span className="h6 d-block text-secondary">{partner.post_code + ' ' + partner.city}</span>
                                            </li>
                                            <li className="pb-3">
                                                <strong className="h6 font-weight-bold-light d-block">Country</strong>
                                                {partner.country_iso2 && <span className="h6 d-block text-secondary">{(props.countries.find(i => i.country_iso2.toLowerCase() === partner.country_iso2.toLowerCase())).countryname}</span>}
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div className="col-12">
                            {partner.documents && partner.documents.length > 0 &&
                                <div className="border rounded shadow-sm mt-4">
                                    <h6 className="bg-light p-3 font-weight-bold-light rounded-top">Galapagos Contracts</h6>
                                    <div className="p-3">
                                        {partner.documents && partner.documents.map(doc => (
                                            <a key={doc.id} onClick={() => downloadFile(doc.id)} type="button" className="d-block mb-2 d-flex align-items-baseline cdp-text-primary">
                                                <i className="fas fa-paperclip mr-2"></i>{doc.name}
                                            </a>
                                        ))
                                        }
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                }
            </Modal.Body>

        </Modal >
    )
};

export default PartnerDetails;

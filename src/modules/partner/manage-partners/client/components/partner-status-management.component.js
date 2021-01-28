import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import { getPartnerById, approveUser } from '../manage-partners.actions';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { useToasts } from 'react-toast-notifications';

const PartnerStatusManage = (props) => {
    const [, setStatusShow] = useState(false);
    const [statusSelect, setStatusSelect] = useState(null);
    const dispatch = useDispatch();
    const { addToast } = useToasts();
    const partner = useSelector(state => state.managePartnerReducer.partner);
    const handleClose = () => {
        setStatusShow(false);
        props.changeStatusShow(false);
    };

    useEffect(() => {
        if (props.statusShow) dispatch(getPartnerById(props.partnerInfo.id, props.detailType));
    }, [props.statusShow]);

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

    const userApprove = () => {
        dispatch(approveUser(props.partnerInfo.id, props.detailType)).then(() => {
            addToast('User approved', {
                appearance: 'success',
                autoDismiss: true
            });
        }).catch(error => {
            addToast(error.response.data, {
                appearance: 'error',
                autoDismiss: true
            });
        });

        handleClose();
    }

    const confirmStatus = () => {
        if (statusSelect === 'approve') {
            userApprove();
        }
    }


    return (
        <Modal size="lg" centered show={props.statusShow} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title className="modal-title_small">
                    Status Update
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-3 p-sm-5">
                {partner &&
                    <div className="row">
                        <div className="col-12">
                            <h4 className="mb-3">{props.detailType === 'hcp' || props.detailType === 'hco' ?
                                partner.first_name + ' ' + partner.last_name : partner.requestor_first_name + ' ' + partner.requestor_last_name}</h4>

                            <p>{partner.email}</p>
                        </div>
                        <div className="col-12">


                        </div>
                        <div className="col-12">
                            <div className="row">
                                {partner.documents && partner.documents.length > 0 &&
                                    <div className="col-6">
                                        <div className="mt-4">
                                            <h6 className="bg-light p-3 font-weight-bold-light rounded-top">Galapagos Contracts</h6>
                                            <div className="p-3">
                                                {partner.documents && partner.documents.map(doc => (
                                                    <a key={doc.id} onClick={() => downloadFile(doc.id)} className="d-block text-primary">{doc.name}</a>
                                                ))
                                                }
                                            </div>
                                        </div>
                                    </div>
                                }
                                {partner.bank_account_no &&
                                    <div className="col-6">
                                        <h6 className="bg-light p-3 font-weight-bold-light rounded-top">Bank Account</h6>
                                        <p>{partner.bank_account_no}</p>
                                    </div>
                                }
                            </div>

                        </div>

                        <div className="col-12">
                            <button onClick={() => setStatusSelect("approve")} className={statusSelect === 'approve' ? "btn cdp-btn-primary mt-4 p-2 font-weight-bold" : "btn cdp-btn-outline-primary mt-4 p-2 font-weight-bold"}>Approve User</button>
                            <button disabled className="btn cdp-btn-outline-primary mt-4 p-2 font-weight-bold">Reject User</button>
                            <button onClick={() => confirmStatus()} className="btn btn-block cdp-btn-outline-primary mt-4 p-2 font-weight-bold">Confirm</button>
                        </div>
                    </div>
                }
            </Modal.Body>

        </Modal >
    )
};

export default PartnerStatusManage;

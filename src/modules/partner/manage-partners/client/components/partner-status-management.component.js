import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import { getPartnerById, approveBusinessPartner, resendFormForCorrection } from '../manage-partners.actions';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { useToasts } from 'react-toast-notifications';
import { Form, Formik, Field, ErrorMessage } from 'formik';
import { partnerSchema } from '../manage-partners.schema';
import { getPartnersToBeApproved } from '../../client/manage-partners.actions';

const PartnerStatusManage = (props) => {
    const [, setStatusShow] = useState(false);
    const [statusAction, setStatusAction] = useState(null);
    const dispatch = useDispatch();
    const { addToast } = useToasts();
    const partner = useSelector(state => state.managePartnerReducer.partner);
    const handleClose = () => {
        setStatusAction(null);
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

    const approvePartner = () => {
        dispatch(approveBusinessPartner(props.partnerInfo.id, props.detailType)).then(() => {
            dispatch(getPartnersToBeApproved('?status=not_approved&limit=5')).then(() => {
                addToast('User approved', {
                    appearance: 'success',
                    autoDismiss: true
                });
            });
        }).catch(error => {
            addToast((error.response || {}).data || 'Operation Failed', {
                appearance: 'error',
                autoDismiss: true
            });
        }).then(() => handleClose());
    }

    const resendForm = (values) => {
        dispatch(resendFormForCorrection(props.partnerInfo.id, props.detailType, values)).then(() => {
            dispatch(getPartnersToBeApproved('?status=not_approved&limit=5')).then(() => {
                addToast('Form sent for correction', {
                    appearance: 'success',
                    autoDismiss: true
                });
            });
        }).catch(error => {
            addToast((error.response || {}).data || 'Operation Failed', {
                appearance: 'error',
                autoDismiss: true
            });
        }).then(() => handleClose());
    }

    return (
        <Modal size="lg" centered show={props.statusShow} onHide={handleClose}>
            <Modal.Header className="p-3 p-sm-4" closeButton>
                <Modal.Title className="modal-title_small">
                    Status Update
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-3 p-sm-4">
                {partner &&
                    <div className="row">
                        <div className="col-12">
                            <h4 className="mb-0 font-weight-bold-light">{props.detailType === 'hcps' || props.detailType === 'hcos' ?
                                partner.first_name + ' ' + partner.last_name : partner.name}</h4>

                            <p className="mt-3 mb-0">{partner.email}</p>
                            <p>{(new Date(partner.created_at)).toLocaleDateString('en-GB').replace(/\//g, '.')}</p>
                        </div>
                        <div className="col-12">
                            <div className="row mt-3">
                                {
                                    <div className="col-12 col-sm-7">
                                        <h5 className="font-weight-bold-light mb-0">Legal Contracts</h5>
                                        <div className="py-3">
                                            {partner.documents && partner.documents.length > 0 && partner.documents.map(doc => (
                                                <a key={doc.id} onClick={() => downloadFile(doc.id)} className="cdp-text-primary small font-weight-bold-light mb-2 text-break d-flex align-items-baseline cursor-pointer">
                                                    <i className="fas fa-paperclip cdp-text-primary mr-2"></i> {doc.name}
                                                </a>
                                            ))
                                            }
                                            {
                                                partner.documents && partner.documents.length === 0 &&
                                                <p>--</p>
                                            }
                                        </div>
                                    </div>
                                }
                                {
                                    <div className="col-12 col-sm-5">
                                        <h5 className="font-weight-bold-light mb-0">Bank Account</h5>
                                        <div className="py-3">
                                            {partner.bank_account_no && <span className="d-block mb-2 text-break">{partner.bank_account_no}</span>}
                                            {partner.bank_account_no === null && <p>--</p>}
                                        </div>
                                    </div>
                                }
                            </div>

                        </div>
                        <div className="col-12">
                            <Formik
                                initialValues={{
                                    reason_for_correction: "",
                                }}
                                validationSchema={partnerSchema}
                                displayName="Partner Status Change"
                                onSubmit={(values, actions) => {
                                    if (statusAction === 'approve') {
                                        approvePartner();
                                    } else if (statusAction === 'resend-form') {
                                        resendForm(values);
                                    }
                                }}
                            >
                                {formikProps => (
                                    <Form onSubmit={formikProps.handleSubmit} className="row">
                                        <div className="col-12 d-flex">
                                            <button type="button" onClick={() => { setStatusAction("approve"); formikProps.setFieldValue('reason_for_correction', 'approve'); }} className={statusAction === 'approve' ? "btn btn-block mr-2 cdp-btn-primary p-2 mt-0 font-weight-bold text-white" : "btn btn-block mr-2 cdp-btn-outline-primary p-2 font-weight-bold mt-0"}>Approve User</button>

                                            <button type="button" onClick={() => { setStatusAction("resend-form"); formikProps.setFieldValue('reason_for_correction', ''); formikProps.setFieldTouched('reason_for_correction', false); }}
                                                className={statusAction === 'resend-form' ? "btn btn-block ml-2 btn-danger p-2 font-weight-bold mt-0" : "btn btn-block ml-2 btn-outline-danger p-2 font-weight-bold mt-0"}>Correction Required</button>
                                        </div>
                                        <div className="col-12">
                                            {statusAction === 'resend-form' &&
                                                <div className="mt-4">
                                                    <label className="label-style">Reason for correction <span className="text-danger">*</span></label>
                                                    <Field className="form-control" type="text" as="textarea" name="reason_for_correction" />
                                                    <div className="invalid-feedback col-12"><ErrorMessage name="reason_for_correction" /></div>
                                                </div>
                                            }
                                            {statusAction &&
                                                <button
                                                    type="submit"
                                                    disabled={!statusAction}
                                                    className="btn btn-block btn-secondary mt-4 p-2 font-weight-bold">
                                                    {statusAction === 'approve'
                                                        ? 'Confirm And Request SAP Report'
                                                        : 'Confirm And Resend For Correction'}
                                                </button>
                                            }
                                        </div>

                                    </Form>
                                )}
                            </Formik>
                        </div>

                    </div>
                }
            </Modal.Body>

        </Modal >
    )
};

export default PartnerStatusManage;

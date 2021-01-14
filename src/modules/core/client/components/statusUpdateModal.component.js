import React, { useState } from "react";
import { Form, Formik, Field, ErrorMessage } from 'formik';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios';
import { useToasts } from 'react-toast-notifications';
import { useDispatch } from 'react-redux';
import { getHcpProfiles } from '../../../information/hcp/client/hcp.actions';
import { ApprovalRejectSchema } from '../../../information/hcp/client/hcp.schema';

export default function statusupdateModal(props) {
  const dispatch = useDispatch();
    const { user, show, onHide, type , onStatusUpdate, filterSetting} = props;
  const [consentForUser, setConsentForUser] = useState({user});
  const { addToast } = useToasts();

  const getConsentsForUser = async () => {
    const { data } = await axios.get(`/api/hcp-profiles/${user.id}/consents`);
    setConsentForUser({ ...user, consents: data.data });
  }

 const onUpdateStatusSuccess = () => {
    addToast('Successfully changed user status.', {
      appearance: 'success',
      autoDismiss: true
    })
    if(type == 'list'){
        onStatusUpdate();
    }
    else if (type == 'inbox'){
        dispatch(getHcpProfiles('?page=1&status=not_verified&limit=5'));
    }
   onHide();
  }

  const onUpdateStatusFailure = (error) => {
    const errorMessage = error.response.data.errors.length ? error.response.data.errors[0].message : 'Could not change user status.'
    addToast(errorMessage, {
      appearance: 'error',
      autoDismiss: true
    });
    onHide();
  }
return(
<Modal
  show={show}
  onShow={getConsentsForUser}
  onHide={ onHide }
  dialogClassName="modal-customize"
  aria-labelledby="example-custom-modal-styling-title"
  centered
  size="lg"
>
  <Modal.Header closeButton>
    <Modal.Title id="example-custom-modal-styling-title">
      Status Update
    </Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <div className="p-3">
      <div className="row">
        <div className="col">
            <h4 className="font-weight-bold">{`${consentForUser.first_name} ${consentForUser.last_name}`}</h4>
            <div className="mt-1">{consentForUser.email}</div>
            <div className="mt-1 pb-2">{(new Date(consentForUser.created_at)).toLocaleDateString('en-GB').replace(/\//g, '.')}</div>
        </div>
      </div>
      <div>
        <h5 className="font-weight-bold my-3">Consents: </h5>
        <div className="row pb-3">
          <div className="col">
              {consentForUser.consents && consentForUser.consents.length ?
                consentForUser.consents.map(consent => {
                return consent.consent_given && <div className="pb-1" key={consent.id} >
                  <i className={`icon ${consent.consent_given ? 'icon-check-filled' : 'icon-close-circle text-danger'} cdp-text-primary mr-2 small`}></i>{consent.preference}
                </div>
              })
              : <div className="alert alert-warning">The HCP has not given any consent.</div>
            }
          </div>
        </div>
      </div>
      <Formik
        initialValues={{
          comment: '',
          selectedStatus: '',
          other_comment: ''
        }}
        displayName="ApproveRejectForm"
        validationSchema={ApprovalRejectSchema}
        onSubmit={(values, actions) => {
          if (values.selectedStatus === 'approve') {
            if (values.comment === 'other') values.comment = values.other_comment;
            axios.put(`/api/hcp-profiles/${user.id}/approve`, { comment: values.comment })
              .then(() => onUpdateStatusSuccess())
              .catch(err => onUpdateStatusFailure(err))
          }
          if (values.selectedStatus === 'reject') {
            axios.put(`/api/hcp-profiles/${user.id}/reject`, values)
              .then(() => onUpdateStatusSuccess())
              .catch(err => onUpdateStatusFailure(err))
          }
          actions.setSubmitting(false);
          actions.resetForm();
        }}
      >
        {formikProps => (
          <Form onSubmit={formikProps.handleSubmit}>
            <div className="row">
              <div className="col-6">
                <a
                  className={`btn btn-block cdp-btn-outline-primary mt-4 p-2 font-weight-bold ${formikProps.values.selectedStatus === 'approve' ? 'selected' : ''}`}
                  onClick={() => {
                    if (formikProps.values.selectedStatus !== 'approve') {
                      formikProps.setFieldValue('selectedStatus', 'approve');
                      formikProps.setFieldValue('comment', '');
                      formikProps.setFieldValue('other_comment', '');
                      formikProps.setFieldTouched('comment', false);
                      formikProps.setFieldTouched('other_comment', false);
                    }
                  }}
                >
                Approve User
                </a>
              </div>
              <div className="col-6">
                <a
                  onClick={() => {
                    if (formikProps.values.selectedStatus !== 'reject') {
                      formikProps.setFieldValue('selectedStatus', 'reject');
                      formikProps.setFieldValue('comment', '');
                      formikProps.setFieldValue('other_comment', '');
                      formikProps.setFieldTouched('comment', false);
                      formikProps.setFieldTouched('other_comment', false);
                    }
                  }}
                  className={`btn btn-block cdp-btn-outline-danger mt-4 p-2 font-weight-bold  ${formikProps.values.selectedStatus === 'reject' ? 'selected' : ''}`}
                >
                Reject User
                </a>
              </div>
            </div>
            {formikProps.values.selectedStatus === 'approve' && <div className="row mt-4">
              <div className="col-12 col-sm-12">
                <div className="form-group mb-0">
                  <label className="font-weight-bold" htmlFor="comment">Comment <span className="text-danger">*</span></label>
                  <div className="custom-control custom-radio pb-2">
                    <Field className="custom-control-input" id="UUIDmanually" data-testid='comment' type="radio" name="comment" value="HCP User did a mistake in typing UUID manually" />
                    <label className="custom-control-label font-weight-bold" for="UUIDmanually"> HCP User did a mistake in typing UUID manually</label>
                  </div>
                  <div className="custom-control custom-radio pb-2">
                    <Field className="custom-control-input" data-testid='comment' type="radio" id="PharmaCompanies" name="comment" value="HCP User has exclusivity with other Pharma Companies" />
                    <label className="custom-control-label font-weight-bold" for="PharmaCompanies">HCP User has exclusivity with other Pharma Companies</label>
                  </div>
                  <div className="custom-control custom-radio pb-2">
                    <Field className="custom-control-input" data-testid='comment' id="OneKeypopulation" type="radio" name="comment" value="HCP User is not in the customers IQVia OneKey population" />
                    <label className="custom-control-label font-weight-bold" for="OneKeypopulation">HCP User is not in the customers IQVia OneKey population</label>
                  </div>
                  <div className="custom-control custom-radio pb-2">
                    <Field className="custom-control-input" data-testid='comment' id="Other" type="radio" rows="4" name="comment" value="other" />
                    <label className="custom-control-label font-weight-bold" for="Other">Other:</label>
                  </div>
                  <div>
                    {formikProps.values.comment === 'other' &&
                      <>
                        <Field className="form-control" data-testid='comment' component="textarea" rows="4" name="other_comment" />
                        <div className="invalid-feedback"><ErrorMessage name="other_comment" /></div>
                      </>
                    }
                  </div>
                  <div className="invalid-feedback"><ErrorMessage name="comment" /></div>
                </div>
              </div>
            </div>}
            {formikProps.values.selectedStatus === 'reject' && <div className="row mt-4">
              <div className="col-12 col-sm-12">
                <div className="form-group mb-0">
                  <label className="font-weight-bold" htmlFor="comment">Comment <span className="text-danger">*</span></label>
                  <div>
                    <Field className="form-control" data-testid='comment' component="textarea" rows="4" name="comment" />
                  </div>
                  <div className="invalid-feedback"><ErrorMessage name="comment" /></div>
                </div>
              </div>
            </div>}
            <button type="submit" data-testid='submit' className="btn btn-block text-white cdp-btn-secondary mt-5 p-2" disabled={!formikProps.values.selectedStatus || formikProps.isSubmitting}>Save Changes</button>
          </Form>
        )}
      </Formik>
    </div>
  </Modal.Body>
</Modal>
)
}

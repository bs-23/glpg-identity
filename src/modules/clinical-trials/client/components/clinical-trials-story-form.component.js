import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import { Form, Formik, Field, ErrorMessage, FieldArray } from "formik";
import { useToasts } from 'react-toast-notifications';
import DraftEditor from '../../../core/client/components/draft-editor';
import {fetchTrialItem, getTrialItems} from './clinical-trials.actions'
import { useDispatch , useSelector} from 'react-redux';
import parse from 'html-react-parser';
import Tree from './clinical-trials-treeView.component'
import './clinical-trials-story-form.component.scss'
import axios from 'axios';

var update_clinicalTrials =  function(trial_fixed_id,story_telling) {
    const url = `/api/clinical-trials/update`;

    console.log('checking type',typeof(trial_fixed_id))
    return {
        payload: axios({
            method: 'put',
            url,
            data: [
                {
                    story_telling,
                    trial_fixed_id
                }
            ]
        }).then(out=>console.log(out))
    };
}

const StoryForm = (props) => {
    const [, setShow] = useState(false);
    const trialData = useSelector(state => state.clinicalTrialsReducer.clinialTrial_item)
    const [trials, setTrials] = useState([]);
    const { addToast } = useToasts();
    const dispatch = useDispatch();
    const [refresh, setRefresh] = useState(false);

    const handleClose = () => {
        setShow(false);
        props.changeShow(false);
    };

    const showToast = (msg, type) => {
        addToast(msg, {
            appearance: type,
            autoDismiss: true
        });
    };

    useEffect(() => {
        dispatch(fetchTrialItem(1));
    },[]);


    return (
        <Modal size="lg" centered show={props.show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title className="modal-title_small">{props.addMode ? 'Write Story' : 'Edit Story'}</Modal.Title>
            </Modal.Header>

            {props.trialIDs && props.trialIDs.length > 0 &&
                <div className="consent-manage">
                    <Formik
                        initialValues={{
                            title: props.addMode ? props.addData.title : '',
                            trials: props.addMode ? props.addData.trials : [],
                            version: props.addMode ? props.addData.version : 'v1',
                            story: props ? parse(props.story) : '',
                            story_plaintext: props ? parse(props.addData.story) : ''
                        }}
                        //validationSchema={faqSchema}
                        displayName="StoryForm"
                        onSubmit={(values, actions) => {

                            if(!refresh){
                                update_clinicalTrials(props.trialDetails.data.trial_fixed_id,values.story_plaintext);
                                setRefresh(true);
                                dispatch(getTrialItems());
                                handleClose();
                            }
                            
                            if (props.addMode) {
                                dispatch(createStoryItem(values)).then(() => {
                                    actions.resetForm();
                                    showToast('Story created successfully', 'success');
                                }).catch(error => {
                                    showToast(error.response.data, 'error');
                                }).finally(function () {
                                    handleClose();
                                    actions.setSubmitting(false);
                                });

                            } else {
                                dispatch(editStoryItem(values, props.editData.id)).then(() => {
                                    actions.resetForm();
                                    showToast('Story updated successfully', 'success');
                                }).catch(error => {
                                    showToast(error.response.data, 'error');
                                }).finally(function () {
                                    handleClose();
                                    actions.setSubmitting(false);
                                });

                            }

                        }}
                    >
                        {formikProps => (
                            <Form onSubmit={formikProps.handleSubmit}>
                                <Modal.Body className="p-4">
                                    <div className="row">
                                        <div className="col-12">
                                            {/* <div className="form-group">
                                                <label className="font-weight-bold" htmlFor='title'> Title of the Story <span className="text-danger">*</span></label>
                                                <Field className="form-control preference" type='text' name='title' id='title' />
                                                <div className="invalid-feedback"><ErrorMessage name="title" /></div>
                                            </div> */}

                                            <div className="form-group">
                                                <label className="font-weight-bold" htmlFor='topics'>Selected Clinical Trials <span className="text-danger">*</span></label>
                                                <div className= "border rounded tree-view-main">
                                                    <Tree trialDetails={props.trialDetails}/>
                                                </div>
                                            </div>
                                            

                                            <div className="form-group pt-3">
                                                <label className="font-weight-bold" htmlFor='story'>Write a Story <span className="text-danger">*</span></label>
                                                <div className="border rounded draft-editor">
                                                    <DraftEditor htmlContent={formikProps.initialValues.story} onChangeHTML={(html, { plainText, cleanupEmptyHtmlTags }) => {
                                                        formikProps.setFieldValue('story', cleanupEmptyHtmlTags(html));
                                                        formikProps.setFieldValue('story_plaintext', plainText);
                                                    }} />
                                                </div>
                                                <div className="invalid-feedback"><ErrorMessage name="story_plaintext" /></div>
                                                <div className="invalid-feedback"><ErrorMessage name="story" /></div>
                                            </div>
                                        </div>
                                    </div>
                                </Modal.Body>
                                <Modal.Footer className="border-0  pt-0 px-3">
                                    {/* {onClick={()=>{update_clinicalTrials("41d239af-2cc4-400e-b774-444177ab6ed3","checking update");}}} */}
                                    <button  type="submit" className="btn btn-block cdp-btn-secondary mt-3 text-white ">Submit</button>
                                </Modal.Footer>
                            </Form>
                        )}
                    </Formik>
                </div>
            }
        </Modal >
    )
}

export default StoryForm;

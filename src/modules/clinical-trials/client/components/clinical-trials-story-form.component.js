import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import { Form, Formik, Field, ErrorMessage, FieldArray } from "formik";
import { useToasts } from 'react-toast-notifications';
import DraftEditor from '../../../core/client/components/draft-editor';
import {getTrialItems} from './clinical-trials.actions'
import { useDispatch , useSelector} from 'react-redux';
import parse from 'html-react-parser';
import Tree from './clinical-trials-treeView.component'
import './clinical-trials-story-form.component.scss'
import axios from 'axios';

var update_stories =  function(trial_fixed_ids,story) {
    const url = `/api/clinical-trials/update-stories`;

    return {
        payload: axios({
            method: 'put',
            url,
            data: [
                {
                    trial_fixed_ids,
                    story
                }
            ]
        }).then(out=>console.log(out))
    };
}

const StoryForm = (props) => {
    const [, setShow] = useState(false);
    const detailsOfAllTrials = useSelector(state => state.clinicalTrialsReducer.clinialTrial_items.data.search_result)
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

    var getSelectedTrialDetails =  function() {
        const url = `/api/clinical-trials-cdp/${props.selectedTrials}`;
    
        return {
            payload: axios({
                method: 'get',
                url
            }).then(out=>{
                setSelectedTrialDetails(out);
            })
        };
    }
    const [selectedTrialDetails, setSelectedTrialDetails] = useState({data:{data:[]}});
    useEffect(()=>{
        getSelectedTrialDetails();
    },[]);

    return (
        <Modal size="lg" centered show={props.show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title className="modal-title_small">{props.addMode ? 'Write Story' : 'Edit Story'}</Modal.Title>
            </Modal.Header>

            {props.selectedTrials && props.selectedTrials.length > 0 &&
                <div className="consent-manage">
                    <Formik
                        initialValues={{
                            trials: props.addMode ? props.addData.trials : [],
                            version: props.addMode ? props.addData.version : 'v1',
                            story: props ? parse(props.story) : '',
                            story_plaintext: props ? parse(props.addData.story) : ''
                        }}
                        //validationSchema={faqSchema}
                        displayName="StoryForm"
                        onSubmit={(values, actions) => {

                            if(!refresh){
                                update_stories(props.selectedTrials,values.story_plaintext);
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
                                                    <Tree trialDetails={props.trialDetails} multipleTrialDetails={selectedTrialDetails.data}/>
                                                    {/* {selectedTrialDetails.data}   {detailsOfAllTrials.filter(item=> props.selectedTrials.includes(item.trial_fixed_id))}/> */}
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

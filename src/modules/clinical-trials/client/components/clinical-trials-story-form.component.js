import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import { Form, Formik, Field, ErrorMessage, FieldArray } from "formik";
import { useToasts } from 'react-toast-notifications';
import { faqSchema } from './faq.schema';
import DraftEditor from '../../../core/client/components/draft-editor';
//import { createFaqItem, editFaqItem } from './faq.actions';
import { useDispatch } from 'react-redux';
import parse from 'html-react-parser';

const StoryForm = (props) => {
    const [, setShow] = useState(false);
    //const [topics, setTopics] = useState([]);
    const [trials, setTrials] = useState([]);
    const { addToast } = useToasts();
    const dispatch = useDispatch();
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

    // useEffect(() => {
    //     const faqTopics = faqMapping(props.serviceTopics)
    //     setTopics(faqTopics);
    // }, [props.serviceTopics]);


    // const faqMapping = (allTopics) => {
    //     const faqWithTopics = [];

    //     const parentCategories = [...new Set(Object.values(allTopics).map((item) => item.category))];

    //     parentCategories.forEach(element => {
    //         const subcategories = allTopics.filter(x => x.category === element);
    //         subcategories.forEach(item => {
    //             delete item.category;
    //         });
    //         faqWithTopics.push({
    //             category: element,
    //             subcategories: subcategories
    //         });
    //     });
    //     return faqWithTopics;
    // }

    return (
        <Modal size="lg" centered show={props.show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title className="modal-title_small">{props.addMode ? 'Add a new Story for clinical trials' : 'Edit Story'}</Modal.Title>
            </Modal.Header>

            {props.trialIDs && props.trialIDs.length > 0 &&
                <div className="consent-manage">
                    <Formik
                        initialValues={{
                            title: props.addMode ? props.addData.title : '',
                            trials: props.addMode ? props.addData.trials : [],
                            version: props.addMode ? props.addData.version : 'v1',
                            story: props.addMode ? parse(props.addData.story) : '',
                            story_plaintext: props.addMode ? parse(props.addData.answer) : ''
                        }}
                        validationSchema={faqSchema}
                        displayName="StoryForm"
                        onSubmit={(values, actions) => {
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
                                            <div className="form-group">
                                                <label className="font-weight-bold" htmlFor='title'> Titel of the Story <span className="text-danger">*</span></label>
                                                <Field className="form-control preference" type='text' name='title' id='title' />
                                                <div className="invalid-feedback"><ErrorMessage name="title" /></div>
                                            </div>

                                            <div className="form-group">
                                                <label className="font-weight-bold" htmlFor='topics'>Selected Clinical Trials <span className="text-danger">*</span></label>

                                                {/* <FieldArray
                                                    name="topics"
                                                    render={arrayHelpers => (
                                                        <div className="row">
                                                            {topics.map((category, index) =>
                                                                <div className="mb-3 col-12 col-sm-6" key={index}>{
                                                                    <React.Fragment>
                                                                        <span className="cdp-text-primary pb-2 font-weight-bold">
                                                                            {category.category === 'general' ? "General" :
                                                                                category.category === 'information' ? "Information Management" :
                                                                                    category.category === 'cdp' ? "Management of Customer Data Platform" :
                                                                                        "Data Privacy & Consent Management"
                                                                            }
                                                                        </span>
                                                                        {category.subcategories.map((topic, id) => (
                                                                            <div className="custom-control custom-checkbox" key={id}>
                                                                                <label key={topic.title}></label>
                                                                                <input
                                                                                    name="topics"
                                                                                    type="checkbox"
                                                                                    className="custom-control-input"
                                                                                    value={topic.title}
                                                                                    id={topic.title}
                                                                                    checked={arrayHelpers.form.values.topics.includes(topic.slug)}
                                                                                    onChange={e => {
                                                                                        if (e.target.checked) {
                                                                                            arrayHelpers.push(topic.slug);
                                                                                        } else {
                                                                                            const idx = arrayHelpers.form.values.topics.indexOf(topic.slug);
                                                                                            arrayHelpers.remove(idx);
                                                                                        }
                                                                                    }}
                                                                                />
                                                                                <label for={topic.title} className="custom-control-label">{topic.title}</label>
                                                                            </div>
                                                                        ))}</React.Fragment>
                                                                }</div>)}
                                                            <div className="invalid-feedback col-12"><ErrorMessage name="topics" /></div>
                                                        </div>
                                                    )} /> */}
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
                                    {/*<button type="button" className="btn cdp-btn-secondary text-white shadow-sm" onClick={handleClose}>Close</button>*/}
                                    <button type="submit" className="btn btn-block cdp-btn-secondary mt-3 text-white ">Submit</button>
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

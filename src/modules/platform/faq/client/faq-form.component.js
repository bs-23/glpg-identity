import React, { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { Form, Formik, Field, ErrorMessage, FieldArray } from "formik";
import { useToasts } from 'react-toast-notifications';
import { faqSchema } from './faq.schema';
import DraftEditor from '../../../core/client/components/draft-editor';
import { createFaqItem, editFaqItem } from './faq.actions';
import { useDispatch } from 'react-redux';

const FaqForm = (props) => {
    const [, setShow] = useState(false);
    const { addToast } = useToasts();
    const dispatch = useDispatch();
    const handleClose = () => {
        setShow(false);
        props.changeShow(false);
    };

    const FormFieldFluid = ({ label, name, type, children, required = true, ...rest }) =>
        <div className="form-group">
            <label className="font-weight-bold" htmlFor="last_name">{label}{required && <span className="text-danger"> *</span>}</label>
            {children || <Field className="form-control" type={type} name={name} {...rest} />}
            <div className="invalid-feedback"><ErrorMessage name={name} /></div>
        </div>


    const ToggleList = ({ name, options, labelExtractor, idExtractor, allOptionID }) => {
        const isChecked = (id, arrayHelpers) => arrayHelpers.form.values[name].includes(id);

        const handleChange = (e, arrayHelpers) => {
            const optionId = e.target.value;
            if (e.target.checked) {
                if (allOptionID && (optionId === allOptionID)) {
                    arrayHelpers.form.setFieldValue(name, options.map(op => idExtractor(op)));
                } else {
                    if (arrayHelpers.form.values[name].includes(allOptionID)) {
                        const idx = arrayHelpers.form.values[name].indexOf(allOptionID);
                        arrayHelpers.remove(idx);
                    }
                    arrayHelpers.push(optionId);
                };
            } else {
                if (allOptionID && (optionId === allOptionID)) {
                    arrayHelpers.form.setFieldValue(name, []);
                } else {
                    let filteredOptionIds = arrayHelpers.form.values[name].filter(id => id !== allOptionID).filter(id => id !== optionId);
                    arrayHelpers.form.setFieldValue(name, filteredOptionIds);
                }
            }
        }

        const allOptionsObject = options.find(op => idExtractor(op) === allOptionID);

        if (allOptionsObject) {
            options = options.filter(op => idExtractor(op) !== allOptionID);
            options.unshift(allOptionsObject);
        }



        return <FieldArray
            name={name}
            render={arrayHelpers => (
                options.map(item => <label key={idExtractor(item)} className="row align-items-center">
                    <span className="switch-label text-left col-9 col-sm-6">{labelExtractor(item)}</span>
                    <span className="col-3 col-sm-6">
                        <span className="switch">
                            <input name={name}
                                className="custom-control-input"
                                type="checkbox"
                                value={idExtractor(item)}
                                id={idExtractor(item)}
                                checked={isChecked(idExtractor(item), arrayHelpers)}
                                onChange={(e) => handleChange(e, arrayHelpers)}
                                disabled={item.hasOwnProperty('disabled') ? item.disabled : false}
                            />
                            <span className="slider round"></span>
                        </span>
                    </span>
                </label>)
            )}
        />
    }

    const showToast = (msg, type) => {
        addToast(msg, {
            appearance: type,
            autoDismiss: true
        });
    };

    const convertSlugToId = (arr) => {
        const convertArray = [];
        arr.forEach(element => {
            convertArray.push(props.serviceCategory.find(x => x.slug === element).id);
        });
        return convertArray;

    }

    const sortArrayWithTitle = (array) => {
        const catgory_title_list = [];
        array.forEach(element => {
            catgory_title_list.push(props.serviceCategory.find(x => x.id === element).title);
        });

        catgory_title_list.sort();

        const catgory_slug_list = [];

        catgory_title_list.forEach(element => {
            catgory_slug_list.push(props.serviceCategory.find(x => x.title === element).slug);
        });

        return catgory_slug_list;
    }

    return (
        <Modal size="lg" centered show={props.show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title className="modal-title_small">{props.editMode ? 'Edit FAQ' : 'Add New FAQ'}</Modal.Title>
            </Modal.Header>

            {props.serviceCategory.length > 0 && props.serviceCategory.length > 0 &&
                <div className="consent-manage">
                    <Formik
                        initialValues={{
                            question: props.editMode ? props.editData.question : '',
                            categories: props.editMode ? convertSlugToId(props.editData.categories) : [],
                            answer: props.editMode ? props.editData.answer : '',
                            answer_plaintext: props.editMode ? props.editData.answer : ''
                        }}
                        validationSchema={faqSchema}
                        displayName="FaqForm"
                        onSubmit={(values, actions) => {
                            values.categories = sortArrayWithTitle(values.categories);

                            if (props.editMode) {
                                dispatch(editFaqItem(values, props.editData.id)).then(() => {
                                    actions.resetForm();
                                    showToast('FAQ updated successfully', 'success');
                                }).catch(error => {
                                    showToast(error.response.data, 'error');
                                }).finally(function () {
                                    handleClose();
                                    actions.setSubmitting(false);
                                });

                            } else {
                                dispatch(createFaqItem(values)).then(() => {
                                    actions.resetForm();
                                    showToast('FAQ created successfully', 'success');
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
                                                <label className="font-weight-bold" htmlFor='question'> Question <span className="text-danger">*</span></label>
                                                <Field className="form-control preference" type='text' name='question' id='question' />
                                                <div className="invalid-feedback"><ErrorMessage name="question" /></div>
                                            </div>
                                            <FormFieldFluid label="Select Categories" name="categories" required={true} >
                                                <ToggleList
                                                    name="categories"
                                                    options={props.serviceCategory}
                                                    idExtractor={item => item.id}
                                                    labelExtractor={item => item.title}
                                                />

                                            </FormFieldFluid>
                                            <div className="form-group pt-3">
                                                <label className="font-weight-bold" htmlFor='answer'>Answer <span className="text-danger">*</span></label>
                                                <div className="border rounded draft-editor">
                                                    <DraftEditor htmlContent={formikProps.initialValues.answer} onChangeHTML={(html, {plainText, cleanupEmptyHtmlTags}) => {
                                                        formikProps.setFieldValue('answer', cleanupEmptyHtmlTags(html));
                                                        formikProps.setFieldValue('answer_plaintext', plainText);
                                                    }} />
                                                </div>
                                                <div className="invalid-feedback"><ErrorMessage name="answer_plaintext" /></div>
                                                <div className="invalid-feedback"><ErrorMessage name="answer" /></div>
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

export default FaqForm;

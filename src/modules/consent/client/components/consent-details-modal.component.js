import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import parse from 'html-react-parser';

const ConsentDetailsModal = ({ lgShow, setLgShow, consent }) => (
    <Modal
        size="lg"
        centered
        show={lgShow}
        onHide={() => setLgShow(false)}
        aria-labelledby="example-modal-sizes-title-lg"
    >
        <Modal.Header closeButton>
            <Modal.Title id="example-modal-sizes-title-lg">
                Consent detail
        </Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <div className="px-4 py-3">
                <div className="row">
                    <div className="col">
                        <h4 className="mt-1 font-weight-bold">Consent Title</h4>
                        <div className="">{consent.title}</div>
                    </div>
                </div>
                <div className="row mt-3">
                    <div className="col-6">
                        <div className="mt-1 font-weight-bold">Consent Type</div>
                        <div className="">{consent.consent_category ? consent.consent_category.title : ''}</div>
                    </div>
                    <div className="col-6">
                        <div className="mt-1 font-weight-bold">Preference</div>
                        <div className="">{consent.preference}</div>
                    </div>
                </div>
                <div className="row mt-3">
                    <div className="col-6">
                        <div className="mt-1 font-weight-bold">Status</div>
                        <div className="">{consent.is_active ? 'Active' : 'Inactive'}</div>
                    </div>
                    <div className="col-6">
                        <div className="mt-1 font-weight-bold">Created By</div>
                        <div className="">{consent.createdByUser ? `${consent.createdByUser.first_name} ${consent.createdByUser.last_name}` : ''}</div>
                    </div>
                </div>
                <div className="row mt-3">
                    <div className="col-6">
                        <div className="mt-1 font-weight-bold">Ctreated Date</div>
                        <div className="">{(new Date(consent.created_at)).toLocaleDateString('en-GB').replace(/\//g, '.')}</div>
                    </div>
                </div>
                <div className="row mt-4">
                    <div className="col accordion-consent rounded shadow-sm p-0">
                        <h4 className="accordion-consent__header p-3 font-weight-bold mb-0 cdp-light-bg">Available Translation	</h4>
                        {consent.translations && consent.translations.length > 0 ? consent.translations.map((translation, index) => (
                            <Accordion defaultActiveKey="0" key={index}>
                                <Card>
                                    <Card.Header>
                                        <Accordion.Toggle as={Card.Header} variant="link" eventKey="0">
                                            {translation.locale.toUpperCase()}
                                        </Accordion.Toggle>
                                    </Card.Header>
                                    <Accordion.Collapse eventKey="0">
                                        <Card.Body><div>{parse(translation.rich_text)}</div></Card.Body>
                                    </Accordion.Collapse>
                                </Card>
                            </Accordion>
                        )) : 'There are no translations'}
                    </div>
                </div>
            </div>
        </Modal.Body>
    </Modal>
)

export default ConsentDetailsModal;
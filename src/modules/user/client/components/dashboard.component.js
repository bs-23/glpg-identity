import React from 'react';
import { NavLink } from 'react-router-dom';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import "./dashboard.scss";

export default function Dashboard() {
    return (
        <main className="app__content">
            <div className="container-fluid">
                <div className="row h-100">
                    <div className="col-12 col-sm-8 col-md-9">
                        <h2 className="mt-5">
                           Category of Services
                        </h2>
                        <div>
                            <div className="d-flex flex-wrap">
                                <NavLink to="/hcps" className="p-5 border shadow-sm m-2 h4 pb-0 mb-0">
                                    Information Management
                                </NavLink>
                                <NavLink to="" className="p-5 border shadow-sm m-2 h4 pb-0 mb-0 text-muted text-decoration-none">
                                    Marketing & Promotion Management
                                </NavLink>
                                <NavLink to="/users" className="p-5 border shadow-sm m-2 h4 pb-0 mb-0">
                                    User Management
                                </NavLink>
                                <NavLink to="" className="p-5 border shadow-sm m-2 h4 pb-0 mb-0 text-muted text-decoration-none">
                                    Sample Request Management
                                </NavLink>
                                <NavLink to="" className="p-5 border shadow-sm m-2 h4 pb-0 mb-0 text-muted text-decoration-none">
                                    Tag & Persona Management
                                </NavLink>
                               
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-sm-4 col-md-3 p-3 ">
                        {/*<h4>FAQ</h4>
                        <Accordion defaultActiveKey="0">
                            <Card>
                                <Accordion.Toggle as={Card.Header} eventKey="0" className="text-primary" role="button">
                                What is the meaning of Lorem ipsum?
                            </Accordion.Toggle>
                            <Accordion.Collapse eventKey="0">
                                <Card.Body>Literally it does not mean anything. It is a sequence of words without a sense of Latin derivation that make up a text also known as filler text, fictitious, blind or placeholder</Card.Body>
                            </Accordion.Collapse>
                            </Card>
                            <Card>
                                <Accordion.Toggle as={Card.Header} eventKey="1" className="text-primary" role="button">
                                Why is Lorem Ipsum Dolor used?
                            </Accordion.Toggle>
                            <Accordion.Collapse eventKey="1">
                                <Card.Body>The Lorem Ipsum text is used to fill spaces designated to host texts that have not yet been published. They use programmers, graphic designers, typographers to get a real impression of the digital / advertising / editorial product they are working on.</Card.Body>
                            </Accordion.Collapse>
                            </Card>
                            <Card>
                                <Accordion.Toggle as={Card.Header} eventKey="2" className="text-primary" role="button">
                                    What is the most used version?
                                </Accordion.Toggle>
                                <Accordion.Collapse eventKey="2">
                                    <Card.Body>The Lorem Ipsum text is used to fill spaces designated to host texts that have not yet been published. They use programmers, graphic designers, typographers to get a real impression of the digital / advertising / editorial product they are working on.</Card.Body>
                                </Accordion.Collapse>
                            </Card>
                            <Card>
                                <Accordion.Toggle as={Card.Header} eventKey="3" className="text-primary" role="button">
                                    What are the origins of Lorem Ipsum Dolor Sit?
                                </Accordion.Toggle>
                                <Accordion.Collapse eventKey="3">
                                    <Card.Body>The Lorem Ipsum text is used to fill spaces designated to host texts that have not yet been published. They use programmers, graphic designers, typographers to get a real impression of the digital / advertising / editorial product they are working on.</Card.Body>
                                </Accordion.Collapse>
                            </Card>
                        </Accordion>*/}
                    </div>
                </div>
            </div>
        </main>
    );
}

import React from 'react';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';

const Faq = () => {
    return (
        <React.Fragment>
            <h4>FAQ</h4>
            <Accordion defaultActiveKey="0">
                <Card>
                    <Accordion.Toggle as={Card.Header} eventKey="0" className="text-primary d-flex align-items-baseline justify-content-between" role="button">
                        What is the meaning of Lorem ipsum?
                        <i className="fas fa-caret-down ml-2"></i>    
                    </Accordion.Toggle>
                    <Accordion.Collapse eventKey="0">
                        <Card.Body>Literally it does not mean anything. It is a sequence of words without a sense of Latin derivation that make up a text also known as filler text, fictitious, blind or placeholder</Card.Body>
                    </Accordion.Collapse>
                </Card>
                <Card>
                    <Accordion.Toggle as={Card.Header} eventKey="1" className="text-primary d-flex align-items-baseline justify-content-between" role="button">
                        Why is Lorem Ipsum Dolor used?
                        <i className="fas fa-caret-down ml-2"></i>        
                    </Accordion.Toggle>
                    <Accordion.Collapse eventKey="1">
                        <Card.Body>The Lorem Ipsum text is used to fill spaces designated to host texts that have not yet been published. They use programmers, graphic designers, typographers to get a real impression of the digital / advertising / editorial product they are working on.</Card.Body>
                    </Accordion.Collapse>
                </Card>
                <Card>
                    <Accordion.Toggle as={Card.Header} eventKey="2" className="text-primary d-flex align-items-baseline justify-content-between" role="button">
                        What is the most used version?
                        <i className="fas fa-caret-down ml-2"></i>    
                    </Accordion.Toggle>
                    <Accordion.Collapse eventKey="2">
                        <Card.Body>The Lorem Ipsum text is used to fill spaces designated to host texts that have not yet been published. They use programmers, graphic designers, typographers to get a real impression of the digital / advertising / editorial product they are working on.</Card.Body>
                    </Accordion.Collapse>
                </Card>
                <Card>
                    <Accordion.Toggle as={Card.Header} eventKey="3" className="text-primary d-flex align-items-baseline justify-content-between" role="button">
                        What are the origins of Lorem Ipsum Dolor Sit?
                        <i className="fas fa-caret-down ml-2"></i>    
                    </Accordion.Toggle>
                    <Accordion.Collapse eventKey="3">
                        <Card.Body>The Lorem Ipsum text is used to fill spaces designated to host texts that have not yet been published. They use programmers, graphic designers, typographers to get a real impression of the digital / advertising / editorial product they are working on.</Card.Body>
                    </Accordion.Collapse>
                </Card>
            </Accordion> 
        </React.Fragment>
    );
}
 
export default Faq;

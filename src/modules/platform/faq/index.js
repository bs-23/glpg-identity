import React from 'react';
import Routes from './client/faq.routes';
import faqReducer from './client/faq.reducer';

export function FaqClientRoutes(props) {
    return <Routes path={props.path}/>;
}

export { faqReducer };

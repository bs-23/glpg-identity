import React from 'react';
import ClientRoutes from './client/faq.routes';
import faqReducer from './client/faq.reducer';

export function FaqClientRoutes(props) {
    return <ClientRoutes path={props.path}/>;
}

export { faqReducer };

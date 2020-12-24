import React from 'react';
import ClientRoutes from './client/faq.routes';
import faqReducer from './client/faq.reducer';
import Faq from './client/faq.component';
import ManageFaq from './client/manage-faq.component';

export function FaqClientRoutes(props) {
    return <ClientRoutes path={props.path} />;
}

export {
    faqReducer,
    Faq,
    ManageFaq
};

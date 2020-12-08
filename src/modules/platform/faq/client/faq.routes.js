import React from 'react';
import ManageFaq from './manage-faq.component';
import PrivateRoute from '../../../core/client/PrivateRoute';

export default function FaqReactRoutes(props) {
    return (
        <PrivateRoute path={`${props.path}/manage-faq`} component={ManageFaq} module={'platform'}/>
    );
}

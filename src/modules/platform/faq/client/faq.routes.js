import React from 'react';
import { Switch } from 'react-router-dom';
import ManageFaq from './manage-faq.component';
import FaqCategory from './faq-category.component';
import PrivateRoute from '../../../core/client/PrivateRoute';

export default function FaqRoutes(props) {
    return (
        <Switch>
            <PrivateRoute exact path={`${props.path}/manage-faq`} component={ManageFaq} module={'platform'} />
            <PrivateRoute exact path={`${props.path}/faq-categories`} component={FaqCategory} module={'platform'} />
        </Switch>
    );
}

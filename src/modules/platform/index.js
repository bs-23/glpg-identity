import React from 'react';
import { Switch } from 'react-router-dom';
import { FaqClientRoutes, faqReducer } from './faq';
import PrivateRoute from '../core/client/PrivateRoute';
import UserManagement from '../user/client/components/user-management.component';

export function PlatformRoutes() {
    const path = '/platform-management';

    return (
        <Switch>
            <PrivateRoute exact path={path} component={UserManagement} module={'platform'} />
            <FaqClientRoutes path={path}/>
        </Switch>
    );
}

export { faqReducer };

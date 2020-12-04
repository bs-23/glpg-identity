import React from 'react';
import { Switch, useRouteMatch } from 'react-router-dom';
import { FaqClientRoutes, faqReducer } from './faq';

export function PlatformRoutes() {
    const { path } = useRouteMatch();

    return (
        <Switch>
            <FaqClientRoutes path={path}/>
        </Switch>
    );
}

export { faqReducer };

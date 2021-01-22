import React from 'react';
import ClientRoutes from './client/category.routes';
import ConsentCategories from './client/categories.component';
import categoryReducer from './client/category.reducer';
import * as categoryActions from './client/category.actions';

export function ManageConsentCategoryRoutes(props) {
    return <ClientRoutes path={props.path} />;
}

export {
    categoryReducer,
    categoryActions,
    ConsentCategories
};

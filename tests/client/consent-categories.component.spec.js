import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { Provider } from 'react-redux';
import axios from 'axios'
import { BrowserRouter } from 'react-router-dom';
import MockAdapter from 'axios-mock-adapter'
import { ToastProvider } from 'react-toast-notifications';
import store from '../../src/modules/core/client/store.js';
import ConsentCategories from '../../src/modules/consent/client/consent-category/categories.component';
import { getConsentCategories } from '../../src/modules/consent/client/consent-category/category.actions';
import { act } from 'react-dom/test-utils';
import { screen } from '@testing-library/dom'
import { login } from '../../src/modules/platform/user/client/user.actions';

configure({ adapter: new Adapter() });

describe('Consent categories component', () => {
    let mockAxios;
    let savedUser;
    let consent_categories;

    beforeEach( async () => {
        mockAxios = new MockAdapter(axios);

        savedUser = {
            "applications": [],
            "countries": [],
            "email": "test@gmail.com",
            "name": "a",
            "serviceCategories": []
        };
        mockAxios.onPost('/api/login').reply(200, savedUser);

        await store.dispatch(login({
            email: 'test@gmail.com',
            password: 'test'
        }));

        consent_categories = [{
            "id": "1",
            "title": "a",
            "slug": "a",
            "created_at": "2020-12-17T19:10:50.695Z",
            "updated_at": "2020-12-17T19:10:50.695Z",
            "createdBy": "a"
        }]
        mockAxios.onGet('/api/privacy/consent-categories').reply(200, consent_categories);

        await store.dispatch(getConsentCategories());
    });

    const userSlice = () => store.getState().userReducer;

    const wrapperComponent = () => (
        <BrowserRouter>
            <ToastProvider>
                <Provider store={store}>
                    <ConsentCategories/>
                </Provider>
            </ToastProvider>
        </BrowserRouter>
    );

    it('Should render the search hcp professional component', () => {
        const wrapper = shallow(wrapperComponent());
        expect(wrapper.exists()).toBe(true);
    });

    it('should set user', async () => {
        expect(userSlice().loggedInUser).toEqual(savedUser);
    });

    it('should exist some texts', async () => {
        render(wrapperComponent());

        await waitFor(async () => {
            expect(screen.getByText('Create new category')).toBeTruthy();
            expect(screen.getByText('Title')).toBeTruthy();
            expect(screen.getByText('Slug')).toBeTruthy();
            expect(screen.getByText('Created By')).toBeTruthy();
            expect(screen.getByText('Created Date')).toBeTruthy();
            expect(screen.getByText('Action')).toBeTruthy();
        });
    });
});

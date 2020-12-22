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
import ConsentsComponent from '../../src/modules/consent/client/components/consents.component';
import { act } from 'react-dom/test-utils';
import { screen } from '@testing-library/dom'
import { login } from '../../src/modules/platform/user/client/user.actions';
import { getCdpConsents } from '../../src/modules/consent/client/consent.actions';

configure({ adapter: new Adapter() });

describe('Manage consents component', () => {
    let mockAxios;
    let savedUser;
    let consents;

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

        consents = [
            {
                "id": "1",
                "preference": "a",
                "slug": "a",
                "legal_basis": "a",
                "is_active": true,
                "created_at": "2020-12-17T19:10:50.703Z",
                "updated_at": "2020-12-17T19:10:50.703Z",
                "consent_category": {
                    "id": "1",
                    "title": "a",
                    "slug": "a"
                },
                "createdBy": "a",
                "updatedBy": "a",
                "translations": [
                    {
                        "id": "1",
                        "locale": "a",
                        "rich_text": "<p>a</p>"
                    }
                ]
            }
        ]
        mockAxios.onGet('/api/cdp-consents?translations=true&category=true').reply(200, consents);

        await store.dispatch(getCdpConsents(true, true))
    });

    const userSlice = () => store.getState().userReducer;

    const wrapperComponent = () => (
        <BrowserRouter>
            <ToastProvider>
                <Provider store={store}>
                    <ConsentsComponent/>
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

    it('should check some existing texts', async () => {
        render(wrapperComponent());
        // expect(screen.getByText('CDP Consents')).toBeTruthy();
        expect(screen.getByText('Create new consent')).toBeTruthy();
        expect(screen.getByText('Preference')).toBeTruthy();
        expect(screen.getByText('Available Localizations')).toBeTruthy();
        expect(screen.getByText('Consent Type')).toBeTruthy();
        expect(screen.getByText('Status')).toBeTruthy();
        expect(screen.getByText('Created By')).toBeTruthy();
        expect(screen.getByText('Created On')).toBeTruthy();
        expect(screen.getByText('Action')).toBeTruthy();
    });
});

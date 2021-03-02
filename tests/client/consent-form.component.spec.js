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
import { ConsentForm } from '../../src/modules/privacy/';
import { act } from 'react-dom/test-utils';
import { screen } from '@testing-library/dom'
import { login } from '../../src/modules/platform/user/client/user.actions';

configure({ adapter: new Adapter() });

jest.setTimeout(20000);

describe('Consent form component', () => {
    let mockAxios;
    let savedUser;
    let consent_categories;
    let consent;
    jest.useFakeTimers();

    beforeEach( async () => {
        mockAxios = new MockAdapter(axios);

        savedUser = {
            "applications": [],
            "countries": [],
            "email": "test@gmail.com",
            "name": "a",
            "serviceCategories": [],
            "services": []
        };
        mockAxios.onPost('/api/login').reply(200, savedUser);

        await store.dispatch(login({
            email: 'test@gmail.com',
            password: 'test'
        }));

        await store.dispatch(
            {
                type: 'GET_COUNTRIES',
                payload: Promise.resolve({
                    data: [
                        {
                            codbase: "WUK",
                            codbase_desc: "Ireland",
                            country_iso2: "IE",
                            country_iso3: "IRL",
                            countryid: 1,
                            countryname: "Ireland"
                        }
                    ]
                })
            }
        );

        await store.dispatch(
            {
                type: 'GET_ALL_COUNTRIES',
                payload: Promise.resolve({
                    data: [
                        {
                            codbase: "WUK",
                            codbase_desc: "Ireland",
                            country_iso2: "IE",
                            country_iso3: "IRL",
                            countryid: 1,
                            countryname: "Ireland"
                        }
                    ]
                })
            }
        );

        consent_categories = [{
            "id": "1",
            "title": "a",
            "slug": "a",
            "created_at": "2020-12-17T19:10:50.695Z",
            "updated_at": "2020-12-17T19:10:50.695Z",
            "createdBy": "a"
        }]
        mockAxios.onGet('/api/privacy/consent-categories').reply(200, consent_categories);

        consent = {
            "id": "1",
            "preference": "a",
            "slug": "a",
            "legal_basis": "consent",
            "is_active": true,
            "created_at": "2020-12-17T19:10:50.703Z",
            "updated_at": "2020-12-17T19:10:50.703Z",
            "consent_category": {
                "id": "1",
                "title": "a",
                "slug": "a"
            },
            "countries": [
                {
                    "id": "1",
                    "consent_id": "1",
                    "country_iso2": "be",
                    "opt_type": "single-opt-in",
                    "created_at": "2020-12-17T19:10:50.718Z",
                    "updated_at": "2020-12-17T19:10:50.718Z"
                }
            ],
            "createdBy": "a",
            "updatedBy": "a",
            "translations": []
        }
        mockAxios.onGet('/api/cdp-consents/1').reply(200, consent);
    });

    const userSlice = () => store.getState().userReducer;

    const wrapperComponent = () => (
        <BrowserRouter>
            <ToastProvider>
                <Provider store={store}>
                    <ConsentForm/>
                </Provider>
            </ToastProvider>
        </BrowserRouter>
    );

    const wrapperComponentWithProps = () => (
        <BrowserRouter>
            <ToastProvider>
                <Provider store={store}>
                    <ConsentForm match={{ params: { id : 1 }}}/>
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
            expect(screen.getByText('Create New Consent')).toBeTruthy();
            expect(screen.getByText('Preference')).toBeTruthy();
            expect(screen.getByText('Category')).toBeTruthy();
            expect(screen.getByText('Legal Basis')).toBeTruthy();
            expect(screen.getByText('Active Status')).toBeTruthy();

            const addLocalization = screen.getByText('Add Localizations');
            expect(addLocalization).toBeTruthy();

            await waitFor(() => {
                fireEvent.click(addLocalization);
            });

            expect(screen.getByText('Rich Text')).toBeTruthy();
        });
    });

    it('should render with props', async () => {
        const { container } = render(wrapperComponentWithProps());
        await waitFor(() => {
            expect(container).toBeTruthy();
        });
    });
});

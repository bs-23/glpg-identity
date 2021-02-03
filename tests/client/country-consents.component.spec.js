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
import { CountryConsent } from '../../src/modules/privacy';
import { act } from 'react-dom/test-utils';
import { screen } from '@testing-library/dom'
import { login } from '../../src/modules/platform/user/client/user.actions';

configure({ adapter: new Adapter() });

describe('Country consents component', () => {
    let mockAxios;
    let savedUser;
    // let consent_categories;
    let cdp_consents;
    let country_consents;

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

        cdp_consents = [
            {
                "id": "01cfab4f-9fdd-4975-9a90-bbde78785109",
                "preference": "Galapagos E-Mail Newsletter",
                "slug": "galapagos-email-newsletter-9c390768",
                "legal_basis": "consent",
                "is_active": true,
                "created_at": "2020-12-17T19:10:50.703Z",
                "updated_at": "2020-12-17T19:10:50.703Z",
                "createdBy": "System Admin",
                "updatedBy": "System Admin"
            }
        ]
        mockAxios.onGet('/api/cdp-consents').reply(200, cdp_consents);

        country_consents = [{
            "id": "ca90d517-35ee-4de0-b01d-16e9f0a237a9",
            "consent_id": "ebea072a-81d4-4507-a46b-cb365ea0c6db",
            "country_iso2": "IE",
            "opt_type": "single-opt-in",
            "created_at": "2020-12-17T19:10:50.718Z",
            "updated_at": "2020-12-17T19:10:50.718Z",
            "consent": {
                "id": "ebea072a-81d4-4507-a46b-cb365ea0c6db",
                "category_id": "59953d51-2449-4b65-950f-9f88654019bb",
                "preference": "Galapagos Terms of Use",
                "slug": "galapagos-terms-of-use-9d43f336",
                "legal_basis": "consent",
                "is_active": true,
                "created_by": "24d6ce90-7106-4176-87d5-210a2195af0c",
                "updated_by": "24d6ce90-7106-4176-87d5-210a2195af0c",
                "translations": [
                    {
                        "id": "538fc5a7-c86c-4a18-89d6-8a79601af42e",
                        "locale": "fr_BE",
                        "rich_text": "<p>a</p>"
                    }
                ]
            }
        }];

        mockAxios.onGet('/api/consent/country/').reply(200, country_consents)
    });

    const userSlice = () => store.getState().userReducer;

    const wrapperComponent = () => (
        <BrowserRouter>
            <ToastProvider>
                <Provider store={store}>
                    <CountryConsent/>
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

        expect(screen.getByText('Assign consent to country')).toBeTruthy();
    });
});

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
import { CDPConsentPermanceReport } from '../../src/modules/privacy/';
import { act } from 'react-dom/test-utils';
import { screen } from '@testing-library/dom'
import { login } from '../../src/modules/platform/user/client/user.actions';

configure({ adapter: new Adapter() });

describe('Cdp consent performance report component', () => {
    let mockAxios;
    let savedUser;
    let consent_report;
    jest.useFakeTimers();

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

        consent_report = {
            "data": {
                "hcp_consents": [
                    {
                        "consent_id": "ebea072a-81d4-4507-a46b-cb365ea0c6db",
                        "opt_type": "single-opt-in",
                        "consent_confirmed": true,
                        "updated_at": "2020-12-18T08:53:16.887Z",
                        "hcp_profile": {
                            "id": "a00c9d13-909c-49ed-96ee-21e201f8c992",
                            "application_id": "a7959308-7ec5-4090-94ff-2367113a454d",
                            "uuid": "19058207801",
                            "individual_id_onekey": "WNLN00027139",
                            "salutation": "Mr",
                            "first_name": "J.E.",
                            "last_name": "López Matta",
                            "email": "brandxqa+validnl@gmail.com",
                            "telephone": "0715265018",
                            "birthdate": null,
                            "country_iso2": "nl",
                            "language_code": "nl",
                            "locale": "nl_NL",
                            "specialty_onekey": "SP.WNL.77",
                            "status": "self_verified",
                            "is_email_verified": false,
                            "failed_auth_attempt": 0,
                            "password_updated_at": "2020-12-18T08:53:36.830Z",
                            "reset_password_token": null,
                            "reset_password_expires": null,
                            "origin_url": "https://www-dev.jyseleca.nl",
                            "created_at": "2020-12-18T08:53:16.867Z",
                            "updated_at": "2020-12-18T08:53:36.859Z"
                        },
                        "legal_basis": "consent",
                        "given_date": "2020-12-18T08:53:16.887Z",
                        "preference": "Galapagos Terms of Use",
                        "category": "General Consent",
                        "type": "general-consent"
                    }
                ],
                "page": 1,
                "limit": 30,
                "total": 1,
                "start": 1,
                "end": 1,
                "codbase": "",
                "opt_type": "",
                "countries": ["BE","FR","DE","IT","NL","ES","GB"],
                "orderBy": "",
                "orderType": ""
            },
            "errors":[]
        }

        mockAxios.onGet('/api/cdp-consent-performance-report').reply(200, consent_report);
    });

    const userSlice = () => store.getState().userReducer;

    const wrapperComponent = () => (
        <BrowserRouter>
            <ToastProvider>
                <Provider store={store}>
                    <CDPConsentPermanceReport/>
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
            expect(screen.getByText('Customer Data Platform')).toBeTruthy();
            expect(screen.getByText('Filter by Country')).toBeTruthy();
            expect(screen.getByText('Filter by Opt Type')).toBeTruthy();
            expect(screen.getByText('First Name')).toBeTruthy();
            expect(screen.getByText('Last Name')).toBeTruthy();
            expect(screen.getByText('Email')).toBeTruthy();
            expect(screen.getByText('Consent Type')).toBeTruthy();
            expect(screen.getByText('Opt Type')).toBeTruthy();
            expect(screen.getByText('Legal Basis')).toBeTruthy();
            expect(screen.getByText('Preferences')).toBeTruthy();
            expect(screen.getByText('Date')).toBeTruthy();
        });
    });
});

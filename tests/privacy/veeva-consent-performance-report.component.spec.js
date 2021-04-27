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
import { VeevaConsentPermanceReport } from '../../src/modules/privacy';
import { act } from 'react-dom/test-utils';
import { screen } from '@testing-library/dom'
import { login } from '../../src/modules/platform/user/client/user.actions';

configure({ adapter: new Adapter() });

jest.setTimeout(20000);

describe('Veeva consent performance report component', () => {
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

        consent_report = {
            "data": {
                "hcp_consents" : [
                    {
                        "opt_type": "single-opt-in",
                        "onekeyid": "WFRM00520786",
                        "uuid_mixed": "10004028311",
                        "country_code": "FR",
                        "name": "ADAMAH STANISLAS AMOUZOUGAN",
                        "email": "adamah.amouzougan@chu-st-etienne.fr",
                        "legal_basis": "consent",
                        "preference": "Galapagos news",
                        "given_date": "2020-10-16T10:25:18.000Z"
                    },
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
                "orderType": "ASC"
            },
            "errors":[]
        }
        mockAxios.onGet('/api/veeva-consent-performance-report').reply(200, consent_report);
    });

    const userSlice = () => store.getState().userReducer;

    const wrapperComponent = () => (
        <BrowserRouter>
            <ToastProvider>
                <Provider store={store}>
                    <VeevaConsentPermanceReport/>
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
        const {debug} = render(wrapperComponent());

        await waitFor(async () => {
            expect(screen.getAllByText('Customer Data Platform')).toBeTruthy();
            expect(screen.getAllByText('Filter by Country')).toBeTruthy();
            expect(screen.getAllByText('Filter by Opt Type')).toBeTruthy();
            expect(screen.getAllByText('Name')).toBeTruthy();
            expect(screen.getAllByText('Email')).toBeTruthy();
            expect(screen.getAllByText('Content Type')).toBeTruthy();
            expect(screen.getAllByText('Legal Basis')).toBeTruthy();
            expect(screen.getAllByText('Date')).toBeTruthy();
        });
    });
});
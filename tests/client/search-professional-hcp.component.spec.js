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
import { SearchProfessionalHCP } from '../../src/modules/information';
import { act } from 'react-dom/test-utils';
import { screen } from '@testing-library/dom'
import { login } from '../../src/modules/platform/user/client/user.actions';

configure({ adapter: new Adapter() });

describe('Search hcp professional component', () => {
    let mockAxios;
    let savedUser;

    console.log = jest.fn();

    beforeEach( async () => {
        mockAxios = new MockAdapter(axios);

        savedUser = {
            id: "ca8c6071-bc14-42b9-968c-9f6b27083054",
            first_name: "System",
            last_name: "Admin",
            email: "glpg@brainstation-23.com",
            phone: null,
            type: "admin",
            profile: {
                title: "System Admin",
                permissionSets:[
                    {
                        serviceCategories: [
                            {
                                title: "Information Management",
                                slug:"information"
                            },
                            {
                                title: "Data Privacy & Consent Management",
                                slug: "privacy"
                            },
                            {
                                title: "Management of Customer Data Platform",
                                slug: "platform"
                            }
                        ],
                        application: [
                            {
                                id: "3252888b-530a-441b-8358-3e423dbce08a",
                                name: "HCP Portal",
                                slug: "hcp-portal",
                                logo_link: "https://cdp-development.s3.eu-central-1.amazonaws.com/hcp-portal/logo.png"
                            },
                            {
                                id: "a7959308-7ec5-4090-94ff-2367113a454d",
                                name: "Jyseleca",
                                slug: "jyseleca",
                                logo_link: "https://cdp-development.s3.eu-central-1.amazonaws.com/jyseleca/logo.png"
                            }
                        ],
                        countries: ["BE","FR","DE","IT","NL","ES","GB"]
                    }
                ]
            },
            role: [],
            status: "active",
            last_login: "2021-01-02T06:15:21.000Z",
            expiry_date: null
        }

        mockAxios.onPost('/api/login').reply(200, savedUser);

        await store.dispatch(login({
            email: 'glpg@brainstation-23.com',
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
                        },
                        {
                            codbase: "WNL",
                            codbase_desc: "Netherlands",
                            codbase_desc_okws: "OneKey Netherlands",
                            country_iso2: "NL",
                            country_iso3: "NLD",
                            countryid: 2,
                            countryname: "Netherlands",
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
                        },
                        {
                            codbase: "WNL",
                            codbase_desc: "Netherlands",
                            codbase_desc_okws: "OneKey Netherlands",
                            country_iso2: "NL",
                            country_iso3: "NLD",
                            countryid: 2,
                            countryname: "Netherlands",
                        }
                    ]
                })
            }
        );

        const hcpProfile = {
            data: {
                id: "3ee565df-8616-402d-9e32-a6f33cb2a8a7",
                uuid: "23345",
                salutation: "Ms",
                first_name: "Farzana",
                last_name: "Khan",
                email: "qaglpg+nlnl3@outlook.com",
                birthdate: "01-11-2002",
                country_iso2: "nl",
                language_code: "nl",
                locale: "nl_NL",
                specialty_onekey: "SP.WNL.08",
                status: "not_verified",
                origin_url: "https://www-dev.jyseleca.nl",
                consents: [
                    {
                        consent_given: true,
                        consent_given_time: "2020-12-28T12:33:24.959Z",
                        id: "ebea072a-81d4-4507-a46b-cb365ea0c6db",
                        opt_type: "single-opt-in",
                        preference: "Galapagos Terms of Use",
                        rich_text: "<p>a</p>"
                    },
                ]
            },
            errors: []
        }

        const specialties = [
            {
                codbase: "WNL",
                codIdOnekey: "SP.WNL.H0",
                codDescription: "Administrative Director"
            },
            {
                codbase: "WNL",
                codIdOnekey: "SP.WNL.24",
                codDescription: "Allergology"
            },
            {
                codDescription: "Cardiology",
                codIdOnekey: "SP.WNL.08",
                codbase: "WNL",
            }
        ];

        const searchResult = {
            totalNumberOfResults: 3392,
            numberOfIndividuals: 17,
            resultSize: 30,
            results: [
                {
                    firstName: "J.H.",
                    lastName: "Buurke",
                    type: "Administrator",
                    individualEid: "WNLA00007369",
                    countryIso2: "NL",
                    codbase: "WNL",
                    workplaces: [
                        {
                            id: "WNLH00000506",
                            isValid: true,
                            name: "Revalidatiecentr het Roessingh - Afd. Algemeen",
                            addresss: "Roessinghsbleekweg 33",
                            city: "ENSCHEDE"
                        }
                    ],
                    onekeyEidList :["WNLA0000736901"],
                    isInContract: false,
                    isValid: true
                },
            ]
        };

        mockAxios.onGet('/api/hcps/3ee565df-8616-402d-9e32-a6f33cb2a8a7').reply(200, hcpProfile);
        mockAxios.onGet('/api/hcps/specialties?codbases=WNL').reply(200, specialties);
        mockAxios.onPost('/api/okla/hcps/search').reply(200, searchResult);
        mockAxios.onPost('/api/okla/hcps/search?page=2').reply(200, searchResult);
        mockAxios.onPost('/api/okla/hcps/search?page=1').reply(200, searchResult);
    });

    const userSlice = () => store.getState().userReducer;

    const wrapperComponent = () => (
        <BrowserRouter>
            <ToastProvider>
                <Provider store={store}>
                    <SearchProfessionalHCP location={{search: ''}}/>
                </Provider>
            </ToastProvider>
        </BrowserRouter>
    );

    const wrapperComponentWithId = () => (
        <BrowserRouter>
            <ToastProvider>
                <Provider store={store}>
                    <SearchProfessionalHCP location={{search: '?id=3ee565df-8616-402d-9e32-a6f33cb2a8a7'}}/>
                </Provider>
            </ToastProvider>
        </BrowserRouter>
    );

    it('Should render the search hcp professional component', () => {
        const wrapper = shallow(wrapperComponent());
        expect(wrapper.exists()).toBe(true);
    });

    it('should exist some texts', async () => {
        // const { debug, container, getAllByText, getByText } =
        render(wrapperComponent());
        expect(screen.getByText('OKLA Search')).toBeTruthy();
        expect(screen.getByText('Countries')).toBeTruthy();
        expect(screen.getByText('In My Contract')).toBeTruthy();
        expect(screen.getByText('Phonetic')).toBeTruthy();
        expect(screen.getByText('Duplicates')).toBeTruthy();
        expect(screen.getByText('Individual')).toBeTruthy();
        expect(screen.getByText('First Name')).toBeTruthy();
        expect(screen.getByText('Last Name')).toBeTruthy();
        expect(screen.getByText('Specialty')).toBeTruthy();
        expect(screen.getByText('Workplace')).toBeTruthy();
        expect(screen.getByText('Address Label')).toBeTruthy();
        expect(screen.getByText('City')).toBeTruthy();
        expect(screen.getByText('Postal Code')).toBeTruthy();
        expect(screen.getByText('Identifiers')).toBeTruthy();
        expect(screen.getByText('CLEAR')).toBeTruthy();
        expect(screen.getByText('SEARCH')).toBeTruthy();
    });

    it('should reset fields', async () => {
        const { debug, container } = render(wrapperComponent());
        const last_name = container.querySelector('input[name="lastName"]');
        const clear_btn = screen.getByText('CLEAR');

        await waitFor(() => {
            fireEvent.change(last_name, { target: { value: 'a' } });
        });

        expect(last_name.value).toEqual('a');

        await waitFor(() => {
            fireEvent.click(clear_btn);
        });

        expect(last_name.value).toEqual('');
    });

    it('should search hcps', async () => {
        const { debug, container } = render(wrapperComponentWithId());

        let search_btn;

        await waitFor(() => {
            search_btn = screen.getByText('SEARCH');
            fireEvent.click(search_btn);
            expect(screen.getByText('Search Result')).toBeTruthy();
        });
        expect(screen.getByText('Search Result')).toBeTruthy();


    });
});

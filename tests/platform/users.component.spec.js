import React from 'react';
import { render, waitFor, fireEvent, wait } from '@testing-library/react';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { Provider } from 'react-redux';
import { ToastProvider } from 'react-toast-notifications';
import store from '../../src/modules/core/client/store';
import Users from '../../src/modules/platform/user/client/components/users.component';
import { getSignedInUserProfile } from '../../src/modules/platform/user/client/user.actions';

configure({ adapter: new Adapter() });

jest.setTimeout(20000);

describe('Users component', () => {
    let mockAxios;

    beforeAll(async () => {
        mockAxios = new MockAdapter(axios);
        mockAxios.onGet('/api/users/profile').reply(200, {
            id: '1',
            email: 'email@gmail.com',
            first_name: 'a',
            last_name: 'b',
            application: null,
            countries: null,
            type: 'admin',
            profile: {
                permissionSets: [{
                    countries: ["country1"]
                }]
            }
        });
        await store.dispatch(getSignedInUserProfile());

        const countries = [
            { countryid: 0, codbase: null, country_iso2: null, countryname: '', codbase_desc: 'null' },
            { countryid: 1, codbase: 'aa',  country_iso2: 'country1', countryname: 'countryName1', codbase_desc: 'countryDesc1' },
            { countryid: 2, codbase: 'bb', country_iso2: 'country2', countryname: 'countryName2', codbase_desc: 'countryDesc2' },
            { countryid: 3, codbase: 'cc', country_iso2: 'country3', countryname: 'countryName3', codbase_desc: 'countryDesc3' },
            { countryid: 4, codbase: 'dd', country_iso2: 'country4', countryname: 'countryName4', codbase_desc: 'countryDesc4' }
        ]

        await store.dispatch(
            {
                type: 'GET_COUNTRIES',
                payload: Promise.resolve({
                    data: countries
                })
            }
        );

        const userList = {
            "users":[
                {
                    "id":"e00f1ad7-8dec-402d-b1eb-b3507a4d84ac",
                    "first_name":"First Name",
                    "last_name":"Last Name",
                    "email":"email@gmail.com",
                    "countries":["country1"],
                    "createdByUser":{}
                },
                {
                    "id":"d0a3e77d-d78b-432e-8c7d-b85124071c9b",
                    "first_name":"First Name",
                    "last_name":"Last Name",
                    "email":"email@gmail.com",
                    "countries":["country2"],
                    "createdByUser":{}
                }],
        }

        mockAxios.onPost("/api/cdp-users?page=1").reply(200, userList);
    });

    const wrapperComponent = () => (
        <Provider store={store}>
            <MemoryRouter>
                <ToastProvider>
                    <Users/>
                </ToastProvider>
            </MemoryRouter>
        </Provider>
    );


    it('Should get signed in profile', () => {
        const signedInProfile = store.getState().userReducer.loggedInUser
        expect(signedInProfile).toBeTruthy()
    })

    it('Should show table', async () => {
        const { debug, container, getAllByText, getByText } = render(wrapperComponent());

        await waitFor(() => {
            const table = container.querySelector('table');
            expect(table).toBeTruthy();
        });

        const tbody = container.querySelector('tbody');
        expect(tbody.childNodes.length).toBe(2);
    });
});

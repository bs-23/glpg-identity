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
import Users from '../../src/modules/user/client/components/users.component';
import { getSignedInUserProfile } from '../../src/modules/user/client/user.actions';

configure({ adapter: new Adapter() });

describe('Users component', () => {
    let mockAxios;

    beforeAll(async () => {
        mockAxios = new MockAdapter(axios);
        mockAxios.onGet('/api/users/profile').reply(200, { id: '1', email: 'email@gmail.com', first_name: 'a', last_name: 'b', application: null, countries: null, type: 'admin', roles: [{ title: 'User & HCP Manager', permissions: ['user', 'hcp'] }]});
        await store.dispatch(getSignedInUserProfile());
    
        const countries = [
            { countryid: 0, codbase: null, country_iso2: null, countryname: '', codbase_desc: 'null' },
            { countryid: 1, codbase: 'aa',  country_iso2: 'country1', countryname: 'country1', codbase_desc: 'country1' },
            { countryid: 2, codbase: 'bb', country_iso2: 'country2', countryname: 'country2', codbase_desc: 'country2' },
            { countryid: 3, codbase: 'cc', country_iso2: 'country3', countryname: 'country3', codbase_desc: 'country3' },
            { countryid: 4, codbase: 'dd', country_iso2: 'country4', countryname: 'country4', codbase_desc: 'country4' }
        ]
        const limit = 3
        
        const data = {
            users: [
                { id: '1', first_name: 'John', email: 'email@gmail.com', countries: ['country1'], createdByUser: '1' },
                { id: '2', first_name: 'Smith', email: 'email2@gmail.com', countries: ['country2'], createdByUser: '1' },
                { id: '3', first_name: 'Carl', email: 'email3@gmail.com', countries: ['country3'], createdByUser: '1' },
                { id: '4', first_name: 'Johnson', email: 'email4@gmail.com', countries: ['country4'], createdByUser: '1' },
                { id: '5', first_name: 'Brandon', email: 'email5@gmail.com', countries: ['country4'], createdByUser: '1' },
            ]
        }
    
        mockAxios.onGet('/api/countries').reply(200, countries)
        
        countries.forEach(country => {
            if (country.codbase === 'null') return
            const response = { ...data }
            const { users: allUsers } = response
            response.users = allUsers.filter(user => user.countries.includes(country.country_iso2))
            mockAxios.onGet(`/api/users?page=${1}&codbase=${country.codbase}`).reply(200, response)
        })
        mockAxios.onGet(`/api/users?page=${1}&codbase=null`).reply(200, { users: data.users.slice(0, limit), page: 1, end: 3 })
        mockAxios.onGet(`/api/users?page=${2}&codbase=null`).reply(200, { users: data.users.slice(limit), page: 2, end: 5 })
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

    it('Should filter users based on country', async () => {
        const { debug, container, getByText } = render(wrapperComponent());
        // setTimeout
        // debug(container);

        let table;
        await waitFor(() => {
            table = container.querySelector('table')
            expect(table).toBeTruthy()
        })

        const tbody = container.querySelector('tbody')
        expect(tbody.childNodes.length).toBe(3)

        const filter_button = getByText('Filter by Country')
        fireEvent.click(filter_button)

        const country_label = getByText('country4')
        fireEvent.click(country_label)

        await waitFor(() => {
            expect(container.querySelector('tbody')).toBeTruthy()
        })
    });
});

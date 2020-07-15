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

let mockAxios;

beforeAll(async () => {
    mockAxios = new MockAdapter(axios);
    mockAxios.onGet('/api/users/profile').reply(200, { id: '1', email: 'email@gmail.com', name: 'John Smith' })
    await store.dispatch(getSignedInUserProfile())
});

let data
beforeEach(() => {
    mockAxios = new MockAdapter(axios);
    const countries = [{ countryid: 0, country_iso2: 'null', countryname: '' }, { countryid: 1, country_iso2: 'Ireland', countryname: 'Ireland' }, { countryid: 2, country_iso2: 'Netherlands', countryname: 'Netherlands'}]
    const limit = 3
    data = {
        users: [
            { id: '1', name: 'John', email: 'email@gmail.com', country_iso2: 'Ireland' },
            { id: '2', name: 'Smith', email: 'email2@gmail.com', country_iso2: 'Netherlands' },
            { id: '3', name: 'Carl', email: 'email3@gmail.com', country_iso2: 'Luxembourg' },
            { id: '4', name: 'Johnson', email: 'email4@gmail.com', country_iso2: 'Netherlands' },
            { id: '5', name: 'Brandon', email: 'email5@gmail.com', country_iso2: 'Netherlands' },
        ]
    }

    mockAxios.onGet('/api/countries').reply(200, countries)
    mockAxios.onDelete(`/api/users/1`).reply(200, { id: '1' })
    countries.forEach(country => {
        if (country.countryname === 'null') return
        const response = { ...data }
        const { users: allUsers } = response
        response.users = allUsers.filter(user => user.country_iso2 === country.country_iso2)
        mockAxios.onGet(`/api/users?page=${1}&country=${country.country_iso2}`).reply(200, response)
    })
    mockAxios.onGet(`/api/users?page=${1}&country=null`).reply(200, { users: data.users.slice(0, limit), page: 1, end: 3 })
    mockAxios.onGet(`/api/users?page=${2}&country=null`).reply(200, { users: data.users.slice(limit), page: 2, end: 5 })
})

describe('Users component', () => {
    it('Should get signed in profile', () => {
        const signedInProfile = store.getState().userReducer.loggedInUser
        expect(signedInProfile).toBeTruthy()
    })

    it('Should filter users based on country', async () => {
        const { container, getByText } = render(
            <Provider store={store}>
                <MemoryRouter>
                    <ToastProvider>
                        <Users />
                    </ToastProvider>
                </MemoryRouter>
            </Provider>
        );

        let table
        await waitFor(() => {
            table = container.querySelector('table')
            expect(table).toBeTruthy()
        })

        const tbody = container.querySelector('tbody')
        expect(tbody.childNodes.length).toBe(3)

        const filter_button = getByText('Filter by Country')
        fireEvent.click(filter_button)

        
        const country_label = getByText('Ireland')
        fireEvent.click(country_label)

        await waitFor(() => {
            expect(tbody.childNodes.length).toBe(1)
        })
    });
});

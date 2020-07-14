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

describe('User component', () => {
    beforeEach(() => {
        mockAxios = new MockAdapter(axios);
    });

    it('Should get signed in profile', () => {
        const signedInProfile = store.getState().userReducer.loggedInUser
        expect(signedInProfile).toBeTruthy()
    })

    it('Should render user table and delete one user', async () => {
        const users = {
            users: [
                { id: '1', name: 'John', email: 'email@gmail.com' },
                { id: '2', name: 'Smith', email: 'anothermail@gmail.com' }
            ]
        }

        mockAxios.onGet(`/api/users?page=${1}&country=${null}`).reply(200, users)
        mockAxios.onDelete(`/api/users/1`).reply(200, { id: '1' })

        const { container } = render(
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
        const row1 = tbody.firstChild
        const row1Delete = row1.lastChild.firstChild

        window.confirm = jest.fn(() => true)

        users.users  = users.users.filter(e => e.id === '1')
        fireEvent.click(row1Delete)

        await waitFor(() => {
            expect(tbody.childNodes.length).toBe(1)
        })
    });

    it('Should filter users based on country', async () => {
        const conuntries = ["null", "Ireland","Netherlands","Luxembourg"]

        const data = {
            users: [
                { id: '1', name: 'John', email: 'email@gmail.com', country: 'Ireland' },
                { id: '2', name: 'Smith', email: 'email2@gmail.com', country: 'Netherlands' },
                { id: '3', name: 'Carl', email: 'email3@gmail.com', country: 'Luxembourg' },
                { id: '4', name: 'Johnson', email: 'email4@gmail.com', country: 'Luxembourg' }
            ]
        }

        conuntries.forEach(country => {
            const response = {...data}
            const { users: allUsers } = response
            if(country !== 'null') response.users = allUsers.filter(user => user.country === country)
            mockAxios.onGet(`/api/users?page=${1}&country=${country}`).reply(200, response)
        })

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
        expect(tbody.childNodes.length).toBe(4)

        const filter_button = getByText('Filter')
        fireEvent.click(filter_button)

        const selected_country = getByText('Luxembourg')
        fireEvent.click(selected_country)

        await waitFor(() => {
            expect(tbody.childNodes.length).toBe(2)
        })
    });

    it('Should filter users based on country', async () => {
        const limit = 2
        const data = {
            users: [
                { id: '1', name: 'John', email: 'email@gmail.com', country: 'Ireland' },
                { id: '2', name: 'Smith', email: 'email2@gmail.com', country: 'Netherlands' },
                { id: '3', name: 'Carl', email: 'email3@gmail.com', country: 'Luxembourg' },
            ],
            total: 3
        }
        const { users } = data

        mockAxios.onGet(`/api/users?page=${1}&country=null`).reply(200, { users: users.slice(0, limit), page: 1,  end: 2 })
        mockAxios.onGet(`/api/users?page=${2}&country=null`).reply(200, { users: users.slice(limit), page: 2,  end: 3 })

        const { container, getByText, queryByText } = render(
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
        expect(tbody.childNodes.length).toBe(2)

        const next_button = getByText('Next')
        fireEvent.click(next_button)

        await waitFor(() => {
            expect(queryByText('Carl')).toBeTruthy()
            expect(queryByText('John')).toBeFalsy()
            expect(tbody.childNodes.length).toBe(1)
        })

        const prev_button = getByText('Prev')
        fireEvent.click(prev_button)

        await waitFor(() => {
            expect(queryByText('Carl')).toBeFalsy()
            expect(queryByText('John')).toBeTruthy()
            expect(tbody.childNodes.length).toBe(2)
        })
    });
});

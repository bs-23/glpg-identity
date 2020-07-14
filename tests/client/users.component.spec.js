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
});

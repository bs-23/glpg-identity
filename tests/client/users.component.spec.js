import React from 'react';
import { render, waitFor, fireEvent, wait } from '@testing-library/react';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { Provider } from 'react-redux';
import store from '../../src/modules/core/client/store';
import Users from '../../src/modules/user/client/components/users.component';

configure({ adapter: new Adapter() });

let mockAxios;

describe('User component', () => {
    beforeEach(() => {
        mockAxios = new MockAdapter(axios);
    });

    it('Should render user table and delete one user', async () => {
        const users = [
            { id: '1', name: 'John', email: 'email@gmail.com' },
            { id: '2', name: 'Smith', email: 'anothermail@gmail.com' }
        ]

        mockAxios.onGet('/api/users').reply(200, users)
        mockAxios.onDelete(`/api/users/1`).reply(200, { id: '1' })

        const { container } = render(
            <Provider store={store}>
                <MemoryRouter>
                    <Users />
                </MemoryRouter>
            </Provider>
        );

        let table
        await waitFor(() => {
            table = container.querySelector('table')
        })
        expect(table).toBeTruthy()

        const tbody = container.querySelector('tbody')
        const row1 = tbody.childNodes[0]
        const row1Delete = row1.childNodes[4].firstChild

        window.confirm = jest.fn(() => true)

        await waitFor(() => {
            fireEvent.click(row1Delete)
        })

        expect(tbody.childNodes.length).toBe(1)
    });
});

import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

import { Provider } from 'react-redux';
import store from '../../src/modules/core/client/store';
import HcpUser from '../../src/modules/hcp/client/components/hcp-users';
import { login } from '../../src/modules/user/client/user.actions';
import { getHcpProfiles } from '../../src/modules/hcp/client/hcp.actions'

configure({ adapter: new Adapter() });

describe('Hcp user component', () => {
    let fakeAxios;
    let savedUser;
    let data;

    beforeAll(async () => {
        fakeAxios = new MockAdapter(axios);
        window.alert = jest.fn();

        savedUser = { name: 'a', email: 'test@gmail.com'};
        fakeAxios.onPost('/api/login').reply(200, savedUser);

        await store.dispatch(login({
            email: 'test@gmail.com',
            password: 'test'
        }));

        data = { 
            users: [
                { first_name: 'a', last_name: 'a', email: 'a', phone: '1', uuid: '1' },
                { first_name: 'b', last_name: 'b', email: 'b', phone: '2', uuid: '2' }
            ]
        };
        const page = 1, is_active = null;
        fakeAxios.onGet(`/api/hcps?page=${page}&is_active=${is_active}`).reply(200, data);
        await store.dispatch(getHcpProfiles(page, is_active));
    });

    const userSlice = () => store.getState().userReducer;
    const hcpUserSlice = () => store.getState().hcpReducer;

    const wrapperComponent = () => (
        <Provider store={store}>
            <MemoryRouter>
                <HcpUser/>
            </MemoryRouter>
        </Provider>
    );

    it('Should render hcp-user component', () => {
        const wrapper = shallow(wrapperComponent());
        expect(wrapper.exists()).toBe(true);
    });

    it('should set user', async () => {
        expect(userSlice().loggedInUser).toEqual(savedUser);
    })

    it('should set hcp users', async () => {
        expect(hcpUserSlice().hcps).toEqual(data);
    })

    it('should render table', () => {
        const { container } = render(wrapperComponent());
        const table = container.querySelector('table');
        const thead = container.querySelector('thead');
        const tbody = container.querySelector('tbody');

        expect(table).toBeTruthy();
        expect(thead).toBeTruthy();
        expect(tbody).toBeTruthy();
        expect(tbody.childElementCount).toBe(2);
    })

    it('should sort table data by first name', async () => {
        const { container, getByText } = render(wrapperComponent());
        const tbody = container.querySelector('tbody');
        const first_name = getByText('Firstname');
        const span = first_name.querySelector('span');
        const buttons = span.childNodes;
        const dsc_button = buttons[1];


        await waitFor(() => {
            fireEvent.click(dsc_button);
        });


        const rows = tbody.childNodes;
        const first_row = rows[0];
        const tds = first_row.childNodes;
        const first_td = tds[0];

        expect(first_td.textContent).toEqual('b');
    })

    it('should remove a hcp user', async () => {
        const { container, getByText } = render(wrapperComponent());
        const tbody = container.querySelector('tbody');
        const first_name = getByText('Firstname');
        const span = first_name.querySelector('span');
        const buttons = span.childNodes;
        const dsc_button = buttons[1];


        await waitFor(() => {
            fireEvent.click(dsc_button);
        });


        const rows = tbody.childNodes;
        const first_row = rows[0];
        const tds = first_row.childNodes;
        const first_td = tds[0];

        expect(first_td.textContent).toEqual('b');
    })
});

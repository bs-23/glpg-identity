import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { Provider } from 'react-redux';
import { ToastProvider } from 'react-toast-notifications';
import store from '../../src/modules/core/client/store';
import UserForm from '../../src/modules/user/client/components/user-form.component';

configure({ adapter: new Adapter() });

let mockAxios;



describe('UserForm component', () => {
    beforeEach(() => {
        mockAxios = new MockAdapter(axios);
    });

    const wrapperComponent = () => (
        <Provider store={store}>
            <ToastProvider>
                <UserForm />
            </ToastProvider>
        </Provider>
    );

    it('Should render UserForm component', () => {
        const wrapper = shallow(<wrapperComponent/>);
        expect(wrapper.exists()).toBe(true);
    });

    it('Should fill out all the input fields', async () => {
        const { getByTestId, getByText, container } = render(
            <Provider store={store}>
                <MemoryRouter>
                    <ToastProvider>
                        <UserForm />
                    </ToastProvider>
                </MemoryRouter>
            </Provider>
        );

        const countries = [{ countryid: 1, countryname: 'England'}]
        const permissions = [{ id: 1, title: 'Demo Permission'}]
        mockAxios.onGet('/api/countries').reply(200, countries)
        mockAxios.onGet('/api/permissions').reply(200, permissions)

        const first_name = getByTestId('first_name');
        const last_name = getByTestId('last_name');
        const email = getByTestId('email');
        const phone = getByTestId('phone');

        await waitFor(() => {
            fireEvent.change(first_name, { target: { value: 'a' } });
            fireEvent.change(last_name, { target: { value: 'a' } });
            fireEvent.change(email, { target: { value: 'a' } });
            fireEvent.change(phone, { target: { value: 'a' } });
        });

        expect(first_name.value).toEqual('a');
        expect(last_name.value).toEqual('a');
        expect(email.value).toEqual('a');
        expect(phone.value).toEqual('a');
    });
});

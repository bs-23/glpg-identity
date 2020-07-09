import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { Provider } from 'react-redux';
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import store from '../../src/modules/core/client/store.js';
import ForgotPassword from '../../src/modules/user/client/components/forgot-password.component';

configure({ adapter: new Adapter() });

describe('Forgot password component', () => {
    const wrapperComponent = () => (
            <Provider store={store}>
                <ForgotPassword />
            </Provider>
    );

    it('Should fill out email, submit and get success response', async () => {
        const { container } = render(wrapperComponent());
        const email = container.querySelector('input[name="email"]');
        const submit = container.querySelector('button[type="submit"]');

        const mockAxios = new MockAdapter(axios);
        mockAxios.onPost('/api/users/password/send-reset-link').reply(200)

        fireEvent.change(email, { target: { value: 'email@gmail.com' } });

        expect(email.value).toEqual('email@gmail.com');

        await waitFor(() => {
            fireEvent.click(submit);
        })

        expect(email.value).toEqual('');
    });

    it('Should fill out email, submit and get error response', async () => {
        const { container, getByText } = render(wrapperComponent());
        const email = container.querySelector('input[name="email"]');
        const submit = container.querySelector('button[type="submit"]');

        const mockAxios = new MockAdapter(axios);
        mockAxios.onPost('/api/users/password/send-reset-link').reply(400, 'Email does not exist')

        fireEvent.change(email, { target: { value: 'email@gmail.com' } });

        expect(email.value).toEqual('email@gmail.com');

        await waitFor(() => {
            fireEvent.click(submit);
        })

        getByText('Email does not exist')
    });
});

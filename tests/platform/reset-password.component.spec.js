import React from 'react';
import { render, waitFor, fireEvent, wait } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { ToastProvider } from 'react-toast-notifications';
import store from '../../src/modules/core/client/store.js';
import ResetPassword from '../../src/modules/platform/user/client/components/reset-password.component';

jest.setTimeout(20000);

describe('Reset password component', () => {
    const wrapperComponent = () => (
        <BrowserRouter>
            <Provider store={store}>
                <ToastProvider>
                    <ResetPassword />
                </ToastProvider>
            </Provider>
        </BrowserRouter>
    );

    it('Should fill out email and submit', async () => {
        const path = '/api/users/reset-password/'
        const query = '?token=123456&email=email@gmail.com'

        delete window.location
        window.location = { href: path+query }
        window.location.search = query
        window.location.pathname = path

        const { container, getByText } = render(wrapperComponent());
        const newPassword = container.querySelector('input[name="newPassword"]');
        const confirmPassword = container.querySelector('input[name="confirmPassword"]');
        const submit = container.querySelector('button[type="submit"]');

        const mockAxios = new MockAdapter(axios);
        mockAxios.onPut('/api/users/reset-password?token=123456').reply(200)

        fireEvent.change(newPassword, { target: { value: 'Abcdef2!' } });
        fireEvent.change(confirmPassword, { target: { value: 'Abcdef2!' } });

        expect(newPassword.value).toEqual('Abcdef2!');
        expect(confirmPassword.value).toEqual('Abcdef2!');


        fireEvent.click(submit);

        await waitFor(() => {
            getByText('Your password has been reset successfully. Redirecting...')
        })
    });
});

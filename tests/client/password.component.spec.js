import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from '../../src/modules/core/client/store.js';
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import PasswordForm from '../../src/modules/user/client/components/my-profile/password.component';
import { login } from '../../src/modules/user/client/user.actions';
import { ToastProvider } from 'react-toast-notifications';

configure({ adapter: new Adapter() });

describe('PasswordForm component', () => {
    let fakeAxios;
    let savedUser;

    beforeEach(async () => {
        fakeAxios = new MockAdapter(axios)

        savedUser = { name: 'a', email: 'test@gmail.com'};
        fakeAxios.onPost('/api/login').reply(200, savedUser);

        await store.dispatch(login({
            email: 'test@gmail.com',
            password: 'test'
        }));

        fakeAxios.onPost(`/api/users/change-password`).reply(200);
    });

    const userSlice = () => store.getState().userReducer;

    const wrapperComponent = () => (
        <ToastProvider>
            <Provider store={store}>
                <MemoryRouter>
                    <PasswordForm/>
                </MemoryRouter>
            </Provider>
        </ToastProvider>
    );

    it('Should render the PasswordForm component', () => {
        const wrapper = shallow(wrapperComponent());
        expect(wrapper.exists()).toBe(true);
    });

    it('should set user', async () => {
        expect(userSlice().loggedInUser).toEqual(savedUser);
    });

    it('Should fill out the current password, new password and confirm password', async () => {
        const { getByTestId } = render(wrapperComponent());
        const current_password = getByTestId('currentPassword');
        const new_password = getByTestId('newPassword');
        const confirm_password = getByTestId('confirmPassword');

        await waitFor(() => {
            fireEvent.change(current_password, { target: { value: 'strong-passworD12@' } });
            fireEvent.change(new_password, { target: { value: 'P@ssword123' } });
            fireEvent.change(confirm_password, { target: { value: 'P@ssword123' } });
        });

        expect(current_password.value).toEqual('strong-passworD12@');
        expect(new_password.value).toEqual('P@ssword123');
        expect(confirm_password.value).toEqual('P@ssword123');
    });
});

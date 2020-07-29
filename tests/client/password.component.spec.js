import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from '../../src/modules/core/client/store.js';
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import PasswordForm from '../../src/modules/user/client/components/password.component';
import { login } from '../../src/modules/user/client/user.actions';

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
        <Provider store={store}>
            <MemoryRouter>
                <PasswordForm/> 
            </MemoryRouter>
        </Provider>
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
        const confirm_password = getByTestId('newPassword');

        await waitFor(() => {
            fireEvent.change(current_password, { target: { value: 'a' } });
            fireEvent.change(new_password, { target: { value: 'b' } });
            fireEvent.change(confirm_password, { target: { value: 'b' } });
        });

        expect(current_password.value).toEqual('a');
        expect(new_password.value).toEqual('b');
        expect(confirm_password.value).toEqual('b');
    });

    it('Should fill out the current password, new password and confirm password and update it', async () => {
        const { getByTestId, container } = render(wrapperComponent());
        const current_password = getByTestId('currentPassword');
        const new_password = getByTestId('newPassword');
        const confirm_password = getByTestId('newPassword');

        await waitFor(() => {
            fireEvent.change(current_password, { target: { value: 'a' } });
            fireEvent.change(new_password, { target: { value: 'a' } });
            fireEvent.change(confirm_password, { target: { value: 'a' } });
        });

        expect(current_password.value).toEqual('a');
        expect(new_password.value).toEqual('a');
        expect(confirm_password.value).toEqual('a');

        // await waitFor(() => fireEvent.click(submit));
        // console.log("=====================================>", submit)
        // const a = getByTestId('aaaa');
    });
});

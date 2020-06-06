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

configure({ adapter: new Adapter() });

describe('PasswordForm component', () => {
    let fakeAxios;

    beforeEach(() => {
        fakeAxios = new MockAdapter(axios)
    });

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
});

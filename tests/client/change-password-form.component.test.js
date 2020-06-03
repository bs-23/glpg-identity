import React from 'react';
import { render, waitFor, fireEvent, act, wait } from '@testing-library/react';
import Enzyme, { configure, shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { MemoryRouter, withRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from '../../src/modules/core/client/store.js';
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import ChangePasswordForm from '../../src/modules/user/client/components/change-password-form.component';

configure({ adapter: new Adapter() });

describe('ChangePasswordForm component', () => {
    let fakeAxios;

    beforeEach(() => {
        fakeAxios = new MockAdapter(axios)
    })

    const wrapperComponent = () => (
        <Provider store={store}>
            <MemoryRouter>
                <ChangePasswordForm />
            </MemoryRouter>
        </Provider>
    )

    it('should render the changePasswordForm component', () => {
        const wrapper = shallow(wrapperComponent());
        expect(wrapper.exists()).toBe(true);
    });

    it('should fill out the current password, new password and confirm password', async () => {
        const { getByTestId, container } = render(wrapperComponent());
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
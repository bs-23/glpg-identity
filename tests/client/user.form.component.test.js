import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import Enzyme, { configure, shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { MemoryRouter, withRouter } from 'react-router-dom';

import { Provider } from 'react-redux';
import store from '../../src/modules/core/client/store';

import UserForm from '../../src/modules/user/client/components/user-form.component';

configure({ adapter: new Adapter() });

describe('UserForm component', () => {
    it('should render UserForm component', () => {
        const wrapper = shallow(<UserForm />);
        expect(wrapper.exists()).toBe(true);
    });

    it('should fill out all the input fields', async () => {
        const { getByTestId, getByText, container } = render(
            <Provider store={store}>
                <MemoryRouter>
                    <UserForm />
                </MemoryRouter>
            </Provider>
        );

        const name = getByTestId('name');
        const email = getByTestId('email');
        const password = getByTestId('password');
        const phone = getByTestId('phone');

        await waitFor(() => {
            fireEvent.change(name, { target: { value: 'mockname' } });
            fireEvent.change(email, { target: { value: 'mockemail' } });
            fireEvent.change(password, { target: { value: 'mockpassword' } });
            fireEvent.change(phone, { target: { value: 'mockphone' } });
        });

        expect(name.value).toEqual('mockname');
        expect(email.value).toEqual('mockemail');
        expect(password.value).toEqual('mockpassword');
        expect(phone.value).toEqual('mockphone');
    });
});

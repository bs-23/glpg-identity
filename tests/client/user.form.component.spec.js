import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { MemoryRouter } from 'react-router-dom';

import { Provider } from 'react-redux';
import store from '../../src/modules/core/client/store';
import UserForm from '../../src/modules/user/client/components/user-form.component';

configure({ adapter: new Adapter() });

describe('UserForm component', () => {
    it('Should render UserForm component', () => {
        const wrapper = shallow(<UserForm />);
        expect(wrapper.exists()).toBe(true);
    });

    it('Should fill out all the input fields', async () => {
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
            fireEvent.change(name, { target: { value: 'a' } });
            fireEvent.change(email, { target: { value: 'a' } });
            fireEvent.change(password, { target: { value: 'a' } });
            fireEvent.change(phone, { target: { value: 'a' } });
        });

        expect(name.value).toEqual('a');
        expect(email.value).toEqual('a');
        expect(password.value).toEqual('a');
        expect(phone.value).toEqual('a');
    });
});

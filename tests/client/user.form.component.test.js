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
        const country = getByTestId('country');
        const permission = getByTestId('permission');
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
        expect(getByText(/Norway/i).innerHTML).toEqual('Norway');
        expect(getByText(/Persona Management/i).innerHTML).toEqual(
            'Persona Management'
        );
        expect(phone.value).toEqual('mockphone');
    });

    // it('should return error if name, email and passowrd is not set at the time of submitting the form', async () => {
    //     const { getByTestId, getByText, container } = render(
    //         <Provider store={store}>
    //             <MemoryRouter>
    //                 <UserForm />
    //             </MemoryRouter>
    //         </Provider>
    //     );

    //     const submit = container.querySelector('button[type="submit"]');

    //     const name_error = getByTestId('nameError');
    //     const email_error = getByTestId('emailError');
    //     const password_error = getByTestId('passwordError');

    //     await waitFor(() => {
    //         fireEvent.click(submit);
    //     });

    //     expect(name_error.innerHTML).toBeTruthy();
    //     expect(email_error.innerHTML).toBeTruthy();
    //     expect(password_error.innerHTML).toBeTruthy();
    // });

    // it('should return no error if name, email and passowrd is set at the time of submitting the form', async () => {
    //     const { getByTestId, getByText, container } = render(
    //         <Provider store={store}>
    //             <MemoryRouter>
    //                 <UserForm />
    //             </MemoryRouter>
    //         </Provider>
    //     );

    //     const submit = container.querySelector('button[type="submit"]');

    //     const name = getByTestId('name');
    //     const email = getByTestId('email');
    //     const password = getByTestId('password');

    //     const name_error = getByTestId('nameError');
    //     const email_error = getByTestId('emailError');
    //     const password_error = getByTestId('passwordError');

    //     await waitFor(() => {
    //         fireEvent.change(name, { target: { value: 'mockname' } });
    //         fireEvent.change(email, {
    //             target: { value: 'mockemail@gmail.com' },
    //         });
    //         fireEvent.change(password, { target: { value: 'mockpassword' } });
    //     });

    //     await waitFor(() => {
    //         fireEvent.click(submit);
    //     });

    //     expect(name_error.innerHTML).toBeFalsy();
    //     expect(email_error.innerHTML).toBeFalsy();
    //     expect(password_error.innerHTML).toBeFalsy();
    // });
});

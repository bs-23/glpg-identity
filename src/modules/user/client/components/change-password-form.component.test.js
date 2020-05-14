import React from "react";
import { render, waitFor, fireEvent } from '@testing-library/react';
import Enzyme, { configure, shallow, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { MemoryRouter, withRouter } from 'react-router-dom';

import store from '../../../core/client/store'
import { Provider } from 'react-redux'

import ChangePasswordForm from './change-password-form.component'

configure({ adapter: new Adapter() });

describe("ChangePasswordForm component", () => {
    it("should render the changePasswordForm component", () => {
        const wrapper = shallow(<ChangePasswordForm />);
        expect(wrapper.exists()).toBe(true);
    })

    it("should fill out the current password, new password and confirm password", async () => {
        const { getByTestId, container } = render(
        <Provider store={store}> 
            <MemoryRouter>
                <ChangePasswordForm /> 
            </MemoryRouter>
        </Provider>)
    
        const current_password = getByTestId('currentPassword')
        const new_password = getByTestId('newPassword')
        const confirm_password = getByTestId('newPassword')
    
        await waitFor(() => {
            fireEvent.change(current_password, {target: {value: 'currentpassword'}})
            fireEvent.change(new_password, {target: {value: 'newpassword'}})
            fireEvent.change(confirm_password, {target: {value: 'newpassword'}})
        })
        
        // console.log(current_password.value, ' <========>', new_password.value, '<=========> ', confirm_password.value)
        expect(current_password.value).toEqual("currentpassword")
        expect(new_password.value).toEqual("newpassword")
        expect(confirm_password.value).toEqual("newpassword")
    })

    // it("should return error if current password or new password or confirm password is empty at submitting the form",
    //  async () => {
    //     const { getByTestId, container } = render(
    //         <Provider store={store}> 
    //             <MemoryRouter>
    //                 <ChangePasswordForm /> 
    //             </MemoryRouter>
    //         </Provider>)
        
    //     const submit = container.querySelector('button[type="submit"]')

    //     const current_password_error = getByTestId('currentPasswordError')
    //     const new_password_error = getByTestId('newPasswordError')
    //     const confirm_password_error = getByTestId('confirmPasswordError')

    //     await waitFor(() => {
    //         fireEvent.click(submit)
    //     })

    //     expect(current_password_error.innerHTML).toBeTruthy()
    //     expect(new_password_error.innerHTML).toBeTruthy()
    //     expect(confirm_password_error.innerHTML).toBeTruthy()
    // })

    // it("should return no error if current password or new password or confirm password is not empty at submitting the form",
    //  async () => {
    //     const { getByTestId, container } = render(
    //         <Provider store={store}> 
    //             <MemoryRouter>
    //                 <ChangePasswordForm /> 
    //             </MemoryRouter>
    //         </Provider>)
        
    //     const submit = container.querySelector('button[type="submit"]')

    //     const current_password = getByTestId('currentPassword')
    //     const new_password = getByTestId('newPassword')
    //     const confirm_password = getByTestId('confirmPassword')

    //     const current_password_error = getByTestId('currentPasswordError')
    //     const new_password_error = getByTestId('newPasswordError')
    //     const confirm_password_error = getByTestId('confirmPasswordError')

    //     await waitFor(() => {
    //         fireEvent.change(current_password, {target: {value: 'currentpassword'}})
    //         fireEvent.change(new_password, {target: {value: 'newpassword'}})
    //         fireEvent.change(confirm_password, {target: {value: 'newpassword'}})
    //     })
    //     await waitFor(() => {
    //         fireEvent.click(submit)
    //     })

    //     expect(current_password_error.innerHTML).toBeFalsy()
    //     expect(new_password_error.innerHTML).toBeFalsy()
    //     expect(confirm_password_error.innerHTML).toBeFalsy()
    // })

})




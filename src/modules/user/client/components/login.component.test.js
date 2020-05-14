import React from "react";
import { render, waitFor, fireEvent } from '@testing-library/react';
import { screen } from '@testing-library/dom'
import Enzyme, { configure, shallow, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";


import Login from './login.component'

configure({ adapter: new Adapter() });


describe("Login component", () => {
    it("should render the login component", () => {
        const wrapper = shallow(<Login />);
        expect(wrapper.exists()).toBe(true);
    })

    it("should fill out the email input", async () => {
        const { container } = render(<Login />)
        const email = container.querySelector('input[name="email"]')
        

        await waitFor(() => {
            fireEvent.change(email, {
                target: {
                    value: "habib@gmail.com"
                }
            })
        })

        expect(email.value).toEqual("habib@gmail.com")
    })

    it("should fill out the password input", async () => {
        const { container } = render(<Login />)
        const password = container.querySelector('input[name="password"]')

        await waitFor(() => {
            fireEvent.change(password, {
                target: {
                    value: "testingpassword"
                }
            })
        })

        expect(password.value).toEqual("testingpassword")
    })

    it("should return error if email is not set", async () => {
        const {getByTestId, container} = render(<Login />)

        const submit = container.querySelector('button[type="submit"]')
        
        const email_error = getByTestId('email-error')

        await waitFor(() => {
            fireEvent.click(submit)
        })

        // console.log(' ================================>',email_error.innerHTML)

        expect(email_error.innerHTML).toBeTruthy()
    })

    it("should return error if password is not set", async () => {
        const {getByTestId, container} = render(<Login />)

        const submit = container.querySelector('button[type="submit"]')
        
        const password_error = getByTestId('password-error')

        await waitFor(() => {
            fireEvent.click(submit)
        })

        expect(password_error.innerHTML).toBeTruthy()
    })

    it("should return no error if email and password set", async () => {
        const {getByTestId, container} = render(<Login />)

        const submit = container.querySelector('button[type="submit"]')
        
        const email = getByTestId('email')
        const password = getByTestId('password')
        
        const email_error = getByTestId('email-error')
        const password_error = getByTestId('password-error')

        await waitFor(() => {
            fireEvent.change(email, {
                target: {
                    value: "habib@gmail.com"
                }
            })
        })

        await waitFor(() => {
            fireEvent.change(password, {
                target: {
                    value: "mypasswordiswrong"
                }
            })
        })

        await waitFor(() => {
            fireEvent.click(submit)
        })

        expect(email_error.innerHTML).toBeFalsy()
        expect(password_error.innerHTML).toBeFalsy()
    })
})

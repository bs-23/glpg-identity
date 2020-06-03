
import React from 'react';
import { render, waitFor, fireEvent, act } from '@testing-library/react';
import Enzyme, { configure, shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { Provider } from 'react-redux';
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import store from '../../src/modules/core/client/store.js';
import Login from '../../src/modules/user/client/components/login.component';



configure({ adapter: new Adapter() });

describe('Login component', () => {
    let fakeAxios;

    beforeEach(() => {
        fakeAxios = new MockAdapter(axios);
    })

    const userSlice = () => store.getState().userReducer

    const wrapperComponent = () => (
        <Provider store={store}>
            <Login />
        </Provider>
    )

    it('should render the login component', () => {
        const wrapper = shallow(wrapperComponent());
        expect(wrapper.exists()).toBe(true);
    });

    it('should fill out email and password', async () => {
        const { container } = render(wrapperComponent());
        const email = container.querySelector('input[name="email"]');
        const password = container.querySelector('input[name="password"]');

        await waitFor(() => {
            fireEvent.change(email, { target: { value: 'a' } });
            fireEvent.change(password, { target: { value: 'a' } });
        });

        expect(email.value).toEqual('a');
        expect(password.value).toEqual('a')
    });

    it('should not login successfully if response is 500', async () => {
        const { container } = render(wrapperComponent());
        const email = container.querySelector('input[name="email"]');
        const password = container.querySelector('input[name="password"]');
        const submit = container.querySelector('button[type="submit"]');
        fakeAxios.onPost('/login').reply(500)

        await waitFor(() => {
            fireEvent.change(email, { target: { value: 'test@gmail.com' } });
            fireEvent.change(password, { target: { value: '11111111' } });
        });

        await waitFor(() => {
            fireEvent.click(submit);
        })

        expect(userSlice().loggedInUser).toBeFalsy()
    });

    it('should login successfully if response is 200', async () => {
        const { container } = render(wrapperComponent());
        const email = container.querySelector('input[name="email"]');
        const password = container.querySelector('input[name="password"]');
        const submit = container.querySelector('button[type="submit"]');
        const savedUser = { name: 'a', email: 'test@gmail.com'}
        fakeAxios.onPost('/login').reply(200, savedUser)

        await waitFor(() => {
            fireEvent.change(email, { target: { value: 'test@gmail.com' } });
            fireEvent.change(password, { target: { value: '11111111' } });
        });

        await waitFor(() => {
            fireEvent.click(submit);
        })

        expect(userSlice().loggedInUser).toEqual(savedUser)
    })
});
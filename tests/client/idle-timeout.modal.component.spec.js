import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { Provider } from 'react-redux';
import axios from 'axios'
import { BrowserRouter } from 'react-router-dom';
import MockAdapter from 'axios-mock-adapter'
import { ToastProvider } from 'react-toast-notifications';
import store from '../../src/modules/core/client/store.js';
import IdleTimeout from '../../src/modules/core/client/components/idle-timeout.modal.component';
import { act } from 'react-dom/test-utils';
import { screen } from '@testing-library/dom'
import { login } from '../../src/modules/user/client/user.actions';
import sinon from 'sinon';

configure({ adapter: new Adapter() });

describe('Idle time out component', () => {
    let mockAxios;
    let savedUser;
    const oldWindowLocation = window.location;

    beforeEach( async () => {        
        mockAxios = new MockAdapter(axios);

        savedUser = { name: 'a', email: 'test@gmail.com'};
        mockAxios.onPost('/api/login').reply(200, savedUser);
        mockAxios.onGet('/api/logout').reply(200);

        await store.dispatch(login({
            email: 'test@gmail.com',
            password: 'test'
        }));
    });

    beforeAll(() => {
        delete window.location

        window.location = Object.defineProperties(
            {},
            {
            ...Object.getOwnPropertyDescriptors(oldWindowLocation),
            assign: {
                configurable: true,
                value: jest.fn(),
            },
            },
        )
    });

    afterAll(() => {
        // restore `window.location` to the original `jsdom`
        // `Location` object
        window.location = oldWindowLocation;
    });

    const userSlice = () => store.getState().userReducer;

    const wrapperComponent = () => (
        <BrowserRouter>
            <ToastProvider>
                <Provider store={store}>
                    <IdleTimeout show={true}/>
                </Provider>
            </ToastProvider>
        </BrowserRouter>
    );

    it('Should render the idle time out modal component', () => {
        const wrapper = shallow(wrapperComponent());
        expect(wrapper.exists()).toBe(true);
    });

    it('should set user', async () => {
        expect(userSlice().loggedInUser).toEqual(savedUser);
    });

    it('should log out manually', async () => {
        render(wrapperComponent());
        const logout = screen.getByText('Logout');
        await waitFor(() => {
            fireEvent.click(logout);
        });

        expect(window.location.assign).toHaveBeenCalledWith('/api/logout');
    });

    it('should check text contents of the modal', async () => {
        render(wrapperComponent());
        
        const logout = screen.getByText('Logout');
        expect(logout).toBeTruthy();
        expect(logout.textContent).toEqual('Logout');

        const StayLoggedIn = screen.getByText('Stay Logged In');
        expect(StayLoggedIn).toBeTruthy();
        expect(StayLoggedIn.textContent).toEqual('Stay Logged In');

        const warnText = screen.getByText(/Your session is about to expire/);
        expect(warnText).toBeTruthy();

        await waitFor(() => {
            fireEvent.click(StayLoggedIn);
        }); 
    });
});

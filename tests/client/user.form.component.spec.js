import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { Provider } from 'react-redux';
import { ToastProvider } from 'react-toast-notifications';
import store from '../../src/modules/core/client/store';
import UserForm from '../../src/modules/platform/user/client/components/user-form.component';
import { login } from '../../src/modules/platform/user/client/user.actions';

configure({ adapter: new Adapter() });

jest.setTimeout(20000);

describe('UserForm component', () => {
    let mockAxios;
    let savedUser;
    let roles;
    let applications;
    let profiles;

    beforeEach( async () => {
        mockAxios = new MockAdapter(axios);

        savedUser = {
            "applications": [],
            "countries": [],
            "email": "test@gmail.com",
            "name": "a",
            "serviceCategories": [],
            "services": []
        };
        mockAxios.onPost('/api/login').reply(200, savedUser);

        await store.dispatch(login({
            email: 'test@gmail.com',
            password: 'test'
        }));

        await store.dispatch(
            {
                type: 'GET_COUNTRIES',
                payload: Promise.resolve({
                    data: [
                        {
                            codbase: "WUK",
                            codbase_desc: "Ireland",
                            country_iso2: "IE",
                            country_iso3: "IRL",
                            countryid: 1,
                            countryname: "Ireland"
                        }
                    ]
                })
            }
        );

        roles = [{ id: 1, name: 'role-test', slug: 'role-test'}]
        applications = [{ id: 1, name: "application-test", email: "a@glpg.com", is_active : true, slug: "application-test" }];
        profiles = [{ id: 1, title: 'System Admin Profile' }];

        mockAxios.onGet('/api/applications').reply(200, applications);
        mockAxios.onGet('/api/roles').reply(200, roles);
        mockAxios.onGet('/api/profiles').reply(200, profiles);
    });

    const userSlice = () => store.getState().userReducer;

    const wrapperComponent = () => (
        <Provider store={store}>
            <MemoryRouter>
                <ToastProvider>
                    <UserForm />
                </ToastProvider>
            </MemoryRouter>
        </Provider>
    );

    it('Should render UserForm component', () => {
        const wrapper = shallow(wrapperComponent());
        expect(wrapper.exists()).toBe(true);
    });

    it('should set user', async () => {
        expect(userSlice().loggedInUser).toEqual(savedUser);
    });

    it('Should fill out all the input fields', async () => {
        const { getByTestId, getByText, container } = render(wrapperComponent());

        const first_name = await waitFor(() => getByTestId('first_name'));
        const last_name = await waitFor(() => getByTestId('last_name'));
        const email = await waitFor(() => getByTestId('email'));
        const phone = await waitFor(() => getByTestId('phone'));

        await waitFor(() => {
            fireEvent.change(first_name, { target: { value: 'a' } });
            fireEvent.change(last_name, { target: { value: 'a' } });
            fireEvent.change(email, { target: { value: 'a' } });
            fireEvent.change(phone, { target: { value: 'a' } });
        });

        expect(first_name.value).toEqual('a');
        expect(last_name.value).toEqual('a');
        expect(email.value).toEqual('a');
        expect(phone.value).toEqual('a');
    });
});

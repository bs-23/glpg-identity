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
import UserForm from '../../src/modules/user/client/components/user-form.component';
import { login } from '../../src/modules/user/client/user.actions';

configure({ adapter: new Adapter() });

describe('UserForm component', () => {
    let mockAxios;
    let savedUser;
    let countries;
    let roles;
    let applications;

    beforeEach( async () => {
        mockAxios = new MockAdapter(axios);

        savedUser = { name: 'a', email: 'test@gmail.com'};
        mockAxios.onPost('/api/login').reply(200, savedUser);

        await store.dispatch(login({
            email: 'test@gmail.com',
            password: 'test'
        }));


        countries = [{ countryid: 1, country_iso2: "IE", country_iso3: "IRL", codbase: "WUK", codbase_desc: 'Ireland', countryname: "Ireland"}]
        roles = [{ id: 1, name: 'role-test', slug: 'role-test'}]
        applications = [{ id: 1, name: "application-test", email: "a@glpg.com", is_active : true, slug: "application-test" }];

        mockAxios.onGet('/api/applications').reply(200, applications);
        mockAxios.onGet('/api/countries').reply(200, countries);
        mockAxios.onGet('/api/roles').reply(200, roles)
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
        const countryBtn = await waitFor(() => getByText('Ireland'));
        const roleBtn = await waitFor(() => getByText('role-test'));

        await waitFor(() => {
            fireEvent.change(first_name, { target: { value: 'a' } });
            fireEvent.change(last_name, { target: { value: 'a' } });
            fireEvent.change(email, { target: { value: 'a' } });
            fireEvent.change(phone, { target: { value: 'a' } });
            fireEvent.click(countryBtn);
            fireEvent.click(roleBtn);
        });

        // console.log("=======================>", countryBtn, "      ", countryBtn.textContent)

        expect(first_name.value).toEqual('a');
        expect(last_name.value).toEqual('a');
        expect(email.value).toEqual('a');
        expect(phone.value).toEqual('a');
    });
});

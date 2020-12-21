import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { Provider } from 'react-redux';
import axios from 'axios'
import { BrowserRouter } from 'react-router-dom';
import MockAdapter from 'axios-mock-adapter'
import { ToastProvider } from 'react-toast-notifications';
import store from '../../src/modules/core/client/store.js';
import SearchProfessionalHcp from '../../src/modules/hcp/client/components/search-professional-hcp.component';
import { act } from 'react-dom/test-utils';
import { screen } from '@testing-library/dom'
import { login } from '../../src/modules/platform/user/client/user.actions';

configure({ adapter: new Adapter() });

describe('Search hcp professional component', () => {
    let mockAxios;
    let savedUser;

    beforeEach( async () => {
        mockAxios = new MockAdapter(axios);

        savedUser = {
            "applications": [],
            "countries": [],
            "email": "test@gmail.com",
            "name": "a",
            "serviceCategories": []
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

        await store.dispatch(
            {
                type: 'GET_ALL_COUNTRIES',
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
    });

    const userSlice = () => store.getState().userReducer;

    const wrapperComponent = () => (
        <BrowserRouter>
            <ToastProvider>
                <Provider store={store}>
                    <SearchProfessionalHcp/>
                </Provider>
            </ToastProvider>
        </BrowserRouter>
    );

    it('Should render the search hcp professional component', () => {
        const wrapper = shallow(wrapperComponent());
        expect(wrapper.exists()).toBe(true);
    });

    it('should set user', async () => {
        expect(userSlice().loggedInUser).toEqual(savedUser);
    });

    it('should exist some texts', async () => {
        // const { debug, container, getAllByText, getByText } =
        render(wrapperComponent());
        expect(screen.getByText('OKLA Search')).toBeTruthy();
        expect(screen.getByText('Countries')).toBeTruthy();
        expect(screen.getByText('In My Contract')).toBeTruthy();
        expect(screen.getByText('Phonetic')).toBeTruthy();
        expect(screen.getByText('Duplicates')).toBeTruthy();
        expect(screen.getByText('Individual')).toBeTruthy();
        expect(screen.getByText('First Name')).toBeTruthy();
        expect(screen.getByText('Last Name')).toBeTruthy();
        expect(screen.getByText('Specialty')).toBeTruthy();
        expect(screen.getByText('Workplace')).toBeTruthy();
        expect(screen.getByText('Address Label')).toBeTruthy();
        expect(screen.getByText('City')).toBeTruthy();
        expect(screen.getByText('Postal Code')).toBeTruthy();
        expect(screen.getByText('Identifiers')).toBeTruthy();
        expect(screen.getByText('Onekey ID')).toBeTruthy();
        expect(screen.getByText('Individual - Identifier')).toBeTruthy();
        expect(screen.getByText('CLEAR')).toBeTruthy();
        expect(screen.getByText('SEARCH')).toBeTruthy();
    });

    it('should reset fields', async () => {
        const { debug, container } = render(wrapperComponent());
        const last_name = container.querySelector('input[name="lastName"]');
        const clear_btn = screen.getByText('CLEAR');

        await waitFor(() => {
            fireEvent.change(last_name, { target: { value: 'a' } });
        });

        expect(last_name.value).toEqual('a');

        await waitFor(() => {
            fireEvent.click(clear_btn);
        });

        expect(last_name.value).toEqual('');
    });
});

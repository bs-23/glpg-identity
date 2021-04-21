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
import { ConsentCategories } from '../../src/modules/privacy/';
import { categoryActions } from '../../src/modules/privacy/';
import { act } from 'react-dom/test-utils';
import { screen } from '@testing-library/dom'
import { login } from '../../src/modules/platform/user/client/user.actions';

configure({ adapter: new Adapter() });

jest.setTimeout(20000);

describe('Consent categories component', () => {
    let mockAxios;
    let savedUser;
    let consent_categories;

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

        consent_categories = [{
            "id": "1",
            "title": "a",
            "slug": "a",
            "created_at": "2020-12-17T19:10:50.695Z",
            "updated_at": "2020-12-17T19:10:50.695Z",
            "createdBy": "a"
        }]
        mockAxios.onGet('/api/privacy/consent-categories').reply(200, consent_categories);

        await store.dispatch(categoryActions.getConsentCategories());

        const category = {
            id: "1",
            title: "a",
            slug: "a"
        };
        const created_category = {
            id: "2",
            title: "cc",
            slug: "cc109",
            created_by: "101",
            updated_by: "101",
            updated_at: "2021-01-04T11:12:27.349Z",
            created_at: "2021-01-04T11:12:27.349Z",
            createdBy: "test_user"
        }
        const updated_category = {
            id: "1",
            title: "bb",
            slug: "bb109",
        }
        mockAxios.onGet('/api/privacy/consent-categories/1').reply(200, category);
        mockAxios.onPost('/api/privacy/consent-categories').reply(200, created_category);
        mockAxios.onPut('/api/privacy/consent-categories/1').reply(200, updated_category);
    });

    const userSlice = () => store.getState().userReducer;

    const wrapperComponent = () => (
        <BrowserRouter>
            <ToastProvider>
                <Provider store={store}>
                    <ConsentCategories/>
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
        render(wrapperComponent());

        await waitFor(async () => {
            expect(screen.getByText('Create new category')).toBeTruthy();
            expect(screen.getByText('Title')).toBeTruthy();
            expect(screen.getByText('Slug')).toBeTruthy();
            expect(screen.getByText('Created By')).toBeTruthy();
            expect(screen.getByText('Created Date')).toBeTruthy();
            expect(screen.getByText('Action')).toBeTruthy();
        });
    });

    it('should create category', async () => {
        const {debug} = render(wrapperComponent());

        await waitFor(async () => {
            const edit_btn = screen.getByText('Create new category');
            fireEvent.click(edit_btn);
        });

        const title_input = screen.getByRole('textbox', { name: 'title' });
        const save_btn = screen.getByRole('button', { name: 'Save changes' });

        fireEvent.change(title_input, { target: { value: 'cc' } });

        await waitFor(async () => {
            fireEvent.click(save_btn);
        });

        expect(screen.getByText('cc')).toBeTruthy();
        expect(screen.getByText('cc109')).toBeTruthy();
        expect(screen.getByText('test_user')).toBeTruthy();
    });

    it('should edit category', async () => {
        const {debug} = render(wrapperComponent());

        await waitFor(async () => {
            const edit_btn = screen.getByText('Edit');
            fireEvent.click(edit_btn);
        });

        const title_input = screen.getByRole('textbox', { name: '' });
        const save_btn = screen.getByRole('button', { name: 'Save changes' });

        fireEvent.change(title_input, { target: { value: 'bb' } });

        await waitFor(async () => {
            fireEvent.click(save_btn);
        });

        expect(screen.getByText('bb')).toBeTruthy();
        expect(screen.getByText('bb109')).toBeTruthy();
    });
});

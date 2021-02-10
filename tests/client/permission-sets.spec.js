import React from 'react';
import { render, waitFor, fireEvent, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { ToastProvider } from 'react-toast-notifications';
import { Provider } from 'react-redux';
import store from '../../src/modules/core/client/store';
import { ManagePermissionSets } from '../../src/modules/platform';

describe('Permission sets component', () => {
    let fakeAxios;

    beforeAll(async () => {
        fakeAxios = new MockAdapter(axios);

        const permissionSets = [
            {
                "id":"e6ac08ec-337b-4fde-9ae4-b155b906b7ad",
                "slug":"system_admin",
                "title":"System Admin Permission Set",
                "type":"standard",
                "countries":["BE","FR","DE","IT","NL","ES","GB"],
                "description":"This is the default permission set for System Admin",
                "application_id":null
            }
        ];

        fakeAxios.onGet('/api/permissionSets').reply(200, permissionSets);

        fakeAxios.onGet('/api/applications').reply(200, [{
            "id": "3252888b-530a-441b-8358-3e423dbce08a",
            "name": "HCP Portal",
            "email": "hcp-portal@glpg.com",
            "is_active": true,
            "slug": "hcp-portal"
        }]);

        fakeAxios.onGet('/api/serviceCategories').reply(200, [{
            "id": "6ae61e07-c7b2-4c95-addb-e985eeab2202",
            "title": "Management of Customer Data Platform",
            "slug": "platform"
        }]);
    });

    const wrapperComponent = () => (
        <Provider store={store}>
            <MemoryRouter>
                <ToastProvider>
                    <ManagePermissionSets/>
                </ToastProvider>
            </MemoryRouter>
        </Provider>
    );

    it('should render table', async () => {
        const { getByTestId, container, getByText } = render(wrapperComponent());

        await waitFor(() => {
            const tbody = container.querySelector('tbody');
            expect(tbody).toBeTruthy();
            expect(tbody.childElementCount).toBe(1);
        });

        const title = await waitFor(() => getByText('System Admin Permission Set'));
        expect(title).toBeTruthy();
    });

    it('should open permission set form', async () => {
        const { getByTestId, container, getByText } = render(wrapperComponent());

        const add_new_ps_button = await waitFor(() => getByText('Add New Permission Set'));

        expect(add_new_ps_button).toBeTruthy();

        fireEvent.click(add_new_ps_button);

        const modal_label = await waitFor(() => getByText('Create New Permission Set'));

        expect(modal_label).toBeTruthy();
    });

});

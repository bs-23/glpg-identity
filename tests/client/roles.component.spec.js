import React from 'react';
import { render, waitFor, fireEvent, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { ToastProvider } from 'react-toast-notifications';
import { Provider } from 'react-redux';
import store from '../../src/modules/core/client/store';
import { ManageRoles } from '../../src/modules/platform';

describe('Roles component', () => {
    let fakeAxios;

    beforeAll(async () => {
        fakeAxios = new MockAdapter(axios);

        const roles = [{
            "id": "24232d04-ced4-4b5b-9259-efee18577b6c",
            "title": "System Admin",
            "slug": "system_admin",
            "description": "This is the default profile for System Admin",
            "type": "standard"
        }];

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

        fakeAxios.onGet('/api/roles').reply(200, roles);
        fakeAxios.onGet('/api/permissionSets').reply(200, permissionSets);
    });

    const wrapperComponent = () => (
        <Provider store={store}>
            <MemoryRouter>
                <ToastProvider>
                    <ManageRoles/>
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

        const title = await waitFor(() => getByText('System Admin'));
        expect(title).toBeTruthy();
    });

    it('should open role form', async () => {
        const { getByTestId, container, getByText } = render(wrapperComponent());

        const edit_button = await waitFor(() => getByText('Edit'));

        expect(edit_button).toBeTruthy();

        fireEvent.click(edit_button);

        const update_profile = await waitFor(() => getByText('Update Role'));

        expect(update_profile).toBeTruthy();
    });

});

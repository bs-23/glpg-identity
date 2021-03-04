import React from 'react';
import { render, waitFor, fireEvent, screen, act } from '@testing-library/react';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { ToastProvider } from 'react-toast-notifications';
import { Provider } from 'react-redux';
import store from '../../src/modules/core/client/store';
import { HCPUsers } from '../../src/modules/information/';
import { login } from '../../src/modules/platform/user/client/user.actions';
import { getHcpProfiles } from '../../src/modules/information/hcp/client/hcp.actions';

configure({ adapter: new Adapter() });

jest.setTimeout(20000);

describe('Hcp user component', () => {
    let fakeAxios;
    let savedUser;
    let data;
    let countries;

    beforeAll(async () => {
        fakeAxios = new MockAdapter(axios);
        window.alert = jest.fn();

        savedUser = {
            "applications": [],
            "countries": [],
            "email": "test@gmail.com",
            "name": "a",
            "serviceCategories": [],
            "services": []
        };
        fakeAxios.onPost('/api/login').reply(200, savedUser);

        await store.dispatch(login({
            email: 'test@gmail.com',
            password: 'test'
        }));

        data = {
            data: {
                users: [
                    { id: '1', first_name: 'aa', last_name: 'aa', email: 'aa@gmail.com', telephone: '1', uuid: '1', status: 'not_verified', opt_types: ['double-opt-in'], country_iso2: 'IR', specialty_onekey: 'WK' },
                    { id: '2', first_name: 'bb', last_name: 'bb', email: 'bb@gmail.com', telephone: '2', uuid: '2', status: 'not_verified', opt_types: ['double-opt-in'], country_iso2: 'IR', specialty_onekey: 'WK' },
                    { id: '3', first_name: 'cc', last_name: 'cc', email: 'cc@gmail.com', telephone: '3', uuid: '3', status: 'manually_verified', opt_types: ['double-opt-in'], country_iso2: 'IR',  specialty_onekey: 'WK' }
                ],
                country_iso2: null,
                end: 1,
                limit: 1,
                page: 2,
                start: 1,
                status: null,
                total: 2,
                countries: [ 'IE' ],
            }
        };

        const updated_field = {"data":[{"rowIndex":2,"property":"first_name","value":"THOMAS"}],"errors":[]}

        fakeAxios.onPost('/api/hcps').reply(200, data);
        fakeAxios.onPost('/api/hcps?').reply(200, data);
        fakeAxios.onPost(`/api/hcps?page=${1}`).reply(200, data);
        fakeAxios.onPost(`/api/hcps?page=${2}`).reply(200, data);
        fakeAxios.onPost(`/api/hcps?page=${3}`).reply(200, data);
        fakeAxios.onGet('/api/hcp-profiles/1/consents').reply(200, []);
        fakeAxios.onPut('/api/hcp-profiles/update-hcps').reply(200, updated_field);

        await store.dispatch(getHcpProfiles());

        countries = [ { countryid: 1, country_iso2: "IE", country_iso3: "IRL", codbase: "WUK", countryname: "Ireland"} ]
        fakeAxios.onGet('/api/countries').reply(200, countries);
        fakeAxios.onGet('/api/all_countries').reply(200, countries);

        fakeAxios.onPut(`/api/hcp-profiles/${1}/approve`).reply(200);
    });

    const userSlice = () => store.getState().userReducer;
    const hcpUserSlice = () => store.getState().hcpReducer;

    const wrapperComponent = () => (
        <Provider store={store}>
            <MemoryRouter>
                <ToastProvider>
                    <HCPUsers />
                </ToastProvider>
            </MemoryRouter>
        </Provider>
    );

    it('Should render hcp-user component', () => {
        const wrapper = shallow(wrapperComponent());
        expect(wrapper.exists()).toBe(true);
    });

    it('should set user', async () => {
        expect(userSlice().loggedInUser).toEqual(savedUser);
    });

    it('should set hcp users', async () => {
        expect(hcpUserSlice().hcps).toEqual(data.data);
    })

    it('should render table', async () => {
        const { getByTestId, container } = render(wrapperComponent());
        const table = await waitFor(() => container.querySelector('table'));
        const thead = await waitFor(() => container.querySelector('thead'));
        const tbody = await waitFor(() => container.querySelector('tbody'));

        expect(table).toBeTruthy();
        expect(thead).toBeTruthy();
        expect(tbody).toBeTruthy();
        expect(tbody.childElementCount).toBe(3);
    });

    it('should paginate hcp users data', async () => {
        const { getByTestId, getByText, container } = render(wrapperComponent());
        const nextBtn = await waitFor(() => getByTestId('Next'));

        await waitFor(() => fireEvent.click(nextBtn));

        const prevBtn = await waitFor(() => getByTestId('Prev'));
        await waitFor(() => fireEvent.click(prevBtn));

        const tbody = await waitFor(() => container.querySelector('tbody'));
        const rows = tbody.childNodes;
        const first_row = rows[0];
        const tds = first_row.childNodes;
        const first_td = tds[0];

        expect(first_td.textContent).toEqual('aa@gmail.com');
    });

    // it('should update status of a hcp user', async () => {
    //     const { debug, getByTestId, getByText, container } = render(wrapperComponent());
    //     const tbody = await waitFor(() => container.querySelector('tbody'));
    //     const rows = tbody.childNodes;
    //     const first_row = rows[0];
    //     const actionBtn = first_row.lastChild.childNodes[0].childNodes[0].childNodes[0];

    //     fireEvent.click(actionBtn);

    //     const updateBtn = await waitFor(() => getByText('Manage Status'));

    //     fireEvent.click(updateBtn);

    //     const approveBtn = await waitFor(() => getByText('Approve User'));

    //     const submitBtn = await waitFor(() => getByTestId('submit'));

    //     await waitFor(() => fireEvent.click(approveBtn));

    //     await waitFor(() => fireEvent.click(submitBtn));

    // });

    it('should show HCP user details modal', async () => {
        const { debug, getByTestId, getByText, container } = render(wrapperComponent());
        const tbody = await waitFor(() => container.querySelector('tbody'));
        const rows = tbody.childNodes;
        const first_row = rows[0];

        const actionBtn = first_row.lastChild.childNodes[0].childNodes[0].childNodes[0];

        fireEvent.click(actionBtn);

        const profileDetailsBtn = await waitFor(() => getByText('Profile'));

        fireEvent.click(profileDetailsBtn);

        const profileDetailsModal = await waitFor(() => getByText('Profile Details'));

        const nameField = profileDetailsModal.parentNode.parentNode.lastChild.firstChild.firstChild.firstChild.firstChild;

        expect(nameField.textContent).toEqual('aa aa');
    });

    it('should edit and save changes', async () => {
        const { getByText, container } = render(wrapperComponent());
        const tbody = await waitFor(() => container.querySelector('tbody'));
        const rows = tbody.childNodes;
        const third_row = rows[2];
        const third_row_first_name = third_row.childNodes[2];

        fireEvent.mouseOver(third_row_first_name);

        const edit_icon = third_row_first_name.firstChild.lastChild;

        expect(edit_icon).toBeTruthy();

        fireEvent.click(edit_icon);

        const first_name_input = await waitFor(() => container.querySelector('input[name="rows[2].first_name"]'));
        expect(first_name_input).toBeTruthy();

        fireEvent.change(first_name_input, { target: { value: 'ChangedFirstName' } });

        fireEvent.keyDown(first_name_input, { key: 'Enter', code: 'Enter' });

        const changed_first_name = await waitFor(() => getByText('ChangedFirstName'));
        expect(changed_first_name).toBeTruthy();

        const save_changes = third_row.lastChild.childNodes[0].childNodes[0].childNodes[0];

        fireEvent.click(save_changes);

        const change_confirmation = await waitFor(() => getByText('Change Confirmation'))

        expect(change_confirmation).toBeTruthy();

        const change_confirmation_modal = change_confirmation.parentNode.parentNode;
        const change_confirmation_textarea = change_confirmation_modal.childNodes[1].firstChild.childNodes[1].childNodes[1].firstChild;

        fireEvent.change(change_confirmation_textarea, { target: { value: 'First name changed' } });

        const submit_button = change_confirmation_modal.childNodes[1].firstChild.childNodes[1].childNodes[2];

        fireEvent.click(submit_button);

        const res = await waitFor(() => getByText('THOMAS'));

        expect(res).toBeTruthy();
    });
});

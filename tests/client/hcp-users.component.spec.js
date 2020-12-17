import React from 'react';
import { render, waitFor, fireEvent, screen } from '@testing-library/react';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { ToastProvider } from 'react-toast-notifications';
import { Provider } from 'react-redux';
import store from '../../src/modules/core/client/store';
import HcpUser from '../../src/modules/hcp/client/components/hcp-users';
import { login } from '../../src/modules/platform/user/client/user.actions';
import { getHcpProfiles } from '../../src/modules/hcp/client/hcp.actions'

configure({ adapter: new Adapter() });

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
            "serviceCategories": []
        }
        fakeAxios.onPost('/api/login').reply(200, savedUser);

        await store.dispatch(login({
            email: 'test@gmail.com',
            password: 'test'
        }));

        data = {
            data: {
                users: [
                    { id: '1', first_name: 'a', last_name: 'a', email: 'a', telephone: '1', uuid: '1', status: 'not_verified', opt_types: ['double-opt-in'] },
                    { id: '2', first_name: 'b', last_name: 'b', email: 'b', telephone: '2', uuid: '2', status: 'not_verified', opt_types: ['double-opt-in'] }
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

        const status = null, country_iso2 = null;
        fakeAxios.onGet('/api/hcps').reply(200, data);
        fakeAxios.onGet('/api/hcps?page=1').reply(200, data);
        fakeAxios.onGet(`/api/hcps?page=${1}`).reply(200, data);
        fakeAxios.onGet(`/api/hcps?page=${2}`).reply(200, data);
        fakeAxios.onGet(`/api/hcps?page=${3}`).reply(200, data);
        fakeAxios.onGet('api/hcp-profiles/1/consents').reply(200, []);
        await store.dispatch(getHcpProfiles(1, status, country_iso2));

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
                    <HcpUser/>
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
        expect(tbody.childElementCount).toBe(2);
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

        expect(first_td.textContent).toEqual('a');
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

        expect(nameField.textContent).toEqual('a a');
    });
});

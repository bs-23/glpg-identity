import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

import { Provider } from 'react-redux';
import store from '../../src/modules/core/client/store';
import HcpUser from '../../src/modules/hcp/client/components/hcp-users';
import { login } from '../../src/modules/user/client/user.actions';
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

        savedUser = { name: 'a', email: 'test@gmail.com'};
        fakeAxios.onPost('/api/login').reply(200, savedUser);

        await store.dispatch(login({
            email: 'test@gmail.com',
            password: 'test'
        }));

        data = {
            data: {
                users: [
                    { id: '1', first_name: 'a', last_name: 'a', email: 'a', telephone: '1', uuid: '1' },
                    { id: '2', first_name: 'b', last_name: 'b', email: 'b', telephone: '2', uuid: '2' }
                ],
                countries: [ 'IE' ]
            }
        };
        const page = 1, status = null, country_iso2 = null;
        fakeAxios.onGet(`/api/hcps?page=${page}&status=${status}&country_iso2=${country_iso2}`).reply(200, data);
        await store.dispatch(getHcpProfiles(page, status, country_iso2));


        countries = [ { countryid: 1, country_iso2: "IE", country_iso3: "IRL", codbase: "WUK", countryname: "Ireland"} ]
        fakeAxios.onGet('/api/countries').reply(200, countries);
    });

    const userSlice = () => store.getState().userReducer;
    const hcpUserSlice = () => store.getState().hcpReducer;

    const wrapperComponent = () => (
        <Provider store={store}>
            <MemoryRouter>
                <HcpUser/>
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
        const table = container.querySelector('table');
        const thead = container.querySelector('thead');
        const tbody = container.querySelector('tbody');
        // const a = getByTestId('aaaaaaaaa');
        expect(table).toBeTruthy();
        expect(thead).toBeTruthy();
        expect(tbody).toBeTruthy();
        expect(tbody.childElementCount).toBe(2);
    })

    // it('should sort table data by first name', async () => {
    //     const { container, getByText } = render(wrapperComponent());
    //     const tbody = container.querySelector('tbody');
    //     const first_name = getByText('Firstname');
    //     const span = first_name.querySelector('span');
    //     const buttons = span.childNodes;
    //     const dsc_button = buttons[1];


    //     await waitFor(() => {
    //         fireEvent.click(dsc_button);
    //     });


    //     const rows = tbody.childNodes;
    //     const first_row = rows[0];
    //     const tds = first_row.childNodes;
    //     const first_td = tds[0];

    //     expect(first_td.textContent).toEqual('b');
    // })

    // it('should not update firstname of hcp user', async () => {
    //     const { container } = render(wrapperComponent());
    //     const tbody = container.querySelector('tbody');
    //     const first_row = tbody.childNodes[0];
    //     const action_td = first_row.childNodes[6];
    //     const span = action_td.querySelector('span');
    //     const edit_btn = span.childNodes[0];

    //     const first_name = first_row.childNodes[0];

    //     await waitFor(() => {
    //         fireEvent.click(edit_btn);
    //     });

    //     const new_tbody = container.querySelector('tbody');
    //     const new_first_row = new_tbody.childNodes[0];
    //     const new_action_td = new_first_row.childNodes[6];
    //     const cancel_btn = new_action_td.childNodes[1];

    //     await waitFor(() => {
    //         fireEvent.click(cancel_btn);
    //     });

    //     const new_first_name = new_first_row.childNodes[0];


    //     expect(first_name.textContent).toEqual(new_first_name.textContent);
    // })

    // it('should update firstname, lastname and phone of hcp user', async () => {
    //     const { container } = render(wrapperComponent());
    //     const tbody = container.querySelector('tbody');
    //     const first_row = tbody.childNodes[0];
    //     const action_td = first_row.childNodes[6];
    //     const span = action_td.querySelector('span');
    //     const edit_btn = span.childNodes[0];

    //     await waitFor(() => {
    //         fireEvent.click(edit_btn);
    //     });

    //     const new_tbody = container.querySelector('tbody');
    //     const new_first_row = new_tbody.childNodes[0];
    //     const first_name_td = new_first_row.childNodes[0];
    //     const last_name_td = new_first_row.childNodes[2];
    //     const phone_td = new_first_row.childNodes[3];
    //     const new_action_td = new_first_row.childNodes[6];
    //     const update_btn = new_action_td.childNodes[0];

    //     const first_name_input = first_name_td.childNodes[0];
    //     const last_name_input = last_name_td.childNodes[0];
    //     const phone_input = phone_td.childNodes[0];

    //     await waitFor(() => {
    //         fireEvent.change(first_name_input, { target: { value: 'z' } });
    //         fireEvent.change(last_name_input, { target: { value: 'z' } });
    //         fireEvent.change(phone_input, { target: { value: '0' } });
    //     })

    //     expect(first_name_input.value).toEqual('z');
    //     expect(last_name_input.value).toEqual('z');
    //     expect(phone_input.value).toEqual('0');


    //     const updated_hcp_user = { id: "1", uuid: "1", first_name: "z", last_name: "z", email: "a", telephone: "0" };
    //     fakeAxios.onPut(`/api/hcps/${'1'}`).reply(200, updated_hcp_user);

    //     await waitFor(() => {
    //         fireEvent.click(update_btn);
    //     });

    //     const updated_tbody = container.querySelector('tbody');
    //     const updated_first_row = updated_tbody.childNodes[0];
    //     const updated_first_name = updated_first_row.childNodes[0];
    //     const updated_last_name = updated_first_row.childNodes[2];
    //     const updated_phone = updated_first_row.childNodes[3];

    //     expect(updated_first_name.textContent).toEqual('z');
    //     expect(updated_last_name.textContent).toEqual('z');
    //     expect(updated_phone.textContent).toEqual('0');
    // })
});

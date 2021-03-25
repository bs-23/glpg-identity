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
import { screen } from '@testing-library/dom';
import { getSignedInUserProfile } from '../../src/modules/platform/user/client/user.actions';
import MyProfile from '../../src/modules/platform/user/client/components/my-profile/my-profile.component';

configure({ adapter: new Adapter() });

jest.setTimeout(20000);

describe('Users component', () => {
    let mockAxios;
    let loggedInUser;

    beforeAll(async () => {
        mockAxios = new MockAdapter(axios);

        loggedInUser = {
            "id":"816a8fe8-27ee-471e-8363-799acab7b233",
            "first_name":"FirstName",
            "last_name":"LastName",
            "email":"email@gmail.com",
            "phone":"+3201674737282",
            "type":"basic",
            "status":"active",
            "roles":[
                {"title":"Data Privacy Officer","permissions":["privacy"]}
            ],
            "application":{
                "name":"Jyseleca","slug":"jyseleca",
                "logo_link":"https://cdp-development.s3.eu-central-1.amazonaws.com/jyseleca/logo.png"
            },
            "countries":["BE"],
            "last_login":"2020-10-09T03:47:45.000Z",
            "expiry_date":null
        }

        const countries = [
            { countryid: 0, codbase: null, country_iso2: null, countryname: '', codbase_desc: 'null' },
            { countryid: 1, codbase: 'WBE',  country_iso2: 'BE', countryname: 'Belgium', codbase_desc: 'Belgium' }
        ]

        mockAxios.onGet('/api/users/profile').reply(200, loggedInUser);
        mockAxios.onGet('/api/countries').reply(200, countries);
        await store.dispatch(getSignedInUserProfile());
    });

    const wrapperComponent = () => (
        <Provider store={store}>
            <MemoryRouter>
                <ToastProvider>
                    <MyProfile />
                </ToastProvider>
            </MemoryRouter>
        </Provider>
    );

    it('Should render my profile component', async () => {
        const { container, getAllByText, getByText } = render(wrapperComponent());

        const first_name_input = container.querySelector('input[name="first_name"]');
        const update_button = getByText('Update');

        fireEvent.change(first_name_input, { target: { value: 'NewFirstName' } });
        expect(first_name_input.value).toEqual('NewFirstName');

        mockAxios.onPut('/api/users/profile').reply(200, {...loggedInUser, first_name: 'NewFirstName'});

        fireEvent.click(update_button);

        await waitFor(() =>{
            const allNameInstances = screen.getAllByText('NewFirstName LastName');
            debug(allNameInstances);
            expect(allNameInstances).toBeTruthy();
        });
    });
});

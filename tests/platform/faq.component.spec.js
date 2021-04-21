import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import MockAdapter from 'axios-mock-adapter';
import { ToastProvider } from 'react-toast-notifications';
import store from '../../src/modules/core/client/store';
import Faq from '../../src/modules/platform/faq/client/faq.component';
import { act } from 'react-dom/test-utils';
import { screen } from '@testing-library/dom'
import { login } from '../../src/modules/platform/user/client/user.actions';


configure({ adapter: new Adapter() });

jest.setTimeout(20000);

describe('Manage Faq component', () => {
    let fakeAxios;
    let savedUser;

    beforeAll(async () => {
        fakeAxios = new MockAdapter(axios);

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

        const faqs = {
            "faq": [{
                "id": "6a98a866-1902-4396-9d38-77eb06c22dda",
                "question": "Key Benefits of a CDP",
                "answer": "&lt;p&gt;CDPs improve your organization, better your customer relationships, and complement your current software and marketing efforts. Here are a handful of key benefits of having a CDP.&lt;&#x2F;p&gt;",
                "topics": ["general-information"],
                "createdBy": "System Admin",
            }, {
                "id": "35dc23d0-2f38-42b5-b1d6-b5cb76ff3907",
                "question": "Data Collection",
                "answer": "&lt;p&gt;The main advantage of a CDP is its ability to collect data from a variety of sources (both online and offline, with a variety of formats and structures) and convert that disparate data into a standardized form.&lt;&#x2F;p&gt;",
                "topics": ["general-information"],
                "createdBy": "System Admin",
            }],
            "metadata": {
                "page": 1,
                "limit": 30,
                "total": 4,
                "start": 1,
                "end": 2,
                "topic": null
            }
        }


        const filteredFaqs = {
            "faq": [{
                "id": "6a98a866-1902-4396-9d38-77eb06c22dda",
                "question": "Key Benefits of a CDP",
                "answer": "&lt;p&gt;CDPs improve your organization, better your customer relationships, and complement your current software and marketing efforts. Here are a handful of key benefits of having a CDP.&lt;&#x2F;p&gt;",
                "topics": ["general-information"],
                "createdBy": "System Admin",
            }],
            "metadata": {
                "page": 1,
                "limit": 30,
                "total": 4,
                "start": 1,
                "end": 1,
                "topic": 'general-information'
            }
        }


        fakeAxios.onGet('/api/faq?page=1&topic=general-information&limit=5').reply(200, filteredFaqs);
    });

    const userSlice = () => store.getState().userReducer;

    const wrapperComponent = () => (
        <BrowserRouter>
            <ToastProvider>
                <Provider store={store}>
                    <Faq topic="general-information" page={1} />
                </Provider>
            </ToastProvider>
        </BrowserRouter>
    );


    it('Should render Faq component', () => {
        const wrapper = shallow(wrapperComponent());
        expect(wrapper.exists()).toBe(true);
    });

    it('should set user', async () => {
        expect(userSlice().loggedInUser).toEqual(savedUser);
    });

    it('should render list', async () => {
        const { debug, getByTestId, container, getByText } = render(wrapperComponent());

        const faqHeader = await waitFor(() => getByText('Questions You May Have'));
        expect(faqHeader).toBeTruthy();

        await waitFor(() => {
            const faqBody = container.querySelector('div[class="faq__body accordion"]');
            expect(faqBody).toBeTruthy();
            expect(faqBody.childElementCount).toBe(1);
        });
    });
});

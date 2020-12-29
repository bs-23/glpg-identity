import ManageFaq from '../../src/modules/platform/faq/client/manage-faq.component';
import Faq from '../../src/modules/platform/faq/client/faq.component';
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


configure({ adapter: new Adapter() });

describe('Manage Faq component', () => {
    let fakeAxios;

    beforeAll(async () => {
        fakeAxios = new MockAdapter(axios);

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

    const wrapperComponent = () => (
        <Provider store={store}>
            <MemoryRouter>
                <ToastProvider>
                    <Faq topic="general-information" page={1} />
                </ToastProvider>
            </MemoryRouter>
        </Provider>
    );

    it('Should render Faq component', () => {
        const wrapper = shallow(wrapperComponent());
        expect(wrapper.exists()).toBe(true);
    });

    it('should render list', async () => {
        const { getByTestId, container, getByText } = render(wrapperComponent());


        const faqHeader = await waitFor(() => getByText('Questions You May Have'));
        expect(faqHeader).toBeTruthy();

        await waitFor(() => {
            const faqBody = container.querySelector('div[class="faq__body accordion"]');
            expect(faqBody).toBeTruthy();
            expect(faqBody.childElementCount).toBe(1);
        });

    });


});

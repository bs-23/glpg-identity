import React from "react";
import { render, waitFor, fireEvent } from "@testing-library/react";
import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import axios from "axios";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import MockAdapter from "axios-mock-adapter";
import { ToastProvider } from "react-toast-notifications";
import store from "../../src/modules/core/client/store";
import ManageFaq from "../../src/modules/platform/faq/client/manage-faq.component";
import { act } from "react-dom/test-utils";
import { screen } from "@testing-library/dom";
import { login } from "../../src/modules/platform/user/client/user.actions";

configure({ adapter: new Adapter() });

describe("Manage Faq component", () => {
    let fakeAxios;
    let savedUser;

    beforeAll(async () => {
        fakeAxios = new MockAdapter(axios);

        savedUser = {
            "applications": [],
            "countries": [],
            "email": "test@gmail.com",
            "name": "a",
            "serviceCategories": []
        };
        fakeAxios.onPost('/api/login').reply(200, savedUser);

        await store.dispatch(login({
            email: 'test@gmail.com',
            password: 'test'
        }));

        const faqs = {
            faq: [
                {
                    id: "6a98a866-1902-4396-9d38-77eb06c22dda",
                    question: "Key Benefits of a CDP",
                    answer:
                        "&lt;p&gt;CDPs improve your organization, better your customer relationships, and complement your current software and marketing efforts. Here are a handful of key benefits of having a CDP.&lt;&#x2F;p&gt;",
                    topics: ["general-information"],
                    createdBy: "System Admin",
                },
                {
                    id: "35dc23d0-2f38-42b5-b1d6-b5cb76ff3907",
                    question: "Data Collection",
                    answer:
                        "&lt;p&gt;The main advantage of a CDP is its ability to collect data from a variety of sources (both online and offline, with a variety of formats and structures) and convert that disparate data into a standardized form.&lt;&#x2F;p&gt;",
                    topics: ["general-information"],
                    createdBy: "System Admin",
                },
            ],
            metadata: {
                page: 1,
                limit: 30,
                total: 4,
                start: 1,
                end: 2,
                topic: null,
            },
        };

        const faqCategories = [
            {
                category: "general",
                title: "General Information",
                slug: "general-information",
                icon: "fas fa-tachometer-alt fa-2x",
            },
            {
                category: "information",
                title: "Information Management",
                slug: "information-management",
                icon: "icon icon-information-management icon-2x",
            },
        ];

        const filteredFaqs = {
            faq: [
                {
                    id: "6a98a866-1902-4396-9d38-77eb06c22dda",
                    question: "Key Benefits of a CDP",
                    answer:
                        "&lt;p&gt;CDPs improve your organization, better your customer relationships, and complement your current software and marketing efforts. Here are a handful of key benefits of having a CDP.&lt;&#x2F;p&gt;",
                    topics: ["general-information"],
                    createdBy: "System Admin",
                },
            ],
            metadata: {
                page: 1,
                limit: 30,
                total: 4,
                start: 1,
                end: 1,
                topic: null,
            },
        };

        fakeAxios.onGet("/api/faq").reply(200, faqs);
        fakeAxios.onGet("/api/faq/category").reply(200, faqCategories);
        fakeAxios
            .onGet("/api/faq?page=1&topic=general-information")
            .reply(200, filteredFaqs);
    });

    const userSlice = () => store.getState().userReducer;

    const wrapperComponent = () => (
        <BrowserRouter>
            <ToastProvider>
                <Provider store={store}>
                    <ManageFaq />
                </Provider>
            </ToastProvider>
        </BrowserRouter>
    );

    it("should render table", async () => {
        const { getByTestId, container } = render(wrapperComponent());

        await waitFor(() => {
            const table = container.querySelector("table");
            expect(table).toBeTruthy();
        });

        await waitFor(() => {
            const tbody = container.querySelector("tbody");
            expect(tbody).toBeTruthy();
            expect(tbody.childElementCount).toBe(2);
        });
    });

    it('should set user', async () => {
        expect(userSlice().loggedInUser).toEqual(savedUser);
    });

    it("should filter faqs by topic", async () => {
        const { getByTestId, container, getByText, getAllByText } = render(
            wrapperComponent()
        );

        const filter_button = await waitFor(() =>
            getByText("Filter by Topics")
        );

        fireEvent.click(filter_button);

        let filter_option;

        await waitFor(() => {
            filter_option = getAllByText("General Information");
            expect(filter_option).toBeTruthy;
        });

        fireEvent.click(filter_option[0]);

        await waitFor(() => {
            const table = container.querySelector("table");
            expect(table).toBeTruthy();
        });

        await waitFor(() => {
            const tbody = container.querySelector("tbody");
            expect(tbody).toBeTruthy();
            expect(tbody.childElementCount).toBe(1);
        });

        const filtered_faq = await waitFor(() =>
            getByText("Key Benefits of a CDP")
        );

        expect(filtered_faq).toBeTruthy();
    });
});

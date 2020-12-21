// import React from 'react';
// import { render, waitFor, fireEvent, screen, act } from '@testing-library/react';
// import { MemoryRouter } from 'react-router-dom';
// import axios from 'axios'
// import MockAdapter from 'axios-mock-adapter'
// import { ToastProvider } from 'react-toast-notifications';
// import { Provider } from 'react-redux';
// import store from '../../src/modules/core/client/store';
// import { ManageFaq } from '../../src/modules/platform';

// describe('Manage FAQ component', () => {
//     let fakeAxios;

//     beforeAll(async () => {
//         fakeAxios = new MockAdapter(axios);

//         const faqList = {
//             "faq": [
//                 {
//                     "answer": "test answer",
//                     "createdBy": "System Admin",
//                     "created_at": "2020-12-18T08:27:45.169Z",
//                     "created_by": "4fd2b94c-a8b3-4664-9c3a-3d18196f59bc",
//                     "id": "5d694484-8cfe-46f5-8c1e-b6162d8ac791",
//                     "question": "test question",
//                     "topics": ["manage-faq"],
//                     "updatedBy": "System Admin",
//                     "updated_at": "2020-12-18T08:27:45.169Z",
//                     "updated_by": "4fd2b94c-a8b3-4664-9c3a-3d18196f59bc"
//                 }
//             ],
//             "metadata": {
//                 "end": 1,
//                 "limit": 30,
//                 "page": 1,
//                 "start": 1,
//                 "topic": null,
//                 "total": 1
//             }
//         };

//         fakeAxios.onGet('/api/faq').reply(200, faqList);
//     });

//     const wrapperComponent = () => (
//         <Provider store={store}>
//             <MemoryRouter>
//                 <ToastProvider>
//                     <ManageFaq />
//                 </ToastProvider>
//             </MemoryRouter>
//         </Provider>
//     );

//     it('should render table', async () => {
//         const { getByTestId, container, getByText } = render(wrapperComponent());

//         await waitFor(() => {
//             const tbody = container.querySelector('tbody');
//             //expect(tbody).toBeTruthy();
//             //  expect(tbody.childElementCount).toBe(1);
//         });

//         // const question = await waitFor(() => getByText('test question'));
//         // expect(question).toBeTruthy();
//     });

// });

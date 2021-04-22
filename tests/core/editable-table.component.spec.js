import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import EditableTable from '../../src/modules/core/client/components/EditableTable/EditableTable';

configure({ adapter: new Adapter() });

jest.setTimeout(20000);

describe('Forgot password component', () => {
    const wrapperComponent = () => {
        const rows = [
            { first_name: 'ABCD', last_name: 'abcd', email: 'abc@gmail.com' },
            { first_name: 'EFGH', last_name: 'efgh', email: 'abc@gmail.com' },
        ]

        const columns = [
            {
                id: 'first_name',
                name: 'First Name'
            },
            {
                id: 'last_name',
                name: 'Last Name'
            },
            {
                id: 'email',
                name: 'Email',
                fieldType: { name: 'email', maxLength: '100' },
            },
        ]

        return <EditableTable
            rows={rows}
            columns={columns}
            singleRowEditing={true}
            enableReinitialize
        ></EditableTable>
    }

    it('Should render an editable table', async () => {
        const { container, findByText } = render(wrapperComponent());

        const first_name = await findByText('ABCD');
        const last_name = await findByText('efgh');

        expect(first_name).toBeTruthy();
        expect(last_name).toBeTruthy();
    });

    it('Should edit a field in editable table', async () => {
        const { container, findByText } = render(wrapperComponent());

        const first_name = await findByText('ABCD');
        fireEvent.mouseOver(first_name);

        const click_icon = first_name.parentNode.lastChild;
        expect(click_icon).toBeTruthy();

        fireEvent.click(click_icon);

        const first_name_input = await waitFor(() => container.querySelector('input[name="rows[0].first_name"]'));
        expect(first_name_input).toBeTruthy();

        fireEvent.change(first_name_input, { target: { value: 'Changed First Name' } });

        const last_name = await findByText('abcd');
        fireEvent.mouseOver(last_name);

        const changed_first_name = findByText('Changed First Name');
        expect(changed_first_name).toBeTruthy();
    });
});

import { string, array } from 'yup';
import { operators } from '../../../../core/client/components/MultiFilter';

export function getFilterOptions(userCountries, userApplications) {
    const statusOptions = [
        { value: 'self_verified', displayText: 'Self Verified' },
        { value: 'manually_verified', displayText: 'Manually Verified' },
        { value: 'consent_pending', displayText: 'Consent Pending' },
        { value: 'not_verified', displayText: 'Not Verified' },
    ];

    const filterOptions = [
        {
            fieldName: 'first_name',
            valueType: 'text',
            displayText: 'First Name',
            operators: operators.getStringOperators(),
            maxLength: 50,
            schema: array().of(string().required('This field can not be empty.'))
        },
        {
            fieldName: 'last_name',
            valueType: 'text',
            displayText: 'Last Name',
            operators: operators.getStringOperators(),
            maxLength: 50,
            schema: array().of(string().required('This field can not be empty.'))
        },
        {
            fieldName: 'email',
            valueType: 'text',
            displayText: 'Email',
            operators: operators.getStringOperators(),
            maxLength: 100,
            schema: array().of(string().required('This field can not be empty.'))
        },
        {
            fieldName: 'country',
            valueType: 'select',
            displayText: 'Country',
            operators: operators.getSelectOperators(),
            options: userCountries
        },
        {
            fieldName: 'status',
            valueType: 'select',
            displayText: 'Status',
            operators: operators.getSelectOperators(),
            options: statusOptions
        },
        {
            fieldName: 'created_at',
            valueType: 'date',
            displayText: 'Creation Date',
            operators: operators.getDateOperators()
        },
        {
            fieldName: 'created_by',
            valueType: 'select',
            displayText: 'Application Name',
            operators: operators.getSelectOperators(),
            options: userApplications
        }
    ];

    return filterOptions;
}

export function getDatasyncFilterOptions(userCountries) {
    const statusOptions = [
        { value: 'STA.3', displayText: 'Valid' },
        { value: 'STA.9', displayText: 'Invalid' }
    ];

    const filterOptions = [
        {
            fieldName: 'firstname',
            valueType: 'text',
            displayText: 'First Name',
            operators: operators.getStringOperators()
        },
        {
            fieldName: 'lastname',
            valueType: 'text',
            displayText: 'Last Name',
            operators: operators.getStringOperators()
        },
        {
            fieldName: 'email_1',
            valueType: 'text',
            displayText: 'Email',
            operators: operators.getStringOperators()
        },
        {
            fieldName: 'codbase',
            valueType: 'select',
            displayText: 'Country',
            operators: operators.getSelectOperators(),
            options: userCountries
        },
        {
            fieldName: 'status_code',
            valueType: 'select',
            displayText: 'Status',
            operators: operators.getSelectOperators(),
            options: statusOptions
        },
        {
            fieldName: 'uuid_1',
            valueType: 'text',
            displayText: 'UUID',
            operators: operators.getStringOperators()
        },
        {
            fieldName: 'activity_id_onekey',
            valueType: 'text',
            displayText: 'Activity Onekey ID',
            operators: operators.getStringOperators()
        },
        {
            fieldName: 'workplace_id_onekey',
            valueType: 'text',
            displayText: 'Workplace Onekey ID',
            operators: operators.getStringOperators()
        },
        {
            fieldName: 'telephone',
            valueType: 'text',
            displayText: 'Phone',
            operators: operators.getStringOperators()
        },
        {
            fieldName: 'adr_id_onekey',
            valueType: 'text',
            displayText: 'Address Onekey ID',
            operators: operators.getStringOperators()
        },
        {
            fieldName: 'address_lbl',
            valueType: 'text',
            displayText: 'Address Label',
            operators: operators.getStringOperators()
        },
        {
            fieldName: 'postal_city',
            valueType: 'text',
            displayText: 'Postal City',
            operators: operators.getStringOperators()
        },
        {
            fieldName: 'fax',
            valueType: 'text',
            displayText: 'Fax',
            operators: operators.getStringOperators()
        },
        {
            fieldName: 'lgpostcode',
            valueType: 'text',
            displayText: 'Post Code',
            operators: operators.getStringOperators()
        }
    ];

    return filterOptions;
}

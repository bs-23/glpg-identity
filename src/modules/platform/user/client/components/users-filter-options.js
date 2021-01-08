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

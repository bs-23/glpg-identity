import { operators } from '../../../../core/client/components/MultiFilter';

export function getFilterOptions(userCountries) {
    const statusOptions = [
        { value: 'self_verified', displayText: 'Self Verified' },
        { value: ['self_verified', 'manually_verified'], displayText: 'All Verified' },
        { value: 'manually_verified', displayText: 'Manually Verified' },
        { value: 'consent_pending', displayText: 'Consent Pending' },
        { value: 'not_verified', displayText: 'Not Verified' },
    ];

    const filterOptions = [
        {
            fieldName: 'first_name',
            valueType: 'text',
            displayText: 'First Name',
            operators: operators.getStringOperators()
        },
        {
            fieldName: 'last_name',
            valueType: 'text',
            displayText: 'Last Name',
            operators: operators.getStringOperators()
        },
        {
            fieldName: 'email',
            valueType: 'text',
            displayText: 'Email',
            operators: operators.getStringOperators()
        },
        {
            fieldName: 'country_iso2',
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
            fieldName: 'expiry_date',
            valueType: 'date',
            displayText: 'Expiry Date',
            operators: operators.getDateOperators()
        },
        {
            fieldName: 'created_by',
            valueType: 'text',
            displayText: 'Created By',
            operators: operators.getStringOperators()
        }
    ];

    return filterOptions;
}

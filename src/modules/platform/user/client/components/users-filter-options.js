import { string, array } from 'yup';
import { operators } from '../../../../core/client/components/MultiFilter';

export function getFilterOptions(userCountries, allProfiles) {
    const statusOptions = [
        { value: 'active', displayText: 'Active' },
        { value: 'inactive', displayText: 'Inactive' }
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
            fieldName: 'phone',
            valueType: 'text',
            displayText: 'Phone',
            operators: operators.getStringOperators()
        },
        {
            fieldName: 'profileId',
            valueType: 'select',
            displayText: 'Profile',
            operators: operators.getSelectOperators(),
            options: allProfiles
        },
        {
            fieldName: 'created_at',
            valueType: 'date',
            displayText: 'Creation Date',
            operators: operators.getDateOperators()
        }
    ];

    return filterOptions;
}

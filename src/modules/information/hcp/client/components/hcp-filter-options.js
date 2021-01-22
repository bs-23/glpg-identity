import { string, array } from 'yup';

import { operators } from '../../../../core/client/components/MultiFilter';
import SpecialtyFilter from './specialty-filter.component';
import store from '../../../../core/client/store';

const getSpecialtyOptions = (filter) => {
    const { country } = filter;

    if(!country) return [];

    const { specialties } = store.getState().hcpReducer;
    const country_local_code = `${country.toLowerCase()}_en`;
    const specialtyOptions = (specialties[country_local_code] || []).map(s => ({
        value: s.cod_id_onekey,
        label: s.cod_description,
        displayText: s.cod_description
    }));

    return specialtyOptions;
}

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
            fieldName: 'uuid',
            valueType: 'text',
            displayText: 'UUID',
            operators: operators.getStringOperators(),
            maxLength: 20,
            schema: array().of(string().required('This field can not be empty.'))
        },
        {
            fieldName: 'specialty_onekey',
            valueType: 'select',
            displayText: 'Specialty',
            operators: operators.getSelectOperators(),
            getOptions: getSpecialtyOptions,
            customFilterComponent: SpecialtyFilter
        },
        {
            fieldName: 'telephone',
            valueType: 'text',
            displayText: 'Phone',
            operators: operators.getStringOperators(),
            maxLength: 25,
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
            displayText: 'Date of Registration',
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
            fieldName: 'specialty',
            valueType: 'select',
            displayText: 'Specialty',
            operators: operators.getSelectOperators(),
            getOptions: getSpecialtyOptions,
            customFilterComponent: SpecialtyFilter
        },
        {
            fieldName: 'individual_id_onekey',
            valueType: 'text',
            displayText: 'Individual Onekey ID',
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

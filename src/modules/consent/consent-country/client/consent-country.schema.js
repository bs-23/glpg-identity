import { string, object } from 'yup';


export const countryConsentSchema = object().shape({
    consent_category: string()
        .required('This field must not be empty.'),
    consent_id: string()
        .required('This field must not be empty.'),
    country_iso2: string()
        .required('This field must not be empty.'),
    opt_type: string()
        .required('This field must not be empty.')
});


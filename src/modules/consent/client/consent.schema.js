import { string, object, boolean } from 'yup';
// import XRegExp from 'xregexp';

export const consentSchema = object().shape({
    preference: string()
        .transform(value => value.trim())
        .max(60, 'This field must be at most 60 characters long.')
        .required('This field must not be empty.'),
    category_id: string()
        .required('This field must not be empty.'),
    legal_basis: string()
        .required('This field must not be empty.'),
    is_active: boolean(),
});


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


import { string, object, ref, array, boolean } from 'yup';
// import XRegExp from 'xregexp';

export const consentSchema = object().shape({
    title: string()
        .required('This field must not be empty.'),
    preference: string(),
    category_id: string()
        .required('This field must not be empty.'),
    legal_basis: string()
        .required('This field must not be empty.'),
    is_active: boolean(),
});

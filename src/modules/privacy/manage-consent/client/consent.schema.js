import { string, object, boolean } from 'yup';

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



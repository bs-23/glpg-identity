import { string, object } from 'yup';

export default object().shape({
    title: string()
        .transform(value => value.trim() ? value.trim() : undefined)
        .min(2, 'This field must be at least 2 characters long.')
        .max(50, 'This field must be at most 50 characters long.')
        .required('This field must not be empty.')
        .nullable(),
    legal_title: string()
        .transform(value => (value || '').trim() ? value.trim() : undefined)
        .min(2, 'This field must be at least 2 characters long.')
        .max(50, 'This field must be at most 50 characters long.')
        .nullable()
});

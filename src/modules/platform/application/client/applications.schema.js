import { string, object, array } from 'yup';

export const applicationFormSchema = object().shape({
    name: string()
        .transform(value => value.trim())
        .required('This field must not be empty.')
        .max(50, 'This field must be at most 50 characters long'),
    description: string()
        .transform(value => value.trim())
        .max(500, 'This field must be at most 500 characters long')
        .nullable()
});


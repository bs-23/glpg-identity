import { string, object, array } from 'yup';

export const profileCreateSchema = object().shape({
    title: string()
        .required('This field must not be empty.')
        .max(50, 'This field must be at most 50 characters long'),
    permissionSets: array()
        .of(string())
        .min(1, 'Must select at least one permission set')
        .required('Must select at least one permission set'),
    description: string()
        .nullable()
        .max(500, 'This field must be at most 500 characters long'),
});


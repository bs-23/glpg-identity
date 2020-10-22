import { string, object } from 'yup';

export default object().shape({
    title: string()
        .min(2, 'This field must be at least 2 characters long.')
        .max(255, 'This field must be at most 255 characters long.')
        .required('This field must not be empty.')
});

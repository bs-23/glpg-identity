import { string, object } from 'yup';

export const faqSchema = object().shape({
    question: string()
        .max(60, 'This field must be at most 60 characters long.')
        .required('This field must not be empty.'),
    answer: string()
        .required('This field must not be empty.')
        .max(1000, 'This field must be at most 60 characters long.')
});

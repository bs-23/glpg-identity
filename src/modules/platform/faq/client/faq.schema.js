import { string, object, array } from 'yup';

function isNotEmpty(answer) {
    if (answer === '<p><br></p>') return false;
    return true;
}

export const faqSchema = object().shape({
    question: string()
        .max(60, 'This field must be at most 60 characters long.')
        .required('This field must not be empty.'),
    answer: string()
        .required('This field must not be empty.')
        .max(1500, 'Maximum character limit has been exceeded.')
        .test('is-empty', 'This field must not be empty.',
            answer => isNotEmpty(answer)),
    categories:
        array()
            .of(string())
            //.min(1, 'Must select at least one category')
            .required('Must select at least one category')
});

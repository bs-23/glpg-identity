import { string, object, boolean, array } from 'yup';

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
    translations: array().of(
        object().shape({
            locale: string().required('This field must not be empty.'),
            rich_text: string()
                .test('is-empty', 'This field must not be empty.', rich_text => {
                    return (rich_text||'').length !== 0 && rich_text !== '<p><br></p>' && (rich_text||'').replace(/&nbsp;/g, '') !== '<p></p>';
                })
                .test('is-max', 'Maximum character limit has been exceeded.', rich_text => {
                    return (rich_text||'').escapedHtmlLength() <= 976;
                })
                .required('This field must not be empty.')
        })
    )
});



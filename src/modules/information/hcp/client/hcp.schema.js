import { string, object } from 'yup';
import XRegExp from 'xregexp';

export const ApprovalRejectSchema = object().shape({
    comment: string().when('selectedStatus', {
        is: 'approve',
        then: string()
            .transform(value => value.trim())
            .required('Must select one option.')
            .max(500, 'This field must be at most 500 characters long.'),
        otherwise: string()
            .transform(value => value.trim())
            .required('This field must not be empty.')
            .max(500, 'This field must be at most 500 characters long.'),
    }),
    other_comment: string().when('selectedStatus', {
        is: 'approve',
        then: string().when('comment', {
            is: 'other',
            then: string()
                .test('has-only-spaces', 'This field must not be empty.', comment => comment && comment.trim())
                .test('max-char', 'This field must be at most 500 characters long.', comment => (comment || '').trim().length <= 500)
                .required('This field must not be empty.'),
            otherwise: string()
        }),
        otherwise: string()
    })
});

function invalidEmail(email) {
    if (email) {
        const portion = email.split("@");
        if (portion[1] === 'mail.c' || portion[1] === 'mail#archive.com' || portion[1] === 'mail' || portion[1] === 'mail..com') {
            return false;
        }
        if (portion[0].charAt(portion[0].length - 1) === '-') {
            return false;
        }
        if (portion & portion[0] && portion[0].includes('#')) {
            return false;
        }

    }

    return true;
}

function invalidPhone(phone) {
    if (phone === '+') {
        return false;
    }
    return true;
}

function invalidName(first_name) {
    const invalidChars = ["É", "Ë", "Ï", "Ó", "Ö", "Ü", "é", "ë", "ï", "ó", "ö", "ü",
        "À", "È", "É", "Ì", "Ò", "Ó", "Ù", "à", "è", "é", "ì", "ò", "ó", "ù",
        "Ä", "Ö", "Ü", "ẞ", "ä", "ö", "ü", "ß",
        "À", "Â", "Æ", "Ç", "É", "È", "Ê", "Ë", "Ï", "Î", "Ô", "Œ", "Ù", "Û", "Ü", "Ÿ",
        "à", "â", "æ", "ç", "è", "ê", "ë", "ï", "î", "ô", "œ", "ù", "û", "ü", "ÿ"

    ];

    if (invalidChars.some(v => first_name.includes(v))) {
        return false;
    }
    return true;
}

export const HcpInlineEditSchema = object().shape({
    first_name: string()
        .matches(XRegExp('^[\\pL.-]+(?:\\s[\\pL.]+)*$'), 'This field only contains letters')
        .min(2, 'This field must be at least 2 characters long.')
        .max(50, 'This field must be at most 50 characters long.')
        .required('This field must not be empty.')
        .test('invalid-name', 'Special character is not allowed',
            first_name => invalidName(first_name)),
    last_name: string()
        .matches(XRegExp('^[\\pL.-]+(?:\\s[\\pL.]+)*$'), 'This field only contains letters')
        .min(2, 'This field must be at least 2 characters long.')
        .max(50, 'This field must be at most 50 characters long.')
        .required('This field must not be empty.'),
    email: string()
        .email('This field should be a valid email address.')
        .matches(/^.{1,64}@/, 'The part before @ of the email can be maximum 64 characters.')
        .matches(/^.*[a-z]+.*@/, 'This field should be a valid email address.')
        .test('invalid-email', 'This field should be a valid email address.)',
            email => invalidEmail(email))
        .max(100, 'This field must be at most 100 characters long.')
        .required('This field must not be empty.'),
    uuid: string()
        .min(2, 'This field must be at least 2 characters long.')
        .max(20, 'This field must be at most 20 characters long.')
        .required('This field must not be empty.'),
    country_iso2: string()
        .required('This field must not be empty.'),
    specialty_onekey: string()
        .required('This field must not be empty.'),
    telephone: string()
        .matches(/^(?:[+]?[0-9]*|[0-9]{2,3}[\/]?[0-9]*)$/, 'Must be a valid phone number')
        .max(25, 'This field must be at most 25 characters long')
        .nullable()
        .test('invalid-phone', 'Must be a valid phone number',
            phone => invalidPhone(phone))
});

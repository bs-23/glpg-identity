import { string, object } from 'yup';
import XRegExp from 'xregexp';

export const ApprovalRejectSchema = object().shape({
    comment: string().when('selectedStatus', {
        is: 'approve',
        then: string()
            .required('Must select one option.')
            .max(500, 'This field must be at most 500 characters long.'),
        otherwise: string()
            .required('This field must not be empty.')
            .max(500, 'This field must be at most 500 characters long.'),
    }),
    other_comment: string().when('selectedStatus', {
        is: 'approve',
        then: string().when('comment', {
            is: 'other',
            then: string()
                .required('This field must not be empty.')
                .max(500, 'This field must be at most 500 characters long.'),
            otherwise: string()
        }),
        otherwise: string()
    })
});

export const HcpInlineEditSchema = object().shape({
    first_name: string()
        .matches(XRegExp('^[\\pL.]+(?:\\s[\\pL.]+)*$'), 'This field only contains letters')
        .min(2, 'This field must be at least 2 characters long.')
        .max(50, 'This field must be at most 50 characters long.')
        .required('This field must not be empty.'),
    last_name: string()
        .matches(XRegExp('^[\\pL.]+(?:\\s[\\pL.]+)*$'), 'This field only contains letters')
        .min(2, 'This field must be at least 2 characters long.')
        .max(50, 'This field must be at most 50 characters long.')
        .required('This field must not be empty.'),
    email: string()
        .email('This field should be a valid email address.')
        .max(100, 'This field must be at most 100 characters long.')
        .required('This field must not be empty.'),
    uuid: string()
        .max(20, 'This field must be at most 20 characters long.')
        .required('This field must not be empty.'),
    country_iso2: string()
        .required('This field must not be empty.'),
    specialty_onekey: string()
        .required('This field must not be empty.'),
    telephone: string()
        .matches(/^[+]?[0-9]*$/, 'This field only contains digits or plus')
        .min(7, 'This field must be at least 7 characters long')
        .max(25,'This field must be at most 25 characters long')
        .nullable()
});

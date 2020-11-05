import { string, object } from 'yup';
import XRegExp from 'xregexp';

export const ApprovalRejectSchema = object().shape({
    comment: string().when('selectedStatus', {
        is: 'reject',
        then: string().required('This field must not be empty.'),
        otherwise: string()
    })
});

export const HcpInlineEditSchema = object().shape({
    first_name: string()
        .matches(XRegExp('^[\\pL]+(?:\\s[\\pL]+)*$'), 'This field only contains letters')
        .min(2, 'This field must be at least 2 characters long.')
        .max(20, 'This field must be at most 20 characters long.')
        .required('This field must not be empty.'),
    last_name: string()
        .matches(XRegExp('^[\\pL]+(?:\\s[\\pL]+)*$'), 'This field only contains letters')
        .min(2, 'This field must be at least 2 characters long.')
        .max(20, 'This field must be at most 20 characters long.')
        .required('This field must not be empty.'),
    email: string()
        .email('This field should be a valid email address.')
        .required('This field must not be empty.'),
    uuid: string()
        .required('This field must not be empty.'),
    country_iso2: string()
        .required('This field must not be empty.'),
    specialty_onekey: string()
        .required('This field must not be empty.'),
});

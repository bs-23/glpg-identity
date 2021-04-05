import { string, object, boolean, ref } from 'yup';
import XRegExp from 'xregexp';

function isEmailLengthValid(email) {
    if(!email) return false;
    const parts = email.split('@');
    const local = parts[0];
    return local.length <= 64;
}

export const partnerRequestSchemaForHcps = object().shape({
    first_name: string()
        .matches(XRegExp('^[\\pL]+(?:\\s[\\pL]+)*$'), 'This field should contain letters only')
        .min(2, 'This field must be at least 2 characters long')
        .max(50, 'This field must be at most 50 characters long')
        .required('This field must not be empty'),
    last_name: string()
        .matches(XRegExp('^[\\pL]+(?:\\s[\\pL]+)*$'), 'This field should contain letters only')
        .min(2, 'This field must be at least 2 characters long')
        .max(50, 'This field must be at most 50 characters long')
        .required('This field must not be empty'),
    email: string()
        .email('This field should be a valid email address')
        .max(100, 'This field must be at most 100 characters long')
        .required('This field must not be empty')
        .test('is-valid-email-length', 'The part before @ of the email can be maximum 64 characters ',
            email => isEmailLengthValid(email)),
    confirm_email: string()
        .required('This field must not be empty')
        .oneOf([ref('email'), null], 'Email must match'),
    procurement_contact: string()
        .email('This field should be a valid email address')
        .max(100, 'This field must be at most 100 characters long')
        .required('This field must not be empty')
        .test('is-valid-email-length', 'The part before @ of the email can be maximum 64 characters ',
            email => isEmailLengthValid(email)),
    country_iso2: string()
        .min(1, 'This field must be selected')
        .required('This field must be selected'),
    locale: string()
        .min(1, 'This field must be selected')
        .required('This field must be selected'),
    uuid: string()
        .max(20, 'This field must be at most 20 characters long.')
        .required('This field must be selected'),
    mdr_id: string()
        .max(25, 'This field must be at most 25 characters long.')
        .required('This field must be selected'),
    partner_type: string()
        .required('This field must be selected'),
    is_supplier: boolean(),
    is_customer: boolean(),
});

export const partnerRequestSchemaForHcos = object().shape({
    first_name: string()
        .matches(XRegExp('^[\\pL]+(?:\\s[\\pL]+)*$'), 'This field should contain letters only')
        .min(2, 'This field must be at least 2 characters long')
        .max(50, 'This field must be at most 50 characters long')
        .required('This field must not be empty'),
    last_name: string()
        .matches(XRegExp('^[\\pL]+(?:\\s[\\pL]+)*$'), 'This field should contain letters only')
        .min(2, 'This field must be at least 2 characters long')
        .max(50, 'This field must be at most 50 characters long')
        .required('This field must not be empty'),
    email: string()
        .email('This field should be a valid email address')
        .max(100, 'This field must be at most 100 characters long')
        .required('This field must not be empty')
        .test('is-valid-email-length', 'The part before @ of the email can be maximum 64 characters ',
            email => isEmailLengthValid(email)),
    confirm_email: string()
        .required('This field must not be empty')
        .oneOf([ref('email'), null], 'Email must match'),
    country_iso2: string()
        .min(1, 'This field must be selected')
        .required('This field must be selected'),
    locale: string()
        .min(1, 'This field must be selected')
        .required('This field must be selected'),
    uuid: string()
        .max(20, 'This field must be at most 20 characters long.')
        .required('This field must be selected'),
    mdr_id: string()
        .max(25, 'This field must be at most 25 characters long.')
        .required('This field must be selected'),
    workplace_name: string()
        .required('This field must be selected'),
    workplace_type: string()
        .min(1, 'This field must be selected')
        .required('This field must be selected'),
    specialty: string()
        .min(1, 'This field must be selected')
        .required('This field must be selected'),
});

export const partnerRequestSchemaForVendors = object().shape({
    first_name: string()
        .matches(XRegExp('^[\\pL]+(?:\\s[\\pL]+)*$'), 'This field should contain letters only')
        .min(2, 'This field must be at least 2 characters long')
        .max(50, 'This field must be at most 50 characters long')
        .required('This field must not be empty'),
    last_name: string()
        .matches(XRegExp('^[\\pL]+(?:\\s[\\pL]+)*$'), 'This field should contain letters only')
        .min(2, 'This field must be at least 2 characters long')
        .max(50, 'This field must be at most 50 characters long')
        .required('This field must not be empty'),
    email: string()
        .email('This field should be a valid email address')
        .max(100, 'This field must be at most 100 characters long')
        .required('This field must not be empty')
        .test('is-valid-email-length', 'The part before @ of the email can be maximum 64 characters ',
            email => isEmailLengthValid(email)),
    confirm_email: string()
        .required('This field must not be empty')
        .oneOf([ref('email'), null], 'Email must match'),
    mdr_id: string()
        .max(25, 'This field must be at most 25 characters long.')
        .required('This field must be selected'),
    procurement_contact: string()
        .email('This field should be a valid email address')
        .max(100, 'This field must be at most 100 characters long')
        .required('This field must not be empty')
        .test('is-valid-email-length', 'The part before @ of the email can be maximum 64 characters ',
            email => isEmailLengthValid(email)),
    country_iso2: string()
        .min(1, 'This field must be selected')
        .required('This field must be selected'),
    locale: string()
        .min(1, 'This field must be selected')
        .required('This field must be selected'),
    partner_type: string()
        .required('This field must be selected'),
});

export const partnerRequestSchemaForWholesalers = object().shape({
    first_name: string()
        .matches(XRegExp('^[\\pL]+(?:\\s[\\pL]+)*$'), 'This field should contain letters only')
        .min(2, 'This field must be at least 2 characters long')
        .max(50, 'This field must be at most 50 characters long')
        .required('This field must not be empty'),
    last_name: string()
        .matches(XRegExp('^[\\pL]+(?:\\s[\\pL]+)*$'), 'This field should contain letters only')
        .min(2, 'This field must be at least 2 characters long')
        .max(50, 'This field must be at most 50 characters long')
        .required('This field must not be empty'),
    email: string()
        .email('This field should be a valid email address')
        .max(100, 'This field must be at most 100 characters long')
        .required('This field must not be empty')
        .test('is-valid-email-length', 'The part before @ of the email can be maximum 64 characters ',
            email => isEmailLengthValid(email)),
    confirm_email: string()
        .required('This field must not be empty')
        .oneOf([ref('email'), null], 'Email must match'),
    mdr_id: string()
        .max(25, 'This field must be at most 25 characters long.')
        .required('This field must be selected'),
    iqvia_wholesaler_id: string()
        .required('This field must be selected'),
    procurement_contact: string()
        .email('This field should be a valid email address')
        .max(100, 'This field must be at most 100 characters long')
        .required('This field must not be empty')
        .test('is-valid-email-length', 'The part before @ of the email can be maximum 64 characters ',
            email => isEmailLengthValid(email)),
    country_iso2: string()
        .min(1, 'This field must be selected')
        .required('This field must be selected'),
    locale: string()
        .min(1, 'This field must be selected')
        .required('This field must be selected'),
    partner_type: string()
        .required('This field must be selected'),
});

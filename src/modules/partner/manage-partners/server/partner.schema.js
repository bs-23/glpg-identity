const XRegExp = require('xregexp');
const { string, object } = require('yup');

const partnerHcpSchema = object().shape({
    request_id: string()
        .required('This field must not be empty.'),
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
        .email('This field must be a valid email address.')
        .matches(/^.{1,64}@/, 'The part before @ of the email can be maximum 64 characters.')
        .matches(/^.*[a-z]+.*@/, 'This field should be a valid email address.')
        .max(100, 'This field must be at most 100 characters long.')
        .required('This field must not be empty.'),
    uuid: string()
        .max(20, 'This field must be at most 20 characters long.'),
    telephone: string()
        .matches(/^(?:[+]?[0-9]*|[0-9]{2,3}[\/]?[0-9]*)$/, 'This field must be a valid phone number.')
        .transform(value => value === '' ? undefined : value)
        .max(25, 'This field must be at most 25 characters long')
        .nullable(),
    country_iso2: string()
        .max(2, 'This field must be at most 2 characters long.')
        .required('This field must not be empty.'),
    language: string()
        .max(2, 'This field must be at most 2 characters long.')
        .required('This field must not be empty.'),
    type: string()
        .oneOf(['individual', 'legal_entity'], 'Type must be either individual or legal_entity')
        .required('This field must not be empty.')
});

const partnerHcoSchema = object().shape({
    request_id: string()
        .required('This field must not be empty.'),
    contact_first_name: string()
        .matches(XRegExp('^[\\pL.]+(?:\\s[\\pL.]+)*$'), 'This field only contains letters')
        .min(2, 'This field must be at least 2 characters long.')
        .max(50, 'This field must be at most 50 characters long.')
        .required('This field must not be empty.'),
    contact_last_name: string()
        .matches(XRegExp('^[\\pL.]+(?:\\s[\\pL.]+)*$'), 'This field only contains letters')
        .min(2, 'This field must be at least 2 characters long.')
        .max(50, 'This field must be at most 50 characters long.')
        .required('This field must not be empty.'),
    organization_name: string()
        .min(2, 'This field must be at least 2 characters long.')
        .max(50, 'This field must be at most 50 characters long.')
        .required('This field must not be empty.'),
    email: string()
        .email('This field must be a valid email address.')
        .matches(/^.{1,64}@/, 'The part before @ of the email can be maximum 64 characters.')
        .matches(/^.*[a-z]+.*@/, 'This field should be a valid email address.')
        .max(100, 'This field must be at most 100 characters long.')
        .required('This field must not be empty.'),
    uuid: string()
        .max(20, 'This field must be at most 20 characters long.'),
    telephone: string()
        .matches(/^(?:[+]?[0-9]*|[0-9]{2,3}[\/]?[0-9]*)$/, 'This field must be a valid phone number.')
        .transform(value => value === '' ? undefined : value)
        .max(25, 'This field must be at most 25 characters long')
        .nullable(),
    country_iso2: string()
        .max(2, 'This field must be at most 2 characters long.')
        .required('This field must not be empty.'),
    language: string()
        .max(2, 'This field must be at most 2 characters long.')
        .required('This field must not be empty.'),
    type: string()
        .oneOf(['healthcare_org', 'patient_org'], 'Type must be either healthcare_org or patient_org')
        .required('This field must not be empty.')
});

const partnerVendorSchema = object().shape({
    request_id: string()
        .required('This field must not be empty.'),
    registration_number: string()
        .required('This field must not be empty.'),
    name: string()
        .min(2, 'This field must be at least 2 characters long.')
        .max(100, 'This field must be at most 100 characters long.')
        .required('This field must not be empty.'),
    address: string()
        .required('This field must not be empty.'),
    city: string()
        .required('This field must not be empty.'),
    ordering_email: string()
        .email('This field must be a valid email address.')
        .matches(/^.{1,64}@/, 'The part before @ of the email can be maximum 64 characters.')
        .matches(/^.*[a-z]+.*@/, 'This field should be a valid email address.')
        .max(100, 'This field must be at most 100 characters long.')
        .required('This field must not be empty.'),
    telephone: string()
        .matches(/^(?:[+]?[0-9]*|[0-9]{2,3}[\/]?[0-9]*)$/, 'This field must be a valid phone number.')
        .transform(value => value === '' ? undefined : value)
        .max(25, 'This field must be at most 25 characters long')
        .nullable(),
    country_iso2: string()
        .max(2, 'This field must be at most 2 characters long.')
        .required('This field must not be empty.'),
    language: string()
        .max(2, 'This field must be at most 2 characters long.')
        .required('This field must not be empty.'),
    type: string()
        .oneOf(['vendor', 'wholesaler'], 'Type must be either vendor or wholesaler')
        .required('This field must not be empty.'),
    requestor_first_name: string()
        .matches(XRegExp('^[\\pL.]+(?:\\s[\\pL.]+)*$'), 'This field only contains letters')
        .min(2, 'This field must be at least 2 characters long.')
        .max(50, 'This field must be at most 50 characters long.')
        .nullable(),
    requestor_last_name: string()
        .matches(XRegExp('^[\\pL.]+(?:\\s[\\pL.]+)*$'), 'This field only contains letters')
        .min(2, 'This field must be at least 2 characters long.')
        .max(50, 'This field must be at most 50 characters long.')
        .nullable(),
    requestor_email: string()
        .email('This field must be a valid email address.')
        .matches(/^.{1,64}@/, 'The part before @ of the email can be maximum 64 characters.')
        .matches(/^.*[a-z]+.*@/, 'This field should be a valid email address.')
        .max(100, 'This field must be at most 100 characters long.')
        .nullable(),
    procurement_contact: string()
        .email('This field must be a valid email address.')
        .matches(/^.{1,64}@/, 'The part before @ of the email can be maximum 64 characters.')
        .matches(/^.*[a-z]+.*@/, 'This field should be a valid email address.')
        .max(100, 'This field must be at most 100 characters long.')
        .nullable(),
    invoice_email: string()
        .email('This field must be a valid email address.')
        .matches(/^.{1,64}@/, 'The part before @ of the email can be maximum 64 characters.')
        .matches(/^.*[a-z]+.*@/, 'This field should be a valid email address.')
        .max(100, 'This field must be at most 100 characters long.')
        .nullable(),
    invoice_telephone: string()
        .matches(/^(?:[+]?[0-9]*|[0-9]{2,3}[\/]?[0-9]*)$/, 'This field must be a valid phone number.')
        .transform(value => value === '' ? undefined : value)
        .max(25, 'This field must be at most 25 characters long')
        .nullable(),
    commercial_email: string()
        .email('This field must be a valid email address.')
        .matches(/^.{1,64}@/, 'The part before @ of the email can be maximum 64 characters.')
        .matches(/^.*[a-z]+.*@/, 'This field should be a valid email address.')
        .max(100, 'This field must be at most 100 characters long.')
        .nullable(),
    commercial_telephone: string()
        .matches(/^(?:[+]?[0-9]*|[0-9]{2,3}[\/]?[0-9]*)$/, 'This field must be a valid phone number.')
        .transform(value => value === '' ? undefined : value)
        .max(25, 'This field must be at most 25 characters long')
        .nullable(),
    ordering_telephone: string()
        .matches(/^(?:[+]?[0-9]*|[0-9]{2,3}[\/]?[0-9]*)$/, 'This field must be a valid phone number.')
        .transform(value => value === '' ? undefined : value)
        .max(25, 'This field must be at most 25 characters long')
        .nullable(),
});

exports.partnerHcpSchema = partnerHcpSchema;
exports.partnerHcoSchema = partnerHcoSchema;
exports.partnerVendorSchema = partnerVendorSchema;

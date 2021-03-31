const XRegExp = require('xregexp');
const { string, object, array } = require('yup');

const hcpProfile = object().shape({
    first_name: string()
        .matches(XRegExp('^[\\pL.-]+(?:\\s[\\pL.]+)*$'), 'This field only contains letters')
        .min(2, 'This field must be at least 2 characters long.')
        .max(50, 'This field must be at most 50 characters long.')
        .required('This field must not be empty.'),
    last_name: string()
        .matches(XRegExp('^[\\pL.-]+(?:\\s[\\pL.]+)*$'), 'This field only contains letters')
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
        .max(20, 'This field must be at most 20 characters long.')
        .required('This field must not be empty.'),
    telephone: string()
        .matches(/^(?:[+]?[0-9]*|[0-9]{2,3}[\/]?[0-9]*)$/, 'This field must be a valid phone number.')
        .transform(value => value === '' ? undefined : value)
        .max(25, 'This field must be at most 25 characters long')
        .nullable(),
    salutation: string()
        .max(5, 'This field must be at most 5 characters long.')
        .required('This field must not be empty.'),
    country_iso2: string()
        .min(2, 'This field must be at least 2 characters long.')
        .max(2, 'This field must be at most 2 characters long.')
        .required('This field must not be empty.'),
    language_code: string()
        .min(2, 'This field must be at least 2 characters long.')
        .max(3, 'This field must be at most 3 characters long.')
        .required('This field must not be empty.'),
    specialty_onekey: string()
        .required('This field must not be empty.')
        .max(20, 'This field must be at most 20 characters long.'),
    origin_url: string()
        .required('This field must not be empty.')
});

const registrationLookup = object().shape({
    uuid: string()
        .max(20, 'This field must be at most 20 characters long.')
        .required('This field must not be empty.'),
    email: string()
        .email('This field must be a valid email address.')
        .matches(/^.{1,64}@/, 'The part before @ of the email can be maximum 64 characters.')
        .matches(/^.*[a-z]+.*@/, 'This field should be a valid email address.')
        .max(100, 'This field must be at most 100 characters long.')
        .required('This field must not be empty.')
});

const getAccessToken = object().shape({
    email: string()
        .email('This field must be a valid email address.')
        .matches(/^.{1,64}@/, 'The part before @ of the email can be maximum 64 characters.')
        .matches(/^.*[a-z]+.*@/, 'This field should be a valid email address.')
        .max(100, 'This field must be at most 100 characters long.')
        .required('This field must not be empty.'),
    password: string().required('This field must not be empty.')
});

const updateHCPUserConsents = object().shape({
    consents: array().required('Consents are missing.')
});

const changePassword = object().shape({
    email: string()
        .email('This field must be a valid email address.')
        .required('Missing required parameter.'),
    current_password: string().required('Missing required parameter.'),
    new_password: string().required('Missing required parameter.'),
    confirm_password: string().required('Missing required parameter.')
});

const forgetPassword = object().shape({
    email: string()
        .email('This field must be a valid email address.')
        .required('Missing required parameter.')
});

const resetPassword = object().shape({
    new_password: string().required('Missing required parameter.'),
    confirm_password: string().required('Missing required parameter.')
});

const confirmConsents = object().shape({
    token: string().required('Missing required parameter.')
});

exports.hcpProfile = hcpProfile;
exports.registrationLookup = registrationLookup;
exports.getAccessToken = getAccessToken;
exports.updateHCPUserConsents = updateHCPUserConsents;
exports.changePassword = changePassword;
exports.forgetPassword = forgetPassword;
exports.resetPassword = resetPassword;
exports.confirmConsents = confirmConsents;

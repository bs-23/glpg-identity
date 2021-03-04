const path = require('path');
const XRegExp = require('xregexp');
const { string, object } = require('yup');
const { Response, CustomError } = require(path.join(process.cwd(), 'src/modules/core/server/response'));

const createPartnerSchema = object().shape({
    type: string()
        .oneOf(['hcp', 'hco'], 'Type must be either hcp or hco')
        .required('This field must not be empty.'),
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
    organization_name: string()
        .when('type', {
            is: 'hco',
            then: string()
                .min(2, 'This field must be at least 2 characters long.')
                .max(50, 'This field must be at most 50 characters long.')
                .required('This field must not be empty.')
        }),
    email: string()
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
    locale: string()
        .max(5, 'This field must be at most 5 characters long.')
        .required('This field must not be empty.'),
    individual_type: string()
        .when('type', {
            is: 'hcp',
            then: string()
                .oneOf(['individual', 'legal_entity'], 'Type must be either individual or legal_entity')
                .required('This field must not be empty.')
        }),
    uuid: string()
        .when('individual_type', {
            is: 'individual',
            then: string()
                .max(20, 'This field must be at most 20 characters long.')
                .required('This field must not be empty.')
        }),
    registration_number: string()
        .when('individual_type', {
            is: 'legal_entity',
            then: string()
                .required('This field must not be empty.')
        }),
    organization_type: string()
        .when('type', {
            is: 'hco',
            then: string()
                .oneOf(['healthcare_org', 'patient_org'], 'organization_type must be either healthcare_org or patient_org')
                .required('This field must not be empty.')
        })
});

const updatePartnerSchema = object().shape({
    type: string()
        .oneOf(['hcp', 'hco'], 'Type must be either hcp or hco')
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
    organization_name: string()
        .when('type', {
            is: 'hco',
            then: string()
                .min(2, 'This field must be at least 2 characters long.')
                .max(50, 'This field must be at most 50 characters long.')
                .required('This field must not be empty.')
        }),
    email: string()
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
    locale: string()
        .max(5, 'This field must be at most 5 characters long.')
        .required('This field must not be empty.'),
    individual_type: string()
        .when('type', {
            is: 'hcp',
            then: string()
                .oneOf(['individual', 'legal_entity'], 'Type must be either individual or legal_entity')
                .required('This field must not be empty.')
        }),
    uuid: string()
        .when('individual_type', {
            is: 'individual',
            then: string()
                .max(20, 'This field must be at most 20 characters long.')
                .required('This field must not be empty.')
        }),
    registration_number: string()
        .when('individual_type', {
            is: 'legal_entity',
            then: string()
                .required('This field must not be empty.')
        }),
    organization_type: string()
        .when('type', {
            is: 'hco',
            then: string()
                .oneOf(['healthcare_org', 'patient_org'], 'organization_type must be either healthcare_org or patient_org')
                .required('This field must not be empty.')
        })
});

const createPartnerVendorSchema = object().shape({
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
    locale: string()
        .max(5, 'This field must be at most 5 characters long.')
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

const updatePartnerVendorSchema = object().shape({
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
    locale: string()
        .max(5, 'This field must be at most 5 characters long.')
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

function validateFile(upload) {
    return function (req, res, next) {
        const response = new Response({}, []);

        upload(req, res, (err) => {
            if (err) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    response.errors.push(new CustomError('File too large. Size limit is 5 MB', 400));
                    return res.status(400).send(response);
                }

                if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                    response.errors.push(new CustomError('File number limit exceded. Only 5 files are allowed', 400));
                    return res.status(400).send(response);
                }

                response.errors.push(new CustomError(err.message, 400));
                return res.status(400).send(response);
            }

            next();
        });
    }
}

exports.createPartnerSchema = createPartnerSchema;
exports.updatePartnerSchema = updatePartnerSchema;
exports.createPartnerVendorSchema = createPartnerVendorSchema;
exports.updatePartnerVendorSchema = updatePartnerVendorSchema;
exports.validateFile = validateFile;

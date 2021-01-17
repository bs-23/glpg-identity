const path = require('path');
const XRegExp = require('xregexp');
const { string, object } = require('yup');
const { Response, CustomError } = require(path.join(process.cwd(), 'src/modules/core/server/response'));

function validate(schema) {
    return function (req, res, next) {
        const response = new Response({}, []);

        schema.validate(req.body, { abortEarly: false }).then(function() {
            next();
        }).catch(function (err) {
            err.inner.forEach(e => {
                response.errors.push(new CustomError(e.message, 400, e.path));
            });

            return res.status(400).send(response);
        });
    }
}

const hcpProfile = object().shape({
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
        .max(2, 'This field must be at most 2 characters long.')
        .required('This field must not be empty.'),
    language_code: string()
        .max(2, 'This field must be at most 2 characters long.')
        .required('This field must not be empty.'),
    specialty_onekey: string()
        .required('This field must not be empty.')
        .max(20, 'This field must be at most 20 characters long.'),
    origin_url: string()
        .required('This field must not be empty.')
});

exports.hcpProfile = hcpProfile;
exports.validate = validate;

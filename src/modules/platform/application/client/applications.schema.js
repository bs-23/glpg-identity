import { string, object, array, ref } from 'yup';

function isEmailLengthValid(email) {
    if(!email) return false;
    const parts = email.split('@');
    const local = parts[0];
    return local.length <= 64;
}

function validatePassword(password) {
    const minLength = 8;
    const maxLength = 50;
    const containsUppercase = new RegExp("^(?=.*[A-Z])").test(password);
    const containsLowercase = new RegExp("^(?=.*[a-z])").test(password);
    const containsDigit = new RegExp("^(?=.*[0-9])").test(password);
    const containsSpecialCharacter = new RegExp("[!\"#$%&'\(\)\*\+,\-\.\\\\/:;<=>\?@\[\\]\^_`\{\|\}\~]").test(password);

    if (password && (password.length < minLength || password.length > maxLength || !containsUppercase || !containsLowercase || !containsDigit || !containsSpecialCharacter)) {
        return false;
    }

    return true;
}

function hasValidCharacters(password) {
    var validCharacterPattern = new RegExp("^[a-zA-Z0-9!\"#$%&'\(\)\*\+,\-\.\\\\/:;<=>\?@\[\\]\^_`\{\|\}\~]*$");
    const containsValidCharacter = validCharacterPattern.test(password);
    return containsValidCharacter;
}

const applicationSchema = {
    name: string()
        .transform(value => value.trim())
        .max(50, 'This field must be at most 50 characters long')
        .required('This field must not be empty.'),
    email: string()
        .email('This field should be a valid email address')
        .max(100, 'This field must be at most 100 characters long')
        .required('This field must not be empty')
        .test('is-valid-email-length', 'The part before @ of the email can be maximum 64 characters ',
            email => isEmailLengthValid(email)),
    description: string()
        .transform(value => value.trim())
        .max(255, 'This field must be at most 255 characters long')
        .nullable(),
    password: string()
        .min(8, 'This field must be at least 8 characters long')
        .max(50, 'This field must be at most 50 characters long')
        .required('This field must not be empty')
        .test('is-valid-password', 'Password must contain at least an uppercase, a lowercase, a digit and a special character i.e. !”#$%&’()*+,-./:;<=>?@[]^_{|}~',
            password => validatePassword(password))
        .test('is-valid-characters', 'Password has one or more invalid character.',
        password => hasValidCharacters(password)),
    confirm_password: string()
        .required('This field must not be empty')
        .oneOf([ref('password'), null], 'Passwords must match'),
    type: string()
        .required('This field must not be empty'),
    metadata: array().of(
        object().shape({
            key: string().required('This field must not be empty'),
            value: string().required('This field must not be empty')
        })
    )
}

export const createApplicationSchema = object().shape({ ...applicationSchema });

export const updateApplicationSchema = object().shape({ ...applicationSchema, password: null, confirm_password: null });


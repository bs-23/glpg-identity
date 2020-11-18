import { string, object, ref, array } from 'yup';
import XRegExp from 'xregexp';

const PHONE_MAX_LENGTH = 25;

const isPhoneMaxLengthValid = (parent) => {
    const { country_code, phone } = parent;
    if (!phone || !country_code) return true;
    const phonenumberWithCountryCode = country_code + phone;
    return phonenumberWithCountryCode.length <= PHONE_MAX_LENGTH;
}

function validatePassword(password) {
    const minLength = 8;
    const maxLength = 50;
    const hasUppercase = new RegExp("^(?=.*[A-Z])").test(password);
    const hasLowercase = new RegExp("^(?=.*[a-z])").test(password);
    const hasDigit = new RegExp("^(?=.*[0-9])").test(password);
    const hasSpecialCharacter = new RegExp("[!\"#$%&'\(\)\*\+,\-\.\\\\/:;<=>\?@\[\\]\^_`\{\|\}\~]").test(password);

    if (password && (password.length < minLength || password.length > maxLength || !hasUppercase || !hasLowercase || !hasDigit || !hasSpecialCharacter)) {
        return false;
    }

    return true;
}

function hasValidCharacters(password) {
    var pattern = new RegExp("^[a-zA-Z0-9!\"#$%&'\(\)\*\+,\-\.\\\\/:;<=>\?@\[\\]\^_`\{\|\}\~]*$");
    const containsValidCharacters = pattern.test(password);
    return containsValidCharacters;
}

function isEmailLengthValid(email) {
    if(!email) return false;
    const parts = email.split('@');
    const local = parts[0];
    return local.length <= 64;
}

export const loginSchema = object().shape({
    email: string()
        .email('This field should be a valid email address')
        .required('This field must not be empty'),
    password: string().required('This field must not be empty'),
    // recaptchaToken: string().nullable().required('Captcha verification required')
});

export const registerSchema = object().shape({
    first_name: string()
        .matches(XRegExp('^[\\pL]+(?:\\s[\\pL]+)*$'), 'This field should contain letters only')
        .min(2, 'This field must be at least 2 characters long')
        .max(50, 'This field must be at most 50 characters long')
        .required('This field must not be empty'),
    last_name: string()
        .matches(XRegExp('^[\\pL]+(?:\\s[\\pL]+)*$'), 'This field should contain letters only')
        // .matches(XRegExp('^\\pL+$'), 'This field only contains letters')
        .min(2, 'This field must be at least 2 characters long')
        .max(50, 'This field must be at most 50 characters long')
        .required('This field must not be empty'),
    email: string()
        .email('This field should be a valid email address')
        .max(100, 'This field must be at most 100 characters long')
        .required('This field must not be empty')
        .test('is-valid-email-length', 'The part before @ of the email can be maximum 64 characters ',
            email => isEmailLengthValid(email)),
    phone: string()
        .matches(/^[0-9]*$/, 'This field only contains digits')
        .min(4, 'This field must be at least 4 characters long')
        .test('is-length-valid', `This field must be at most ${PHONE_MAX_LENGTH} characters long`,
            function () {
                return isPhoneMaxLengthValid(this.parent);
            }),
    profile: string()
        .required('Must select at least one profile'),
    role: string()
});

export const changePasswordSchema = object().shape({
    currentPassword: string()
        .min(8, 'This field must be at least 8 characters long')
        .max(50, 'This field must be at most 50 characters long')
        .required('This field must not be empty'),
    newPassword: string()
        .min(8, 'This field must be at least 8 characters long')
        .max(50, 'This field must be at most 50 characters long')
        .required('This field must not be empty')
        .test('is-valid-password', 'Password must contain at least an uppercase, a lowercase, a digit and a special character i.e. !”#$%&’()*+,-./:;<=>?@[]^_{|}~',
            password => validatePassword(password))
        .test('is-valid-characters', 'Password has one or more invalid character',
            password => hasValidCharacters(password)),
    confirmPassword: string()
        .required('This field must not be empty')
        .oneOf([ref('newPassword'), null], 'Passwords must match'),
});

export const resetPasswordSchema = object().shape({
    newPassword: string()
        .min(8, 'This field must be at least 8 characters long')
        .max(50, 'This field must be at most 50 characters long')
        .required('This field must not be empty')
        .test('is-valid-password', 'Password must contain at least an uppercase, a lowercase, a digit and a special character i.e. !”#$%&’()*+,-./:;<=>?@[]^_{|}~',
            password => validatePassword(password))
        .test('is-valid-characters', 'Password has one or more invalid character. Click info icon for hints',
        password => hasValidCharacters(password)),
    confirmPassword: string()
        .required('This field must not be empty')
        .oneOf([ref('newPassword'), null], 'Passwords must match'),
});

export const forgotPasswordSchema = object().shape({
    email: string()
        .email('This field should be a valid email address')
        .required('This field must not be empty'),
});

export const roleSchema = object().shape({
    name: string()
        .required('This field must not be empty'),
    permissions:
        array()
            .of(string())
            .min(1, 'Must select at least one permission')
            .required('Must select at least one permission')
});

export const permissionSetCreateSchema = object().shape({
    title: string()
        .required('This field must not be empty.')
        .max(50, 'This field must be at most 50 characters long'),
    description: string()
        .max(500, 'This field must be at most 500 characters long'),
    applications: string(),
    countries: string(),
    serviceCategories: string(),
    app_country_service: string()
        .test('One of three required',
            'One of the fields countries, applications or service category is required.',
            function() {
                const { countries, serviceCategories, applications } = this.parent;
                return countries || serviceCategories || applications;
            }
        )
});

export const profileCreateSchema = object().shape({
    title: string()
        .required('This field must not be empty.')
        .max(50, 'This field must be at most 50 characters long'),
    permissionSets: string().required('Must select at least one permission set.'),
    description: string()
        .nullable()
        .max(500, 'This field must be at most 500 characters long'),
});

export const roleCreateSchema = object().shape({
    title: string()
        .required('This field must not be empty.')
        .max(50, 'This field must be at most 50 characters long'),
    permissionSets: string().required('Must select at least one permission set.'),
    description: string()
        .nullable()
        .max(500, 'This field must be at most 500 characters long'),
});

export const updateMyProfileSchema = object().shape({
    first_name: string()
        .matches(XRegExp('^[\\pL]+(?:\\s[\\pL]+)*$'), 'This field should contain letters only')
        .min(2, 'This field must be at least 2 characters long')
        .max(50, 'This field must be at most 50 characters long')
        .required('This field must not be empty'),
    last_name: string()
        .matches(XRegExp('^[\\pL]+(?:\\s[\\pL]+)*$'), 'This field should contain letters only')
        // .matches(XRegExp('^\\pL+$'), 'This field only contains letters')
        .min(2, 'This field must be at least 2 characters long')
        .max(50, 'This field must be at most 50 characters long')
        .required('This field must not be empty'),
    email: string()
        .email('This field should be a valid email address')
        .max(100, 'This field must be at most 100 characters long')
        .required('This field must not be empty')
        .test('is-valid-email-length', 'The part before @ of the email can be maximum 64 characters ',
            email => isEmailLengthValid(email)),
    phone: string().when('isCountryFlagActive', {
        is: true,
        then: string().matches(/^[0-9]*$/, 'This field only contains digits')
            .min(4, 'This field must be at least 4 characters long')
            .test('is-length-valid', `This field must be at most ${PHONE_MAX_LENGTH} characters long`,
            function() {
                return isPhoneMaxLengthValid(this.parent);
            }),
        otherwise: string().matches(/^[+0-9]*$/, 'This field only contains digits or plus')
            .min(7, 'This field must be at least 7 characters long')
            .test('is-length-valid', `This field must be at most ${PHONE_MAX_LENGTH} characters long`, phone => {
                return phone.length <= PHONE_MAX_LENGTH;
            })
    })
});

import { string, object, ref } from 'yup';
import XRegExp from 'xregexp';
import PhoneNumber from 'awesome-phonenumber';

const PHONE_MAX_LENGTH = 25;

const isPhoneMaxLengthValid = (parent) => {
    const { country_callingCode, phone } = parent;
    if (!phone || !country_callingCode) return true;
    const phonenumberWithCountryCode = country_callingCode + phone;
    return phonenumberWithCountryCode.length <= PHONE_MAX_LENGTH;
}

const isPhoneNumberValid = (parent) => {
    const { country_code, phone} = parent;
    const pn = PhoneNumber(phone, country_code);
    return pn.isValid();
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

const cdpUserSchema = {
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
            email => isEmailLengthValid(email))
};

export const registerSchema = object().shape({
    first_name: cdpUserSchema.first_name,
    last_name: cdpUserSchema.last_name,
    email: cdpUserSchema.email,
    phone: string()
        .matches(/^[0-9\+]*$/, 'This field only contains digits')
        .min(8, 'This field must be at least 8 characters long')
        .test('is-length-valid', `This field must be at most ${PHONE_MAX_LENGTH} characters long`,
            function () {
                return isPhoneMaxLengthValid(this.parent);
            })
        .test('is-phoneNumber-valid', `This field must contain a valid phone number`,
            function () {
                return isPhoneNumberValid(this.parent);
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

export const updateMyProfileSchema = object().shape({
    first_name: cdpUserSchema.first_name,
    last_name: cdpUserSchema.last_name,
    email: cdpUserSchema.email,
    phone: string()
        .matches(/^[0-9\+]*$/, 'This field only contains digits')
        .min(8, 'This field must be at least 8 characters long')
        .test('is-length-valid', `This field must be at most ${PHONE_MAX_LENGTH} characters long`,
            function () {
                return isPhoneMaxLengthValid(this.parent);
            })
        .test('is-phoneNumber-valid', `This field must contain a valid phone number`,
            function () {
                return isPhoneNumberValid(this.parent);
            })
});

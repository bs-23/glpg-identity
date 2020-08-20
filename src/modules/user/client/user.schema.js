import { string, object, ref, array } from 'yup';
import XRegExp from 'xregexp'
import phoneNumber from 'awesome-phonenumber'

function validatePassword(password) {
    const minLength = 8;
    const maxLength = 50;
    const hasUppercase = new RegExp("^(?=.*[A-Z])").test(password);
    const hasLowercase = new RegExp("^(?=.*[a-z])").test(password);
    const hasDigit = new RegExp("^(?=.*[0-9])").test(password);
    const hasSpecialCharacter = new RegExp("[!\"#$%&'\(\)\*\+,\-\.\/:;<=>\?@\[\\]\^_`\{\|\}\~]").test(password);

    console.log(hasSpecialCharacter + "--");
    if (password && (password.length < minLength || password.length > maxLength || !hasUppercase || !hasLowercase || !hasDigit || !hasSpecialCharacter)) {
        return false;
    }

    return true;

}

const validatePhone = phone => {
    if (!phone) return true
    return phoneNumber(phone).isValid()
}

export const loginSchema = object().shape({
    email: string()
        .email('This field should be an valid email address.')
        .required('This field must not be empty.'),
    password: string().required('This field must not be empty.'),
    recaptchaToken: string().required('Captcha verification required.')
});

export const registerSchema = object().shape({
    first_name: string()
        .matches(XRegExp('^\\pL+$'), 'This field only contains letters')
        // .matches(/^[a-zA-Z]+$/, 'This field only contains letters.')
        .min(2, 'This field must be at least 2 characters long.')
        .max(20, 'This field must be at most 20 characters long.')
        .required('This field must not be empty.'),
    last_name: string()
        .matches(XRegExp('^\\pL+$'), 'This field only contains letters')
        // .matches(/^[a-zA-Z]+$/, 'This field only contains letters.')
        .min(2, 'This field must be at least 2 characters long.')
        .max(20, 'This field must be at most 20 characters long.')
        .required('This field must not be empty.'),
    email: string()
        .email('This field should be an valid email address.')
        .required('This field must not be empty.'),
    phone: string()
        .matches(/^[+]+/, 'This field must start with a plus.')
        .matches(/^[+]?[ 0-9]+$/, 'Must conform to international phone number format and can only contain digits, spaces or plus.')
        .matches(/[0-9]+$/, 'This field must end with a digit.')
        .test('is-valid-phone', 'Must be a valid international phone number.', validatePhone),
    countries: string()
        .required('Must select at least one country'),
    roles: string()
        .required('Must select at least one role')
});

export const changePasswordSchema = object().shape({
    currentPassword: string()
        .min(8, 'This field must be at least 8 characters long.')
        .max(50, 'This field must be at most 50 characters long.')
        .required('This field must not be empty.'),
    newPassword: string()
        .min(8, 'This field must be at least 8 characters long.')
        .max(50, 'This field must be at most 50 characters long.')
        .required('This field must not be empty.')
        .test('is-valid-password', 'Password must contain at least a digit, an uppercase, a lowercase and a special character',
            password => validatePassword(password)),
    confirmPassword: string()
        .required('This field must not be empty.')
        .oneOf([ref('newPassword'), null], 'Passwords must match'),
});

export const resetPasswordSchema = object().shape({
    newPassword: string()
        .min(8, 'This field must be at least 8 characters long.')
        .max(50, 'This field must be at most 50 characters long.')
        .required('This field must not be empty.')
        .test('is-valid-password', 'Password must contain at least a digit, an uppercase, a lowercase and a special character',
            password => validatePassword(password)),
    confirmPassword: string()
        .required('This field must not be empty.')
        .oneOf([ref('newPassword'), null], 'Passwords must match'),
});

export const forgotPasswordSchema = object().shape({
    email: string()
        .email('This field should be an valid email address.')
        .required('This field must not be empty.'),
});

export const roleSchema = object().shape({
    name: string()
        .required('This field must not be empty.'),
    permissions:
        array()
            .of(string())
            .min(1, 'Must select at least one permission')
            .required('Must select at least one permission')
});

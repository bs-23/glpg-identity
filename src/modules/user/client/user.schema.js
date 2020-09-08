import { string, object, ref, array } from 'yup';
import XRegExp from 'xregexp'
// import phoneNumber from 'awesome-phonenumber'

function validatePassword(password) {
    const minLength = 8;
    const maxLength = 50;
    const hasUppercase = new RegExp("^(?=.*[A-Z])").test(password);
    const hasLowercase = new RegExp("^(?=.*[a-z])").test(password);
    const hasDigit = new RegExp("^(?=.*[0-9])").test(password);
    const hasSpecialCharacter = new RegExp("[!\"#$%&'\(\)\*\+,\-\.\/:;<=>\?@\[\\]\^_`\{\|\}\~]").test(password);

    if (password && (password.length < minLength || password.length > maxLength || !hasUppercase || !hasLowercase || !hasDigit || !hasSpecialCharacter)) {
        return false;
    }

    return true;

}

// const validatePhone = phone => {
//     if (!phone) return true
//     return phoneNumber(phone).isValid()
// }

export const loginSchema = object().shape({
    email: string()
        .email('This field should be an valid email address.')
        .required('This field must not be empty.'),
    password: string().required('This field must not be empty.'),
    recaptchaToken: string().nullable().required('Captcha verification required.')
});

export const registerSchema = object().shape({
    first_name: string()
        .matches(XRegExp('^[\\pL]+(?:\\s[\\pL]+)*$'), 'This field only contains letters')
        .min(2, 'This field must be at least 2 characters long.')
        .max(20, 'This field must be at most 20 characters long.')
        .required('This field must not be empty.'),
    last_name: string()
        .matches(XRegExp('^[\\pL]+(?:\\s[\\pL]+)*$'), 'This field only contains letters')
        // .matches(XRegExp('^\\pL+$'), 'This field only contains letters')
        .min(2, 'This field must be at least 2 characters long.')
        .max(20, 'This field must be at most 20 characters long.')
        .required('This field must not be empty.'),
    email: string()
        .email('This field should be an valid email address.')
        .required('This field must not be empty.'),
    country_code: string()
        .matches(/^[+]+/, 'This field must start with a plus.')
        .matches(/^[+]?[ 0-9]+$/, 'Must conform to international phone number format and can only contain digits, spaces or plus.'),
    phone: string()
        .matches(/^[0-9]*$/, 'This field only contains digits.')
        .min(4, 'This field must be at least 4 characters long.')
        .max(15, 'This field must be at most 15 characters long.'),
        // .test('is-valid-phone', 'Must be a valid international phone number.', validatePhone),
    profile: string()
        .required('Must select at least one profile'),
    role: string()
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
        .test('is-valid-password', 'Password must contain at least an uppercase, a lowercase, a digit and a special character i.e. !”#$%&’()*+,-./:;<=>?@[]^_{|}~',
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

export const permissionSetCreateSchema = object().shape({
    title: string().required('This field must not be empty.'),
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
    title: string().required('This field must not be empty.'),
    permissionSets: string().required('Must select at least one permission set.'),
    description: string().nullable()
});

export const roleCreateSchema = object().shape({
    title: string().required('This field must not be empty.'),
    permissionSets: string().required('Must select at least one permission set.'),
    description: string().nullable()
});

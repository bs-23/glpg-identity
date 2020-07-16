import { string, object, ref, date } from 'yup';

function validatePassword(password){
    const minimumPasswordLength = 8

    if(!password) return false
    if(password.length < minimumPasswordLength) return false

    const hasUppercase = new RegExp("^(?=.*[A-Z])").test(password);
    if(!hasUppercase) return false

    const hasDigit = new RegExp("^(?=.*[0-9])").test(password);
    if(!hasDigit) return false

    const specialCharacters = "!@#$%^&*"
    let hasSpecialCharacter = false
    for(const c of password) {
        if(specialCharacters.includes(c)) {
            hasSpecialCharacter = true
            break
        }
    }
    return hasSpecialCharacter
}

export const loginSchema = object().shape({
    email: string()
        .email('This field should be an valid email address.')
        .required('This field must not be empty.'),
    password: string().required('This field must not be empty.'),
});

export const registerSchema = object().shape({
    first_name: string()
        .min(2, 'This field must be at least 2 characters long.')
        .max(20, 'This field must be at most 20 characters long.')
        .required('This field must not be empty.'),
    last_name: string()
        .min(2, 'This field must be at least 2 characters long.')
        .max(20, 'This field must be at most 20 characters long.')
        .required('This field must not be empty.'),
    email: string()
        .email('This field should be an valid email address.')
        .required('This field must not be empty.'),
    phone: string().matches(/^[0-9]/, 'This field only contains numbers'),
    expiary_date: date()
        .min(Date(), 'Must be a future date')
        .required('This field must not be empty'),
    countries: string()
        .required('Must select at least one country'),
    permissions: string()
        .required('Must select at least one service category')
});

export const changePasswordSchema = object().shape({
    currentPassword: string()
        .min(8, 'This field must be at least 8 characters long.')
        .required('This field must not be empty.'),
    newPassword: string()
        .min(8, 'This field must be at least 8 characters long.')
        .required('This field must not be empty.')
        .test('is-valid-password', 'Password must contain at least a digit, an uppercase and a special character',
            password => validatePassword(password)),
    confirmPassword: string()
        .required('This field must not be empty.')
        .oneOf([ref('newPassword'), null], 'Passwords must match'),
});

export const resetPasswordSchema = object().shape({
    newPassword: string()
        .min(8, 'This field must be at least 8 characters long.')
        .required('This field must not be empty.')
        .test('is-valid-password', 'Password must contain at least a digit, an uppercase and a special character',
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

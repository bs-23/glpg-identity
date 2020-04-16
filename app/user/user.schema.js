import { string, object } from "yup";

export const loginSchema = object().shape({
    email: string()
        .email("This field should be an valid email address.")
        .required("This field must not be empty."),
    password: string()
        .required("This field must not be empty.")
});

export const registerSchema = object().shape({
    name: string()
        .min(2, "This field must be at least 2 characters long.")
        .max(20, "This field must be at most 20 characters long.")
        .required("This field must not be empty."),
    email: string()
        .email("This field should be an valid email address.")
        .required("This field must not be empty."),
    phoneNumber: string()
        .required("This field must not be empty.")
        .matches(/^(?:\+88|01)?\d{11}\r?$/, "This field should be an valid phone number."),
    password: string()
        .min(8, "This field must be at least 8 characters long.")
        .required("This field must not be empty.")
});

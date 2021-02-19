import { string, object, array } from 'yup';

export const permissionSetCreateSchema = object().shape({
    title: string()
        .transform(value => value.trim())
        .max(50, 'This field must be at most 50 characters long')
        .required('This field must not be empty.'),
    description: string()
        .transform(value => value.trim())
        .max(500, 'This field must be at most 500 characters long'),
    applications: array().of(string()),
    countries: array().of(string()),
    services: array().of(string()),
    app_country_service: string()
        .test('One of three required',
            'You need to select at least one of the value from countries, applications, or services.',
            function() {
                const { countries, services, applications } = this.parent;
                return countries.length || services.length || applications.length;
            }
        )
});

import { string, object } from 'yup';

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
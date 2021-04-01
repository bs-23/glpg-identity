import { string, object, mixed } from 'yup';

export const ConsentImportJobSchema = object().shape({
    consent_category: string()
        .required('This field must not be empty.'),
    consent_id: string()
        .required('This field must not be empty.'),
    consent_locale: string()
        .required('This field must not be empty.'),
    opt_type: string()
        .required('This field must not be empty.'),
    file: mixed().required('This field must not be empty.')
        .test('fileFormat', 'Excel (.xlsx) files only', (value) => {
            if (value && (value.name.split('.').pop()).toLowerCase() === 'xlsx') {
                return true;
            }
            return false;
        })
});

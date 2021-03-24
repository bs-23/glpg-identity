import { string, object, mixed } from 'yup';
import Yup from 'yup';

export const ImportConsentsSchema = object().shape({
    consent_category: string()
        .required('This field must not be empty.'),
    consent_id: string()
        .required('This field must not be empty.'),
    file: mixed().required('A file is required')
        .test('fileFormat', 'Excel (.xlsx) files only', (value) => {
            console.log(value);
            if (value && (value.name.split('.').pop()).toLowerCase() === 'xlsx') {
                return true;
            }
            return false;
        }),

});


import { string, object, array } from 'yup';

export const partnerSchema = object().shape({
    reason_for_correction: string()
        .required('This field must not be empty.')
});

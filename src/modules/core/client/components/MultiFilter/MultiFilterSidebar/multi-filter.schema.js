import { string, object, array } from 'yup';

export const multiFilterSchema = object().shape({
    filterSettingName: string().when('shouldSaveFilter', {
        is: true,
        then: string()
            .transform(value => value.trim())
            .max(50, 'This field must be at most 50 characters long')
            .required('This field must not be empty'),
        otherwise: string()
    }),
    filters: array()
        .of(object())
        .min(1, 'Must have at least one filter')
        .required('Must have at least one filter'),
    logic: string()
        .test('is-valid', 'All logic fields must be provided',
        logic => logic ? !logic.includes('null') : true)
})
'isChosenFromExisting'

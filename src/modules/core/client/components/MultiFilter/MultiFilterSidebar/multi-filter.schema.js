import { string, object, array } from 'yup';

const MAX_FILTER_SETTING_NAME_LENGTH = 35;

export const multiFilterSchema = object().shape({
    selectedFilterSettingName: string().when('shouldSaveFilter', {
        is: true,
        then: string().when('saveType', {
            is: 'save_existing',
            then: string()
                .transform(value => value.trim())
                .max(MAX_FILTER_SETTING_NAME_LENGTH, `This field must be at most ${MAX_FILTER_SETTING_NAME_LENGTH} characters long`)
                .required('This field must not be empty'),
            otherwise: string()
        }),
        otherwise: string()
    }),
    newFilterSettingName: string().when('shouldSaveFilter', {
        is: true,
        then: string().when('saveType', {
            is: 'save_as_new',
            then: string()
                .transform(value => value.trim())
                .max(MAX_FILTER_SETTING_NAME_LENGTH, `This field must be at most ${MAX_FILTER_SETTING_NAME_LENGTH} characters long`)
                .required('This field must not be empty'),
            otherwise: string()
        }),
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

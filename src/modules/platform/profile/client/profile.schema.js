import { string, object, array } from 'yup';

const MAX_PERMISSION_SETS = 5;

export const profileCreateSchema = object().shape({
    title: string()
        .transform(value => value.trim())
        .required('This field must not be empty.')
        .max(50, 'This field must be at most 50 characters long'),
    permissionSets: array().of(string()),
        // .min(1, 'Must select at least one permission set')
        // .required('Must select at least one permission set'),
    description: string()
        .transform(value => value.trim())
        .max(500, 'This field must be at most 500 characters long')
        .nullable(),
    permissionSetsError: string()
        .test('is-max', `A maximum of ${MAX_PERMISSION_SETS} permission sets can be selected`, function() {
            const { permissionSets } = this.parent;
            return permissionSets.length <= MAX_PERMISSION_SETS;
        })
});


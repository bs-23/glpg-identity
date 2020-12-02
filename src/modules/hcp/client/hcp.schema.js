import { string, object } from 'yup';


export const ApprovalRejectSchema = object().shape({
    comment: string().when('selectedStatus', {
        is: 'approve',
        then: string()
            .required('Must select one option.')
            .max(500, 'This field must be at most 500 characters long.'),
        otherwise: string()
            .required('This field must not be empty.')
            .max(500, 'This field must be at most 500 characters long.'),
    }),
    other_comment: string().when('selectedStatus', {
        is: 'approve',
        then: string().when('comment', {
            is: 'other',
            then: string()
                .required('This field must not be empty.')
                .max(500, 'This field must be at most 500 characters long.'),
            otherwise: string()
        }),
        otherwise: string()
    })
});

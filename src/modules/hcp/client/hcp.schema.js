import { string, object } from 'yup';


export const ApprovalRejectSchema = object().shape({
    comment: string()
        .required('Must select one option.'),
    other_comment: string().when('selectedStatus', {
        is: 'approve',
        then: string().when('comment', {
            is: 'other',
            then: string().required('This field must not be empty.'),
            otherwise: string()
        }),
        otherwise: string()
    })
});

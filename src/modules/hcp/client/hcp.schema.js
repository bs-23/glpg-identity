import { string, object } from 'yup';


export const ApprovalRejectSchema = object().shape({
    comment: string().when('selectedStatus', {
        is: 'reject',
        then: string().required('This field must not be empty.'),
        otherwise: string()
    })
});

import { string, object } from 'yup';


export const ApprovalRejectSchema = object().shape({
    comment: string().when('selectedStatus', {
        is: 'reject',
        then: string().required('This field must not be empty.'),
        otherwise: string()
    })
});

export const HcpInlineEditSchema = object().shape({
    first_name: string(),
    last_name: string(),
    email: string()
        .email('This field should be a valid email address.')
        .required('This field must not be empty.'),
});

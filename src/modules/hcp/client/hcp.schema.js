import { string, object } from 'yup';


export const ApprovalRejectSchema = object().shape({
    comment: string()
        .required('This field must not be empty.')
});

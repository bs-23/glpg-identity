const { string, object } = require('yup');

const getToken = object().shape({
    grant_type: string()
        .test('is-supported-type', 'The requested grant_type is not supported.',
            grant_type => ['password', 'refresh_token'].includes(grant_type) || !grant_type
        )
        .required('grant_type is missing.'),
    username: string().when('grant_type', {
        is: 'password',
        then: string().required('The request is missing required parameters.'),
        otherwise: string()
    }),
    password: string().when('grant_type', {
        is: 'password',
        then: string().required('The request is missing required parameters.'),
        otherwise: string()
    }),
    refresh_token: string().when('grant_type', {
        is: 'refresh_token',
        then: string().required('refresh_token is missing.'),
        otherwise: string()
    })
});

const saveData = object().shape({
    type: string().required('Type is missing.'),
    data: string()
        .required('Data is missing.')
        .test('is-json', 'Data is not valid.', data => {
            try {
                return (JSON.parse(data) && !!data);
            } catch (e) {
                return false;
            }
        })
});

exports.saveData = saveData;
exports.getToken = getToken;

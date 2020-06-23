const AWS = require('aws-sdk');

const client = new AWS.SecretsManager({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

async function getSecrets() {
    try {
        const data = await client.getSecretValue({SecretId: process.env.AWS_SECRET_NAME}).promise();

        if ('SecretString' in data) {
            return JSON.parse(data.SecretString);
        }
    } catch(err) {
        if (err.code === 'DecryptionFailureException')
            throw err;
        else if (err.code === 'InternalServiceErrorException')
            throw err;
        else if (err.code === 'InvalidParameterException')
            throw err;
        else if (err.code === 'InvalidRequestException')
            throw err;
        else if (err.code === 'ResourceNotFoundException')
            throw err;
    }
}

exports.getSecrets = getSecrets;

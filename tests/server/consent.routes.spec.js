/* eslint-disable prettier/prettier */
const path = require('path');

const specHelper = require(path.join(process.cwd(), 'jest/spec.helper'));
const app = require(path.join(process.cwd(), 'src/config/server/lib/express'));
const { Test, PropTypes } = require('./helper')

const { defaultApplication } = specHelper;
const { consent: { demoConsent } } = specHelper;

let appInstance

beforeAll(async () => {
    const config = require(path.join(
        process.cwd(),
        'src/config/server/config'
    ));
    await config.initEnvironmentVariables();

    appInstance = await app();
});

describe('Consent Routes', () => {
    Test('Should get consent when given valid country code', () => appInstance)
        .header('Authorization', 'bearer ' + defaultApplication.access_token)
        .isJSON()
        .validateBodySchema({
            country_code: PropTypes.String,
            consents: [{
                id: PropTypes.String,
                title: PropTypes.String,
                type: PropTypes.String,
                opt_type: PropTypes.String,
                category: PropTypes.String
            }]
        })
        .get(`/api/consents?country_code=${demoConsent.country_code}`, 200)

    Test('Should get 401 when the access token is invalid', () => appInstance)
        .header('Authorization', 'bearer ' + `${defaultApplication.access_token.slice(0,-3)}Ky0`)
        .get(`/api/consents?country_code=BE`, 401)
});

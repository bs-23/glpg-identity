const path = require('path');
const supertest = require('supertest');

const specHelper = require(path.join(process.cwd(), 'jest/spec.helper'));
const app = require(path.join(process.cwd(), 'src/config/server/lib/express'));

const { defaultApplication } = specHelper;
const { consent: { demoConsent } } = specHelper;

let request;

beforeAll(async () => {
    const config = require(path.join(process.cwd(), 'src/config/server/config'));
    await config.initEnvironmentVariables();

    const appInstance = await app();
    request = supertest(appInstance);
});

describe('Consent Routes', () => {
    it('Should get all consents by country iso2', async () => {
        const response = await request
            .get(`/api/consents?code=${demoConsent.country_iso2}_${demoConsent.language_code}`)
            .set('Authorization', `bearer ${defaultApplication.access_token}`)

        expect(response.statusCode).toBe(200);
        expect(response.res.headers['content-type']).toMatch('application/json');
    });
});

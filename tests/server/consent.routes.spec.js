/* eslint-disable prettier/prettier */
const path = require('path');
const supertest = require('supertest');

const specHelper = require(path.join(process.cwd(), 'jest/spec.helper'));
const app = require(path.join(process.cwd(), 'src/config/server/lib/express'));

const { defaultApplication } = specHelper;
const { consent: { demoConsent } } = specHelper;

let request;

beforeAll(async () => {
    const config = require(path.join(
        process.cwd(),
        'src/config/server/config'
    ));
    await config.initEnvironmentVariables();

    const appInstance = await app();
    request = supertest(appInstance);
});

describe('Consent Routes', () => {
    it('Should get consent when given valid country code', async () => {
        const response = await request
            .get(`/api/consents?country_code=${demoConsent.country_code}`)
            .set('Authorization', 'bearer ' + defaultApplication.access_token)

        expect(response.statusCode).toBe(200);
        expect(response.res.headers['content-type']).toMatch(
            'application/json'
        );
        expect(response.body).toHaveProperty('country_code');
        expect(response.body).toHaveProperty('consents');
        expect(Array.isArray(response.body.consents)).toBe(true);
        if (Array.isArray(response.body.consents) && response.body.consents.length) {
            expect(response.body.consents[0]).toHaveProperty('id');
            expect(response.body.consents[0]).toHaveProperty('title');
            expect(response.body.consents[0]).toHaveProperty('type');
            expect(response.body.consents[0]).toHaveProperty('opt_type');
            expect(response.body.consents[0]).toHaveProperty('category');
        }
    });

    it('Should get 401 when the access token is invalid', async () => {
        const accessToken = `${defaultApplication.access_token.slice(0,-3)}Ky0`;
        const countryCode = 'BE';
        const response = await request
            .get(`/api/consents?country_code=${countryCode}`)
            .set('Cookie', [`access_token=${accessToken}`]);

        expect(response.statusCode).toBe(401);
    });
});

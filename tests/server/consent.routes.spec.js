const path = require('path');
const supertest = require('supertest');

const specHelper = require(path.join(process.cwd(), 'jest/spec.helper'));
const app = require(path.join(process.cwd(), 'src/config/server/lib/express'));

const { defaultApplication } = specHelper;
const { signCookie } = specHelper;
const { consent: { demoConsent } } = specHelper;
const { defaultUser } = specHelper.users;

let request;

jest.setTimeout(20000);

beforeAll(async () => {
    const config = require(path.join(process.cwd(), 'src/config/server/config'));
    await config.initEnvironmentVariables();

    const appInstance = await app();
    request = supertest(appInstance);
});

describe('Consent Routes', () => {
    it('Should get all consents by country code with language code', async () => {
        const response = await request
            .get(`/api/consents?country_iso2=${demoConsent.country_iso2}&locale=${demoConsent.locale}`)
            .set('Authorization', `bearer ${defaultApplication.access_token}`)

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.errors).toHaveLength(0);
        expect(response.res.headers['content-type']).toMatch('application/json');
    });

    it('Should get all country consents', async () => {
        const response = await request
            .get(`/api/consent/country`)
            .set('Cookie', [`access_token=s:${signCookie(defaultUser.access_token)}`])

        expect(response.statusCode).toBe(200);
        expect(response.res.headers['content-type']).toMatch('application/json');
    });

    it('Should get consent performance report', async () => {
        const response = await request
            .get(`/api/cdp-consent-performance-report`)
            .set('Cookie', [`access_token=s:${signCookie(defaultUser.access_token)}`])

        expect(response.statusCode).toBe(200);
        expect(response.res.headers['content-type']).toMatch('application/json');
    });

    it('Should get datasync consent performance report', async () => {
        const response = await request
            .get(`/api/datasync_consent-performance-report`)
            .set('Cookie', [`access_token=s:${signCookie(defaultUser.access_token)}`])

        expect(response.statusCode).toBe(200);
        expect(response.res.headers['content-type']).toMatch('text/html');
    });
});

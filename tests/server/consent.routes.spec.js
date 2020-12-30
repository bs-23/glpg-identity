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

    it('Should get cdp consent performance report', async () => {
        const response = await request
            .get(`/api/cdp-consent-performance-report`)
            .set('Cookie', [`access_token=s:${signCookie(defaultUser.access_token)}`])

        expect(response.statusCode).toBe(200);
        expect(response.res.headers['content-type']).toMatch('application/json');
    });

    it('Should get veeva consent performance report', async () => {
        const response = await request
            .get(`/api/veeva-consent-performance-report`)
            .set('Cookie', [`access_token=s:${signCookie(defaultUser.access_token)}`])

        expect(response.statusCode).toBe(200);
        expect(response.res.headers['content-type']).toMatch('application/json');
    });

    it('Should get all process activities', async () => {
        const response = await request
            .get(`/api/get-all-process-activities`)
            .set('Cookie', [`access_token=s:${signCookie(defaultUser.access_token)}`])

        expect(response.statusCode).toBe(200);
        expect(response.res.headers['content-type']).toMatch('application/json');
    });

    it('Should get one veeva consent details with consent id', async () => {
        const response = await request
            .get(`/api/consents/WNLN01326483`)
            .set('Cookie', [`access_token=s:${signCookie(defaultUser.access_token)}`])

        expect(response.statusCode).toBe(200);
        expect(response.res.headers['content-type']).toMatch('application/json');
    });

    it('Should add cpd consent, update it and get the details with consent id', async () => {
        const response1 = await request
            .post(`/api/cdp-consents`)
            .set('Cookie', [`access_token=s:${signCookie(defaultUser.access_token)}`])
            .send({
                category_id: "fe037405-c676-4d98-bd05-85008900c838",
                legal_basis: "consent",
                preference: "a",
                translations: [
                    {
                        id: "d95abe6c-d71b-4124-9ebb-e5daf73869e7",
                        country_iso2: "be",
                        lang_code: "nl",
                        rich_text: "<p>a</p>"
                    }
                ],
                is_active: true
            });

        expect(response1.statusCode).toBe(200);
        expect(response1.res.headers['content-type']).toMatch('application/json');

        const response2 = await request
            .put(`/api/cdp-consents/${response1.body.id}`)
            .set('Cookie', [`access_token=s:${signCookie(defaultUser.access_token)}`])
            .send({
                category_id: "fe037405-c676-4d98-bd05-85008900c838",
                legal_basis: "consent",
                preference: "new_preference",
                translations: [
                    {
                        id: "d95abe6c-d71b-4124-9ebb-e5daf73869e7",
                        country_iso2: "be",
                        lang_code: "nl",
                        rich_text: "<p>a</p>"
                    }
                ],
                is_active: true
            });

        expect(response2.statusCode).toBe(200);
        expect(response2.res.headers['content-type']).toMatch('text/plain');

        const response3 = await request
            .get(`/api/cdp-consents/${response1.body.id}`)
            .set('Cookie', [`access_token=s:${signCookie(defaultUser.access_token)}`])

        expect(response3.statusCode).toBe(200);
        expect(response3.res.headers['content-type']).toMatch('application/json');
    });

    it('Should get cdp consents', async () => {
        const response = await request
            .get(`/api/cdp-consents?translations=true&category=true`)
            .set('Cookie', [`access_token=s:${signCookie(defaultUser.access_token)}`])

        expect(response.statusCode).toBe(200);
        expect(response.res.headers['content-type']).toMatch('application/json');
    });
});

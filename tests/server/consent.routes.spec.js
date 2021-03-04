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
                        locale: "nl_BE",
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
                        locale: "nl_BE",
                        rich_text: "<p>a</p>"
                    }
                ],
                is_active: true
            });

        expect(response2.statusCode).toBe(200);
        expect(response2.res.headers['content-type']).toMatch('application/json');

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

    it('Should get all country consents', async () => {
        const response = await request
            .get(`/api/consent/country`)
            .set('Cookie', [`access_token=s:${signCookie(defaultUser.access_token)}`])

        expect(response.statusCode).toBe(200);
        expect(response.res.headers['content-type']).toMatch('application/json');
    });

    it('Should assign consent to country and update it, then delete it', async () => {
        const response1 = await request
            .post(`/api/cdp-consents`)
            .set('Cookie', [`access_token=s:${signCookie(defaultUser.access_token)}`])
            .send({
                category_id: "fe037405-c676-4d98-bd05-85008900c838",
                legal_basis: "consent",
                preference: "z",
                translations: [
                    {
                        id: "d95abe6c-d71b-4124-9ebb-e5daf73869e7",
                        locale: "nl_BE",
                        rich_text: "<p>a</p>"
                    }
                ],
                is_active: true
            });

        const response2 = await request
            .post(`/api/consent/country`)
            .set('Cookie', [`access_token=s:${signCookie(defaultUser.access_token)}`])
            .send({
                consent_id: response1.body.id,
                country_iso2: "BE",
                opt_type: "single-opt-in"
            })

        expect(response2.statusCode).toBe(200);
        expect(response2.res.headers['content-type']).toMatch('application/json');

        const response3 = await request
            .put(`/api/consent/country/${response2.body.id}`)
            .set('Cookie', [`access_token=s:${signCookie(defaultUser.access_token)}`])
            .send({
                opt_type: "double-opt-in"
            })

        expect(response3.statusCode).toBe(200);
        expect(response3.res.headers['content-type']).toMatch('application/json');

        const response4 = await request
            .delete(`/api/consent/country/${response2.body.id}`)
            .set('Cookie', [`access_token=s:${signCookie(defaultUser.access_token)}`])

        expect(response4.statusCode).toBe(200);
        expect(response4.res.headers['content-type']).toMatch('text/plain');
    });

    it('Should get consent categories', async () => {
        const response = await request
            .get(`/api/privacy/consent-categories`)
            .set('Cookie', [`access_token=s:${signCookie(defaultUser.access_token)}`])

        expect(response.statusCode).toBe(200);
        expect(response.res.headers['content-type']).toMatch('application/json');
    });

    it('Should create consent category, update it and get details of it', async () => {
        const response1 = await request
            .post(`/api/privacy/consent-categories`)
            .set('Cookie', [`access_token=s:${signCookie(defaultUser.access_token)}`])
            .send({
                title: "a"
            })

        expect(response1.statusCode).toBe(200);
        expect(response1.res.headers['content-type']).toMatch('application/json');

        const response2 = await request
            .put(`/api/privacy/consent-categories/${response1.body.id}`)
            .set('Cookie', [`access_token=s:${signCookie(defaultUser.access_token)}`])
            .send({
                title: "aa"
            })

        expect(response2.statusCode).toBe(200);
        expect(response2.res.headers['content-type']).toMatch('application/json');

        const response3 = await request
            .get(`/api/privacy/consent-categories/${response1.body.id}`)
            .set('Cookie', [`access_token=s:${signCookie(defaultUser.access_token)}`])

        expect(response3.statusCode).toBe(200);
        expect(response3.res.headers['content-type']).toMatch('application/json');
    });
});

const path = require('path');
const supertest = require('supertest');

const specHelper = require(path.join(process.cwd(), 'jest/spec.helper'));
const app = require(path.join(process.cwd(), 'src/config/server/lib/express'));

const { defaultApplication } = specHelper;
const { signCookie } = specHelper;
const { consent: { demoConsent } } = specHelper;
const { defaultAdmin, defaultUser } = specHelper.users;

let request;

jest.setTimeout(20000);

beforeAll(async () => {
    const config = require(path.join(process.cwd(), 'src/config/server/config'));
    await config.initEnvironmentVariables();

    const appInstance = await app();
    request = supertest(appInstance);
});

describe('Manage Requests Routes', () => {
    it('Should get all requests for the entity type of hcp ', async () => {
        const response = await request
            .get(`/api/partner-requests?entitytype=hcp`)
            .set('Cookie', [`access_token=s:${signCookie(defaultAdmin.access_token)}`])

        expect(response.statusCode).toBe(200);
        expect(response.res.headers['content-type']).toMatch('application/json');
    });

    it('Should create, update and delete partner request', async () => {
        const response1 = await request
            .post(`/api/partner-requests`)
            .set('Cookie', [`access_token=s:${signCookie(defaultAdmin.access_token)}`])
            .send({
                entity_type: "hco",
                first_name: "aa",
                last_name: "bb",
                email: "test@gmail.com",
                confirm_email: "test@gmail.com",
                procurement_contact: "test@gmail.com",
                country_iso2: "BE",
                language: "fr",
                locale: "nl_NL",
                mdr_id: "test_mdr_id",
                onekey_id: "",
                specialty: "SP.WBE.21",
                uuid: "test_uuid",
                workplace_name: "test_workplace_name",
                workplace_type: "healthcare_org"
            });

        expect(response1.statusCode).toBe(200);
        expect(response1.res.headers['content-type']).toMatch('application/json');

        const response2 = await request
            .get(`/api/partner-requests/${response1.body.id}`)
            .set('Cookie', [`access_token=s:${signCookie(defaultAdmin.access_token)}`]);

        expect(response2.statusCode).toBe(200);
        expect(response2.res.headers['content-type']).toMatch('application/json');

        const response3 = await request
            .put(`/api/partner-requests/${response1.body.id}`)
            .set('Cookie', [`access_token=s:${signCookie(defaultAdmin.access_token)}`])
            .send({
                entity_type: "hco",
                first_name: "bb",
                last_name: "aa",
                email: "test@gmail.com",
                confirm_email: "test@gmail.com",
                procurement_contact: "test@gmail.com",
                country_iso2: "BE",
                language: "fr",
                mdr_id: "test_mdr_id",
                onekey_id: "",
                specialty: "SP.WBE.21",
                uuid: "test_uuid",
                workplace_name: "test_workplace_name",
                workplace_type: "healthcare_org"
            })

        expect(response3.statusCode).toBe(200);
        expect(response3.res.headers['content-type']).toMatch('application/json');

        const response4 = await request
            .delete(`/api/partner-requests/${response1.body.id}`)
            .set('Cookie', [`access_token=s:${signCookie(defaultAdmin.access_token)}`])

        expect(response4.statusCode).toBe(200);
        expect(response4.res.headers['content-type']).toMatch('application/json');
    });
});

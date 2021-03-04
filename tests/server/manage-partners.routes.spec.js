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

describe('Manage Partners Routes', () => {
    it('Should get all hcp and hco  partners ', async () => {
        const response1 = await request
            .get(`/api/partners?type=hcp`)
            .set('Cookie', [`access_token=s:${signCookie(defaultAdmin.access_token)}`]);

        expect(response1.statusCode).toBe(200);
        expect(response1.res.headers['content-type']).toMatch('application/json');

        const response2 = await request
            .get(`/api/partners?type=hcp`)
            .set('Cookie', [`access_token=s:${signCookie(defaultAdmin.access_token)}`]);

        expect(response2.statusCode).toBe(200);
        expect(response2.res.headers['content-type']).toMatch('application/json');
    });

    it('Should get wholesaler partners', async () => {
        const response = await request
            .get(`/api/partners/wholesalers`)
            .set('Cookie', [`access_token=s:${signCookie(defaultAdmin.access_token)}`]);

        expect(response.statusCode).toBe(200);
        expect(response.res.headers['content-type']).toMatch('application/json');
    });

    it('Should get vendor partners', async () => {
        const response = await request
            .get(`/api/partners/vendors`)
            .set('Cookie', [`access_token=s:${signCookie(defaultAdmin.access_token)}`]);

        expect(response.statusCode).toBe(200);
        expect(response.res.headers['content-type']).toMatch('application/json');
    });


});
const path = require('path');
const supertest = require('supertest');

const specHelper = require(path.join(process.cwd(), 'jest/spec.helper'));
const app = require(path.join(process.cwd(), 'src/config/server/lib/express'));

const { defaultApplication } = specHelper;
const { signCookie } = specHelper;
const { consent: { demoConsent } } = specHelper;
const { defaultAdmin, defaultUser } = specHelper.users;
const { demoFaq } = specHelper.faq;

let request;

jest.setTimeout(20000);

beforeAll(async () => {
    const config = require(path.join(process.cwd(), 'src/config/server/config'));
    await config.initEnvironmentVariables();

    const appInstance = await app();
    request = supertest(appInstance);
});

describe('FAQ Routes', () => {

    it('Should get faq items data', async () => {
        const response = await request
            .get(`/api/faq`)
            .set('Cookie', [`access_token=s:${signCookie(defaultAdmin.access_token)}`]);

        expect(response.statusCode).toBe(200);
        expect(response.res.headers['content-type']).toMatch('application/json');
    });

    it('Should create new faq items', async () => {
        const response = await request
            .post(`/api/faq`)
            .set('Cookie', [`access_token=s:${signCookie(defaultAdmin.access_token)}`])
            .send({
                question: 'This is test question',
                answer: 'This is test answer',
                categories: ['general']
            });

        expect(response.statusCode).toBe(200);
        expect(response.res.headers['content-type']).toMatch('application/json');
    });

    it('Should update faq item', async () => {
        const response = await request
            .patch(`/api/faq/${demoFaq.id}`)
            .set('Cookie', [`access_token=s:${signCookie(defaultAdmin.access_token)}`])
            .send({
                question: 'This is updated question',
                answer: 'This is updated answer',
                categories: ['privacy']
            });

        expect(response.statusCode).toBe(200);
        expect(response.res.headers['content-type']).toMatch('application/json');
    });

    it('Should delete faq item', async () => {
        const response = await request
            .delete(`/api/faq/${demoFaq.id}`)
            .set('Cookie', [`access_token=s:${signCookie(defaultAdmin.access_token)}`]);

        expect(response.statusCode).toBe(200);
        expect(response.res.headers['content-type']).toMatch('text/plain');
    });

});
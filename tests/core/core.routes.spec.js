const path = require('path');
const supertest = require('supertest');

const specHelper = require(path.join(process.cwd(), 'jest/spec.helper'));
const app = require(path.join(process.cwd(), 'src/config/server/lib/express'));

let request;

jest.setTimeout(20000);

beforeAll(async () => {
    const config = require(path.join(process.cwd(), 'src/config/server/config'));
    await config.initEnvironmentVariables();

    const appInstance = await app();
    request = supertest(appInstance);
});

describe('Core Routes', () => {
    it('Should respond with html if requst is not an ajax', async () => {
        const response = await request.get('/');

        expect(response.statusCode).toBe(200);
        expect(response.res.headers['content-type']).toMatch('text/html');
    });

    it('Should respond with 404 if ajax request is made', async () => {
        const response = await request.get('/').set('X-Requested-With', 'xmlhttprequest')

        expect(response.statusCode).toBe(404);
    });

    it('Should return all available countries', async () => {
        const response = await request
            .get('/api/cdp/countries')
            .set('Cookie', [`access_token=${specHelper.users.defaultAdmin.access_token}`]);

        expect(response.statusCode).toBe(200);
    });
});

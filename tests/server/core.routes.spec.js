const path = require('path');
const supertest = require('supertest');

const app = require(path.join(process.cwd(), 'src/config/server/lib/express'));

const specHelper = require(path.join(process.cwd(), 'jest/spec.helper'));

let request;

beforeAll(async () => {
    const appInstance = await app();
    request = supertest(appInstance);
});

describe('Core Routes', () => {
    it('Should respond with html if requst is not an ajax', async () => {
        const response = await request.get('/');

        expect(response.statusCode).toBe(200);
        expect(response.res.headers['content-type']).toMatch('text/html');
    });

    it('should return all available countries', async () => {
        const response = await request
            .get('/api/countries')
            .set('Cookie', [
                `access_token=${specHelper.users.defaultAdmin.access_token}`,
            ]);

        expect(response.statusCode).toBe(200);
    });
});

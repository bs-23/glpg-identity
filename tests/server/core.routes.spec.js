const path = require('path');
const request = require('supertest');
const app = require(path.join(process.cwd(), 'src/config/server/lib/express'))();
const specHelper = require(path.join(process.cwd(), 'jest/spec.helper'));

describe('Core Routes', () => {
    it('Should respond with html if requst is not an ajax', async () => {
        const response = await request(app).get('/');

        expect(response.statusCode).toBe(200);
        expect(response.res.headers['content-type']).toMatch('text/html');
    });

    it('should return all available countries', async () => {
        const response = await request(app)
            .get('/api/countries')
            .set('Cookie', [`access_token=${specHelper.users.defaultAdmin.access_token}`]);

        expect(response.statusCode).toBe(200);
    });
});

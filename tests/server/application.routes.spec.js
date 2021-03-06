const path = require('path');
const faker = require('faker');
const supertest = require('supertest');

const specHelper = require(path.join(process.cwd(), 'jest/spec.helper'));
const app = require(path.join(process.cwd(), 'src/config/server/lib/express'));

const { defaultApplication } = specHelper;

let request;

beforeAll(async () => {
    const config = require(path.join(process.cwd(), 'src/config/server/config'));
    await config.initEnvironmentVariables();

    const appInstance = await app();
    request = supertest(appInstance);
});

describe('Application Routes', () => {
    console.error = jest.fn();

    it('Should get access_token and refresh_token for valid username and password', async () => {
        const response = await request.post('/api/applications/token').send({
            username: defaultApplication.email,
            password: defaultApplication.password,
            grant_type: 'password'
        });

        expect(response.statusCode).toBe(200);
        expect(response.res.headers['content-type']).toMatch('application/json');
    });

    it('Should receive an error to refresh an access_token for an invalid refresh_token', async () => {
        const response = await request.post('/api/applications/token').send({
            grant_type: 'refresh_token',
            refresh_token: 'xxx-yyy-zzz'
        });

        expect(response.statusCode).toBe(400);
        expect(response.res.headers['content-type']).toMatch('application/json');
    });

    it('Should save data', async () => {
        const response = await request
            .post(`/api/applications/data`)
            .set('Authorization', 'bearer ' + defaultApplication.access_token)
            .send({
                type: 'a',
                data: '[1]'
            });

        expect(response.statusCode).toBe(200);
    });

    it('Should get data by id', async () => {
        const result = await request
            .post(`/api/applications/data`)
            .set('Authorization', 'bearer ' + defaultApplication.access_token)
            .send({
                type: 'a',
                data: '[1]'
            });

        const response = await request
            .get(`/api/applications/data/${result.body.data.id}`)
            .set('Authorization', 'bearer ' + defaultApplication.access_token);

        expect(response.statusCode).toBe(200);
    });
});

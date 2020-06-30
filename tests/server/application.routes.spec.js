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
    it('Should get 401 Unauthorized http status code with invalid credentials', async () => {
        const response = await request.post('/api/applications/generate-token').send({
            email: faker.internet.email(),
            password: faker.internet.password(),
        });

        expect(response.statusCode).toBe(401);
    });

    it('Should get access token with valid email and password', async () => {
        const response = await request.post('/api/applications/generate-token').send({
            email: defaultApplication.email,
            password: defaultApplication.password,
        });

        expect(response.statusCode).toBe(200);
        expect(response.res.headers['content-type']).toMatch('application/json');
    });
});

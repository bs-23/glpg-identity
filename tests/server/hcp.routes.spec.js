const path = require('path');
const faker = require('faker');
const supertest = require('supertest');

const specHelper = require(path.join(process.cwd(), 'jest/spec.helper'));
const app = require(path.join(process.cwd(), 'src/config/server/lib/express'));

const { defaultUser } = specHelper.hcp;
const { defaultApplication } = specHelper;

let request;

beforeAll(async () => {
    const config = require(path.join(
        process.cwd(),
        'src/config/server/config'
    ));

    await config.initEnvironmentVariables();

    const appInstance = await app();
    request = supertest(appInstance);
});

describe('HCP Routes', () => {
    it('Should provide profile information for existing userID', async () => {
        const response = await request
            .post('/api/hcp-profiles/verify')
            .set('Cookie', [`access_token=${defaultApplication.access_token}`])
            .send({
                email: defaultUser.email,
                uuid: defaultUser.uuid,
            });

        expect(response.statusCode).toBe(200);
        expect(response.res.headers['content-type']).toMatch(
            'application/json'
        );
        expect(response.body).toHaveProperty('email', defaultUser.email);
        expect(response.body).toHaveProperty('uuid', defaultUser.uuid);
        expect(response.body).toHaveProperty('first_name');
        expect(response.body).toHaveProperty('last_name');
    });

    it('Should get 404 when userID does not exist', async () => {
        const response = await request
            .post('/api/hcp-profiles/verify')
            .set('Cookie', [`access_token=${defaultApplication.access_token}`])
            .send({
                email: faker.internet.email(),
                uuid: faker.random.uuid(),
            });

        expect(response.statusCode).toBe(404);
    });

    it('Should reset password of HCP user when given valid email and id', async () => {
        const response = await request
            .put('/api/hcp-profiles/reset-password')
            .set('Cookie', [`access_token=${defaultApplication.access_token}`])
            .send({
                email: defaultUser.email,
                uuid: defaultUser.uuid,
                password: faker.internet.password(),
            });

        expect(response.statusCode).toBe(200);
    });

    it('Should get 404 when email or ID not found in th DB', async () => {
        const response = await request
            .put('/api/hcp-profiles/reset-password')
            .set('Cookie', [`access_token=${defaultApplication.access_token}`])
            .send({
                email: faker.internet.email(),
                uuid: faker.random.uuid(),
                password: faker.internet.password(),
            });

        expect(response.statusCode).toBe(404);
    });
});

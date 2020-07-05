const path = require('path');
const faker = require('faker');
const supertest = require('supertest');

const specHelper = require(path.join(process.cwd(), 'jest/spec.helper'));
const app = require(path.join(process.cwd(), 'src/config/server/lib/express'));

const { Test } = require('./helper')

const { defaultUser } = specHelper.hcp;
const { defaultApplication, users: { defaultAdmin } } = specHelper;

let appInstance;
let request;

beforeAll(async () => {
    const config = require(path.join(process.cwd(), 'src/config/server/config'));
    await config.initEnvironmentVariables();
    appInstance = await app();
    request = supertest(appInstance);
});

describe('HCP Routes', () => {
    it('Should get hcp user by id', async () => {
        const response = await request
            .get(`/api/hcp-profiles/${defaultUser.id}`)
            .set('Authorization', 'bearer ' + defaultApplication.access_token);

        expect(response.statusCode).toBe(200);
        expect(response.res.headers['content-type']).toMatch('application/json');
    });

    Test('Should get 404 when userID does not exist - Get HCP Profile', () => appInstance)
        .header('Authorization', 'bearer ' + defaultApplication.access_token)
        .get(`/api/hcp-profiles/${faker.random.uuid()}`, 404)

    it('Should change password with valid parameters', async () => {
        const response = await request.put('/api/hcp-profiles/change-password')
            .set('Authorization', 'bearer ' + defaultApplication.access_token)
            .send({
                email: defaultUser.email,
                new_password: '123456789',
                confirm_password: '123456789'
            });

        expect(response.statusCode).toBe(200);
    });

    it('Should not change password with unknown email', async () => {
        const response = await request.put('/api/hcp-profiles/change-password')
            .set('Authorization', 'bearer ' + defaultApplication.access_token)
            .send({
                email: faker.internet.email(),
                new_password: '123456',
                confirm_password: '123456'
            });

        expect(response.statusCode).toBe(404);
    });

    it('Should not change password when password and confirm password does not match', async () => {
        const response = await request.put('/api/hcp-profiles/change-password')
            .set('Authorization', 'bearer ' + defaultApplication.access_token)
            .send({
                email: defaultUser.email,
                new_password: faker.internet.password(),
                confirm_password: faker.internet.password()
            });

        expect(response.statusCode).toBe(400);
    });

    it('Should create a new HCP profile', async () => {
        const response = await request.post('/api/hcp-profiles')
            .set('Authorization', 'bearer ' + defaultApplication.access_token)
            .send({
                first_name: faker.name.lastName(),
                last_name: faker.name.firstName(),
                uuid: faker.random.uuid(),
                email: faker.internet.email(),
                consents: [
                    { "827cc68d-a92d-4939-a9b6-d373321d23bb": true },
                    { "827cc68d-a92d-4939-a9b6-d373321d23bb": true },
                    { "827cc68d-a92d-4939-a9b6-d373321d23bb": true }
                ]
            });

        expect(response.statusCode).toBe(200);
        expect(response.res.headers['content-type']).toMatch('application/json');
    });

    it('Should not create a new HCP profile with existing email or uuid', async () => {
        const response = await request.post('/api/hcp-profiles')
            .set('Authorization', 'bearer ' + defaultApplication.access_token)
            .send({
                first_name: faker.name.lastName(),
                last_name: faker.name.firstName(),
                uuid: faker.random.uuid(),
                email: defaultUser.email
            });

        expect(response.statusCode).toBe(400);
    });

    it('Should not found user details with invalid email or uuid', async () => {
        const response = await request
            .post('/api/hcp-profiles/lookup')
            .set('Authorization', `bearer ${defaultApplication.access_token}`)
            .send({
                email: faker.internet.email(),
                uuid: faker.random.uuid()
            });

        expect(response.statusCode).toBe(404);
    });

    Test("Should edit an HCP user's profile", () => appInstance)
        .cookie({ access_token: defaultAdmin.access_token })
        .put(`/api/hcps/${defaultUser.id}`, 200, {
            first_name: faker.name.firstName(),
            last_name: faker.name.lastName()
        });

    Test('Should get 404 when trying to edit an non existing HCP user - Edit HCP user', () => appInstance)
        .cookie({ access_token: defaultAdmin.access_token })
        .put(`/api/hcps/${faker.random.uuid()}`, 404, {
            first_name: faker.name.firstName(),
            last_name: faker.name.lastName(),
            phone: faker.phone.phoneNumber()
        })

    it('Should get hcp users data', async () => {
        const response = await request
            .get('/api/hcps/?page=1&is_active=Approved')
            .set('Cookie', [`access_token=${defaultAdmin.access_token}`]);

        expect(response.statusCode).toBe(200);
        expect(response.res.headers['content-type']).toMatch('application/json');
    });
});

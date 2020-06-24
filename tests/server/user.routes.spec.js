const path = require('path');
const faker = require('faker');
const supertest = require('supertest');

const app = require(path.join(process.cwd(), 'src/config/server/lib/express'));

const User = require(path.join(
    process.cwd(),
    'src/modules/user/server/user.model'
));

const specHelper = require(path.join(process.cwd(), 'jest/spec.helper'));
const { defaultAdmin, defaultUser } = specHelper.users;

let request;

beforeAll(async () => {
    const appInstance = await app();
    request = supertest(appInstance);
});

describe('User Routes', () => {
    it('Should get 401 Unauthorized http status code with invalid credential', async () => {
        const response = await request.post('/api/login').send({
            email: faker.internet.email(),
            password: faker.internet.password(),
        });

        expect(response.statusCode).toBe(401);
    });

    it('Should login with valid email and password', async () => {
        const response = await request.post('/api/login').send({
            email: defaultUser.email,
            password: defaultUser.password,
        });

        expect(response.statusCode).toBe(200);
        expect(response.res.headers['content-type']).toMatch(
            'application/json'
        );
    });

    it('Should get the signed in user profile', async () => {
        const response = await request
            .get('/api/users/getSignedInUserProfile')
            .set('Cookie', [`access_token=${defaultUser.access_token}`]);

        expect(response.statusCode).toBe(200);
        expect(response.res.headers['content-type']).toMatch(
            'application/json'
        );
    });

    it('Should create new user', async () => {
        const response = await request
            .post('/api/users')
            .set('Cookie', [`access_token=${defaultUser.access_token}`])
            .send({
                name: faker.name.firstName(),
                email: faker.internet.email(),
                password: faker.internet.password(8),
                client_id: specHelper.defaultClient.id,
            });

        expect(response.statusCode).toBe(200);
        expect(response.res.headers['content-type']).toMatch(
            'application/json'
        );
    });

    it('Should get an error when creating new user with duplicate email', async () => {
        const response = await request
            .post('/api/users')
            .set('Cookie', [`access_token=${defaultUser.access_token}`])
            .send({
                name: defaultUser.name,
                email: defaultUser.email,
                password: defaultUser.password,
            });

        expect(response.statusCode).toBe(400);
    });

    it('Should not change password because current password is invalid', async () => {
        const response = await request
            .post('/api/users/changePassword')
            .set('Cookie', [`access_token=${defaultUser.access_token}`])
            .send({
                currentPassword: faker.internet.password(8),
                newPassword: faker.internet.password(8),
                confirmPassword: faker.internet.password(8),
            });

        expect(response.statusCode).toBe(400);
    });

    it('Should change password', async () => {
        const response = await request
            .post('/api/users/changePassword')
            .set('Cookie', [`access_token=${defaultUser.access_token}`])
            .send({
                currentPassword: defaultUser.password,
                newPassword: '12345678',
                confirmPassword: '12345678',
            });

        expect(response.statusCode).toBe(200);
        expect(response.res.headers['content-type']).toMatch(
            'application/json'
        );
    });

    it('should return all CDP users', async () => {
        const response = await request
            .get('/api/users')
            .set('Cookie', [`access_token=${defaultAdmin.access_token}`]);

        expect(response.statusCode).toBe(200);
    });

    it('Should delete an user', async () => {
        const id = faker.random.uuid();

        await User.create({
            id,
            name: faker.name.firstName(),
            email: faker.internet.email(),
            password: faker.internet.password(8),
            client_id: specHelper.defaultClient.id,
        });

        const response = await request
            .delete(`/api/users/${id}`)
            .set('Cookie', [`access_token=${defaultUser.access_token}`]);

        expect(response.statusCode).toBe(200);
    });
});

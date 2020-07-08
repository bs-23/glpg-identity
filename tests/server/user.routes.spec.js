const path = require('path');
const faker = require('faker');
const supertest = require('supertest');

const specHelper = require(path.join(process.cwd(), 'jest/spec.helper'));
const app = require(path.join(process.cwd(), 'src/config/server/lib/express'));
const emailService = require(path.join(process.cwd(), 'src/config/server/lib/email-service/email.service'));

const { defaultAdmin, defaultUser } = specHelper.users;

let request;

beforeAll(async () => {
    const config = require(path.join(process.cwd(), 'src/config/server/config'));
    await config.initEnvironmentVariables();

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
        expect(response.res.headers['content-type']).toMatch('application/json');
    });

    it('Should logout when requesting logout with valid credential', async () => {
        const response = await request.get('/api/logout')
            .set('Cookie', [`access_token=${defaultUser.access_token}`]);

        expect(response.res.headers['set-cookie'][0].split(';')[0].split('=')[1]).toBe('');
    });

    it('Should get the signed in user profile', async () => {
        const response = await request
            .get('/api/users/getSignedInUserProfile')
            .set('Cookie', [`access_token=${defaultUser.access_token}`]);

        expect(response.statusCode).toBe(200);
        expect(response.res.headers['content-type']).toMatch('application/json');
    });

    it('Should create new user', async () => {
        const response = await request
            .post('/api/users')
            .set('Cookie', [`access_token=${defaultUser.access_token}`])
            .send({
                name: faker.name.firstName(),
                email: faker.internet.email(),
                password: faker.internet.password(8),
                application_id: specHelper.defaultApplication.id,
            });

        expect(response.statusCode).toBe(200);
        expect(response.res.headers['content-type']).toMatch('application/json');
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
            .post('/api/users/change-password')
            .set('Cookie', [`access_token=${defaultUser.access_token}`])
            .send({
                currentPassword: faker.internet.password(8),
                newPassword: faker.internet.password(8),
                confirmPassword: faker.internet.password(8),
            });

        expect(response.statusCode).toBe(400);
    });

    it('Should not change password if passwords dont match', async () => {
        const response = await request
            .post('/api/users/change-password')
            .set('Cookie', [`access_token=${defaultUser.access_token}`])
            .send({
                currentPassword: defaultUser.password,
                newPassword: faker.internet.password(8),
                confirmPassword: faker.internet.password(8),
            });

        expect(response.statusCode).toBe(400);
    });

    it('Should change password', async () => {
        const response = await request
            .post('/api/users/change-password')
            .set('Cookie', [`access_token=${defaultUser.access_token}`])
            .send({
                currentPassword: defaultUser.password,
                newPassword: '12345678',
                confirmPassword: '12345678'
            });

        expect(response.statusCode).toBe(200);
        expect(response.res.headers['content-type']).toMatch('application/json');
    });

    it('should return all CDP users', async () => {
        const response = await request
            .get('/api/users')
            .set('Cookie', [`access_token=${defaultAdmin.access_token}`]);

        expect(response.statusCode).toBe(200);
    });

    it('Should delete an user', async () => {
        const User = require(path.join(process.cwd(), 'src/modules/user/server/user.model'));

        const id = faker.random.uuid();

        await User.create({
            id,
            name: faker.name.firstName(),
            email: faker.internet.email(),
            password: faker.internet.password(8),
            application_id: specHelper.defaultApplication.id,
        });

        const response = await request
            .delete(`/api/users/${id}`)
            .set('Cookie', [`access_token=${defaultUser.access_token}`]);

        expect(response.statusCode).toBe(200);
    });

    it('Should return status code 200 after submitting an existing email in password reset endpoint', async () => {
        jest.spyOn(emailService, 'send').mockImplementation(() => Promise.resolve())

        const response = await request
            .post('/api/users/password/send-reset-link')
            .send({
                email: defaultUser.email,
            });

        expect(response.statusCode).toBe(200);
    });

    it('Should return status code 400 after submitting an email that does not exists, in password reset endpoint', async () => {
        const response = await request
            .post('/api/users/password/send-reset-link')
            .send({
                email: faker.internet.email(),
            });

        expect(response.statusCode).toBe(400);
    });

    it('Should return status code 401 when trying to reset password with invalid token for a valid email', async () => {
        const password = faker.internet.password();
        const token = faker.random.uuid();

        const response = await request
            .put(
                `/api/users/password/resetPassword/?email=${defaultUser.email}&token=${token}`
            )
            .send({
                newPassword: password,
                confirmPassword: password,
            });

        expect(response.statusCode).toBe(401);
    });

    it('Should return status code 200 when trying to reset password with valid token for a valid email', async () => {
        const password = faker.internet.password();
        const token = faker.random.uuid();
        const { email } = defaultUser;
        const expireAt = new Date(Date.now() + 60 * 60 * 1000);

        jest.spyOn(emailService, 'send').mockImplementation(() => Promise.resolve())

        const ResetPassword = require(path.join(process.cwd(), 'src/modules/user/server/reset-password.model'));
        const [doc, created] = await ResetPassword.findOrCreate({
            where: { email },
            defaults: { email, token, expire_at: expireAt },
        });
        if (!created && doc) await doc.update({ token, expire_at: expireAt });

        const response = await request
            .put(
                `/api/users/password/resetPassword/?email=${defaultUser.email}&token=${token}`
            )
            .send({
                newPassword: password,
                confirmPassword: password,
            });

        expect(response.statusCode).toBe(200);
    });

    it('Should return status code 401 when trying to reset password with expired token for a valid email', async () => {
        const password = faker.internet.password();
        const token = faker.random.uuid();
        const { email } = defaultUser;
        const expireAt = new Date(Date.now() - 10);

        const ResetPassword = require(path.join(process.cwd(), 'src/modules/user/server/reset-password.model'));
        const [doc, created] = await ResetPassword.findOrCreate({
            where: { email },
            defaults: { email, token, expire_at: expireAt },
        });
        if (!created && doc) await doc.update({ token, expire_at: expireAt });

        const response = await request
            .put(
                `/api/users/password/resetPassword/?email=${defaultUser.email}&token=${token}`
            )
            .send({
                newPassword: password,
                confirmPassword: password,
            });

        expect(response.statusCode).toBe(401);
    });
});

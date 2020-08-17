const path = require('path');
const faker = require('faker');
const supertest = require('supertest');
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

const specHelper = require(path.join(process.cwd(), 'jest/spec.helper'));
const app = require(path.join(process.cwd(), 'src/config/server/lib/express'));
const emailService = require(path.join(process.cwd(), 'src/config/server/lib/email-service/email.service'));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

const { defaultAdmin, defaultUser } = specHelper.users;

let request;
let fakeAxios;
let siteVerifyResponse;
const recaptchaResponse = faker.random.uuid();

beforeAll(async () => {
    const config = require(path.join(process.cwd(), 'src/config/server/config'));
    await config.initEnvironmentVariables();

    const appInstance = await app();
    request = supertest(appInstance);

    const secretKey = nodecache.getValue('RECAPTCHA_SECRET_KEY');
    fakeAxios = new MockAdapter(axios);
    siteVerifyResponse = { challenge_ts: '2020-08-06T15:35:15Z', hostname: 'localhost', success: true };
    fakeAxios.onPost(`https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaResponse}`).reply(200, siteVerifyResponse);
});

describe('User Routes', () => {

    it('Should get 401 Unauthorized http status code with invalid credential', async () => {
        const response = await request.post('/api/login').send({
            email: faker.internet.email(),
            password: faker.internet.password(),
            recaptchaToken: recaptchaResponse
        });

        expect(response.statusCode).toBe(401);
    });

    it('Should login with valid email and password', async () => {
        const response = await request.post('/api/login').send({
            email: defaultUser.email,
            password: defaultUser.password,
            recaptchaToken: recaptchaResponse
        });

        expect(response.statusCode).toBe(200);
        expect(response.res.headers['content-type']).toMatch('application/json');
    });

    it('Should logout when requesting logout with valid credential', async () => {
        const response = await request.get('/api/logout')
            .set('Cookie', [`access_token=${defaultUser.access_token}`]);

        expect(response.res.headers['set-cookie'][0].split(';')[0].split('=')[1]).toBe('');
    });

    it("Should get the signed in user's profile", async () => {
        const response = await request
            .get('/api/users/profile')
            .set('Cookie', [`access_token=${defaultUser.access_token}`]);

        expect(response.statusCode).toBe(200);
        expect(response.res.headers['content-type']).toMatch('application/json');
    });

    it('Should create new user', async () => {
        const response = await request
            .post('/api/users')
            .set('Cookie', [`access_token=${defaultUser.access_token}`])
            .send({
                first_name: faker.name.firstName(),
                last_name: faker.name.lastName(),
                email: faker.internet.email(),
                password: 'Abcdef2!',
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
                first_name: defaultUser.first_name,
                last_name: defaultUser.last_name,
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
                newPassword: '1c9QZu5YU%J$',
                confirmPassword: '1c9QZu5YU%J$'
            });

        const User = require(path.join(process.cwd(), 'src/modules/user/server/user.model'));
        const user = await User.findOne({ where: { email: defaultUser.email }})
        user.update({ password: defaultUser.password })

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
            first_name: faker.name.firstName(),
            last_name: faker.name.lastName(),
            email: faker.internet.email(),
            password: faker.internet.password(8),
            application_id: specHelper.defaultApplication.id,
        });

        const response = await request
            .delete(`/api/users/${id}`)
            .set('Cookie', [`access_token=${defaultUser.access_token}`]);

        expect(response.statusCode).toBe(200);
    });

    it('Should get password reset token with valid email', async () => {
        jest.spyOn(emailService, 'send').mockImplementation(() => Promise.resolve())

        const response = await request
            .post('/api/users/forgot-password')
            .send({
                email: defaultUser.email
            });

        expect(response.statusCode).toBe(200);
    });

    it('Should get "Bad request" with an invalid email in forget-password api', async () => {
        const response = await request
            .post('/api/users/forgot-password')
            .send({
                email: faker.internet.email()
            });

        expect(response.statusCode).toBe(400);
    });

    it('Should get "Bad request" without password reset token', async () => {
        const password = faker.internet.password();

        const response = await request
            .put(`/api/users/reset-password`)
            .send({
                newPassword: password,
                confirmPassword: password
            });

        expect(response.statusCode).toBe(400);
    });

    it('Should reset password with valid token', async () => {
        const password = faker.internet.password();
        const token = faker.random.uuid();
        const { email } = defaultUser;
        const expireAt = new Date(Date.now() + 60 * 60 * 1000);

        jest.spyOn(emailService, 'send').mockImplementation(() => Promise.resolve());

        const User = require(path.join(process.cwd(), 'src/modules/user/server/user.model'));
        const ResetPassword = require(path.join(process.cwd(), 'src/modules/user/server/reset-password.model'));

        const user = await User.findOne({ where: { email } });
        const [doc, created] = await ResetPassword.findOrCreate({
            where: { user_id: user.id },
            defaults: {
                token,
                expires_at: expireAt
            }
        });

        if (!created && doc) await doc.update({ token, expires_at: expireAt });

        const response = await request
            .put(`/api/users/reset-password?token=${token}`)
            .send({
                newPassword: password,
                confirmPassword: password
            });

        expect(response.statusCode).toBe(200);
    });
});

const path = require('path');
const faker = require('faker');
const request = require('supertest');

const app = require(path.join(process.cwd(), 'src/config/server/lib/express'))();
const User = require(path.join(process.cwd(), 'src/modules/user/server/user.model'));

const specHelper = require(path.join(process.cwd(), 'jest/spec.helper'));
const { systemAdmin, siteAdmin } = specHelper.users;

describe('User Routes', () => {
    beforeAll(async () => {
        await User.create(specHelper.users.siteAdmin);
    });

    afterAll(async () => {
        await User.destroy({ where: { id: specHelper.users.siteAdmin.id }});
    });

    it('Should get 401 Unauthorized http status code with invalid credential', async () => {
        const response = await request(app)
            .post('/api/login')
            .send({
                email: faker.internet.email(),
                password: faker.internet.password()
            });

        expect(response.statusCode).toBe(401);
    });

    it('Should login with valid email and password', async () => {
        const response = await request(app)
            .post('/api/login')
            .send({
                email: siteAdmin.email,
                password: siteAdmin.password
            });

        expect(response.statusCode).toBe(200);
        expect(response.res.headers['content-type']).toMatch('application/json');
    });

    it('Should get the signed in user profile', async () => {
        const response = await request(app)
            .get('/api/users/getSignedInUserProfile')
            .set('Cookie', [`access_token=${siteAdmin.access_token}`]);

        expect(response.statusCode).toBe(200);
        expect(response.res.headers['content-type']).toMatch('application/json');
    });

    it('Should create new site admin', async () => {
        const response = await request(app)
            .post('/api/users')
            .set('Cookie', [`access_token=${siteAdmin.access_token}`])
            .send({
                name: faker.name.firstName(),
                email: faker.internet.email(),
                password: faker.internet.password(8)
            });

        expect(response.statusCode).toBe(200);
        expect(response.res.headers['content-type']).toMatch('application/json');
    });

    it('Should get an error when creating new site admin with duplicate email', async () => {
        const response = await request(app)
            .post('/api/users')
            .set('Cookie', [`access_token=${siteAdmin.access_token}`])
            .send({
                name: siteAdmin.name,
                email: siteAdmin.email,
                password: siteAdmin.password
            });

        expect(response.statusCode).toBe(400);
    });

    it('Should not change password because current password is invalid', async () => {
        const response = await request(app)
            .post('/api/users/changePassword')
            .set('Cookie', [`access_token=${siteAdmin.access_token}`])
            .send({
                currentPassword: faker.internet.password(8),
                newPassword: faker.internet.password(8),
                confirmPassword: faker.internet.password(8)
            });

        expect(response.statusCode).toBe(400);
    });

    it('Should change password', async () => {
        const response = await request(app)
            .post('/api/users/changePassword')
            .set('Cookie', [`access_token=${siteAdmin.access_token}`])
            .send({
                currentPassword: siteAdmin.password,
                newPassword: '12345678',
                confirmPassword: '12345678'
            });

        expect(response.statusCode).toBe(200);
        expect(response.res.headers['content-type']).toMatch('application/json');
    });

    it('should return all CDP users', async () => {
        const response = await  request(app)
            .get('/api/users')
            .set('Cookie', [`access_token=${systemAdmin.access_token}`]);

        expect(response.statusCode).toBe(200);
    });

    it('Should delete an user', async () => {
        const id = faker.random.uuid();

        await User.create({
            id,
            name:faker.name.firstName(),
            email: faker.internet.email(),
            password: faker.internet.password()
        });

        const response = await request(app)
            .delete(`/api/users/${id}`)
            .set("Cookie", [`access_token=${siteAdmin.access_token}`]);

        expect(response.statusCode).toBe(200);
    });
});

const path = require('path');
const request = require('supertest');
const jwt = require('jsonwebtoken');

const app = require(path.join(
    process.cwd(),
    'src/config/server/lib/express'
))();
const specHelper = require(path.join(process.cwd(), 'jest/spec.helper'));

describe('User Routes', () => {
    const { systemAdmin } = specHelper.users;

    it('Should get 401 Unauthorized http status code with invalid credential', async () => {
        const response = await request(app)
            .post('/login')
            .send({
                email: 'garbage@emaill.com',
                password: 'garbage-password',
            });

        expect(response.statusCode).toBe(401);
    });

    it('Should login with valid email and password', async () => {
        const response = await request(app)
            .post('/login')
            .send({
                email: systemAdmin.email,
                password: systemAdmin.password,
            });

        expect(response.statusCode).toBe(200);
        expect(response.res.headers['content-type']).toMatch(
            'application/json'
        );
    });

    describe('/users', () => {
        it('Should get the signed in user profile', async () => {
            const response = await request(app)
                .get('/users/getSignedInUserProfile')
                .set('Cookie', [`access_token=${systemAdmin.access_token}`]);

            expect(response.statusCode).toBe(200);
            expect(response.res.headers['content-type']).toMatch(
                'application/json'
            );
        });

        it('Should create new site admin', async () => {
            const response = await request(app)
                .post('/users')
                .set('Cookie', [`access_token=${systemAdmin.access_token}`])
                .send({
                    name: 'testUser',
                    email: 'testUser@gmail.com',
                    password: 'abcpassword',
                });

            expect(response.statusCode).toBe(200);
            expect(response.res.headers['content-type']).toMatch(
                'application/json'
            );
        });

        it('Should get an error when creating new site admin with duplicate email', async () => {
            const response = await request(app)
                .post('/users')
                .set('Cookie', [`access_token=${systemAdmin.access_token}`])
                .send({
                    name: 'testUser',
                    email: 'testUser@gmail.com',
                    password: 'abcpassword',
                });

            expect(response.statusCode).toBe(400);
        });

        it('Should get 401 unauthorized error with invalid access token when creating new site admin', async () => {
            const invalid_access_token = jwt.sign(
                {
                    id: 'f29b63e5-36c7-4210-a5a8-c1e9d0c5b9b8',
                    name: 'invalid',
                    email: 'invalid@ciam.com',
                },
                process.env.TOKEN_SECRET,
                {
                    expiresIn: '2d',
                    issuer: 'f29b63e5-36c7-4210-a5a8-c1e9d0c5b9b8',
                }
            );

            const response = await request(app)
                .post('/users')
                .set('Cookie', [`access_token=${invalid_access_token}`])
                .send({
                    name: 'testUserNew',
                    email: 'testUserNew@gmail.com',
                    password: 'abcpassword',
                });

            expect(response.statusCode).toBe(401);
        });

        it('Should change password', async () => {
            const response = await request(app)
                .post('/users/changePassword')
                .set('Cookie', [`access_token=${systemAdmin.access_token}`])
                .send({
                    currentPassword: systemAdmin.password,
                    newPassword: 'aaaaaaaa',
                    confirmPassword: 'aaaaaaaa',
                });

            expect(response.statusCode).toBe(200);
            expect(response.res.headers['content-type']).toMatch(
                'application/json'
            );
        });

        it('Should not change password because passwords dont match', async () => {
            const response = await request(app)
                .post('/users/changePassword')
                .set('Cookie', [`access_token=${systemAdmin.access_token}`])
                .send({
                    currentPassword: systemAdmin.password,
                    newPassword: 'aaaaaaaa',
                    confirmPassword: 'bbbbbbbb',
                });

            expect(response.statusCode).toBe(401);
        });

        it('Should not change password because current password is invalid', async () => {
            const response = await request(app)
                .post('/users/changePassword')
                .set('Cookie', [`access_token=${systemAdmin.access_token}`])
                .send({
                    currentPassword: 'inavlid_password',
                    newPassword: 'aaaaaaaa',
                    confirmPassword: 'aaaaaaaa',
                });

            expect(response.statusCode).toBe(401);
        });
    });
});

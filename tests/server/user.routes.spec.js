const path = require('path');
const request = require('supertest');
const jwt = require('jsonwebtoken');

const User = require(path.join(
    process.cwd(),
    'src/modules/user/server/user.model'
));

const app = require(path.join(
    process.cwd(),
    'src/config/server/lib/express'
))();

const specHelper = require(path.join(process.cwd(), 'jest/spec.helper'));

describe('User Routes', () => {
    afterEach(async () => { 
        await User.destroy({
            where: {
                type: 'Site Admin'
            }
        })
    });

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
            await request(app)
                .post('/users')
                .set('Cookie', [`access_token=${systemAdmin.access_token}`])
                .send({
                    name: 'testUser',
                    email: 'testUser@gmail.com',
                    password: 'abcpassword',
                });
            
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

        it('Should not change password because passwords is short', async () => {
            const response = await request(app)
                .post('/users/changePassword')
                .set('Cookie', [`access_token=${systemAdmin.access_token}`])
                .send({
                    currentPassword: systemAdmin.password,
                    newPassword: 'aaaa',
                    confirmPassword: 'aaaa',
                });

            expect(response.statusCode).toBe(400);
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

            expect(response.statusCode).toBe(400);
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
    });

    describe('POST /change_site_admin_account_status', () => {
        let token; 
        let email;
        let is_active;
        let user;

        const exec = async () => {
            return await request(app)
                .post('/change_site_admin_account_status')
                .set('Cookie', [`access_token=${token}`])
                .send({
                    email,
                    is_active
                });
        }

        beforeEach(async () => {
            user = await User.create({
                name: 'a',
                email: 'a@gmail.com',
                is_active: false
            })
            
            token = systemAdmin.access_token;
            email = 'a@gmail.com';
            is_active = true;
        })

        it('Should return 401 if system admin is not logged in', async () => {
            token = '';
            email = 'a@gmail.com';
            is_active = 1;

            const response = await exec()

            expect(response.statusCode).toBe(401);
        });

        it('should return 404 if email is invalid', async () => {
            email = 'a'
            is_active = 1;

            const response = await exec()

            expect(response.statusCode).toBe(404)
        })

        it('should change the status of the site admin account if it is valid', async () => {
            const response = await exec()

            const updatedUser = await User.findOne({
                where: {
                    id: user.id
                }
            })

            expect(response.statusCode).toBe(200)
            expect(updatedUser.is_active).toBe(true)
        })

        it('should return the updated site admin if it is valid', async () => {
            const response = await exec();
      
            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('email', email);
            expect(response.body).toHaveProperty('is_active', is_active);
        });
    })

    describe('POST /delete_site_admin_account', () => {
        let token; 
        let email;
        let user;

        const exec = async () => {
            return await request(app)
                .post('/delete_site_admin_account')
                .set('Cookie', [`access_token=${token}`])
                .send({
                    email
                });
        }

        beforeEach(async () => {
            user = await User.create({
                name: 'a',
                email: 'a@gmail.com'
            })
            
            token = systemAdmin.access_token;
            email = 'a@gmail.com';
        })

        it('Should return 401 if system admin is not logged in', async () => {
            token = '';
            email = 'a@gmail.com';

            const response = await exec();

            expect(response.statusCode).toBe(401);
        })

        it('Should return 404 if email is invalid', async () => {
            email = 'a';

            const response = await exec();

            expect(response.statusCode).toBe(404);
        })

        it('should delete the user if it is valid', async () => {
            const response = await exec();

            const deleteddUser = await User.findOne({
                where: {
                    id: user.id
                }
            })

            expect(response.statusCode).toBe(200)
            expect(deleteddUser).toBeFalsy()
        })

        it('should return the deleted site admin if it is valid', async () => {
            const response = await exec();
      
            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('email', email);
        });
    })

    describe('GET /get_site_admin_list', () => {
        let token; 

        const exec = async () => {
            return await request(app)
                .get('/get_site_admin_list')
                .set('Cookie', [`access_token=${token}`])
        }

        beforeEach(async () => {
            await User.create({
                name: 'a',
                email: 'a@gmail.com',
                type: 'Site Admin'
            })
            
            token = systemAdmin.access_token;
        })

        it('Should return 401 if system admin is not logged in', async () => {
            token = '';

            const response = await exec();

            expect(response.statusCode).toBe(401);
        })

        it('should return all site admins', async () => {
            const response = await exec();

            expect(response.statusCode).toBe(200);
            expect(response.body.length).toBe(1);
            expect(response.body.some(u => u.name === 'a' && u.email === 'a@gmail.com')).toBeTruthy();
        })
    })
});

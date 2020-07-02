const path = require('path');
const faker = require('faker');
const supertest = require('supertest');

const specHelper = require(path.join(process.cwd(), 'jest/spec.helper'));
const app = require(path.join(process.cwd(), 'src/config/server/lib/express'));

const { Test, PropTypes } = require('./helper')

const { defaultUser } = specHelper.hcp;
const { defaultApplication, users: { defaultAdmin } } = specHelper;

let appInstance;
let request;

beforeAll(async () => {
    const config = require(path.join(process.cwd(),'src/config/server/config'));
    await config.initEnvironmentVariables();
    appInstance = await app();
    request = supertest(appInstance);
});

describe('HCP Routes', () => {
    Test('Should provide profile information for existing userID - Get HCP Profile', () => appInstance)
        .header('Authorization', 'bearer ' + defaultApplication.access_token)
        .isJSON()
        .validateBodySchema({
            id: PropTypes.String,
            application_id: PropTypes.String,
            uuid: PropTypes.String,
            first_name: PropTypes.String,
            last_name: PropTypes.String,
            email: PropTypes.String,
            phone: PropTypes.String,
            country_iso2: PropTypes.String,
            status: PropTypes.String,
          })
        .get(`/api/hcp-profiles/${defaultUser.id}`, 200)

    Test('Should get 404 when userID does not exist - Get HCP Profile', () => appInstance)
        .header('Authorization', 'bearer ' + defaultApplication.access_token)
        .get(`/api/hcp-profiles/${faker.random.uuid()}`, 404)

    Test('Should reset password of HCP user when given valid email and id - HCP Reset Password', () => appInstance)
        .header('Authorization', 'bearer ' + defaultApplication.access_token)
        .put(`/api/hcp-profiles/${defaultUser.id}/reset-password`, 200, (password => ({
            email: defaultUser.email,
            password,
            confirm_password: password
        }))(faker.internet.password()))

    Test('Should get 404 when email or ID not found in th DB - HCP Reset Password', () => appInstance)
        .header('Authorization', 'bearer ' + defaultApplication.access_token)
        .put(`/api/hcp-profiles/${faker.random.uuid()}/reset-password`, 404, (password => ({
            email: faker.internet.email(),
            password,
            confirm_password: password
        }))(faker.internet.password()))

    Test('Should get 400 when confirm password and new password does not match - HCP Reset Password', () => appInstance)
        .header('Authorization', 'bearer ' + defaultApplication.access_token)
        .put(`/api/hcp-profiles/${defaultUser.id}/reset-password`, 400, {
            email: defaultUser.email,
            password: faker.internet.password(),
            confirm_password: faker.internet.password()
        })

    Test('Should get 400 when requesting password reset with invalid uuid - HCP Reset Password', () => appInstance)
        .header('Authorization', 'bearer ' + defaultApplication.access_token)
        .put(`/api/hcp-profiles/7ae01718-3ac1-473a-a072-f6dc2d2bec/reset-password`, 400, {
            email: defaultUser.email,
            password: 'NewPassword2',
            confirm_password: 'NewPassword2'
        })

    Test('Should create a new HCP profile - Create HCP Profile', () => appInstance)
        .header('Authorization', 'bearer ' + defaultApplication.access_token)
        .post('/api/hcp-profiles', 200, {
            "first_name":"john",
            "last_name":"doe",
            "uuid":"ABCD123456789",
            "email":"abcdefg@gmail.com",
            "password":"gffhjk",
            "phone":"9898989",
            "country_iso2":"DE",
            "status":"Approved",
            "consents":[
                {"827cc68d-a92d-4939-a9b6-d373321d23bb": true },
                {"827cc68d-a92d-4939-a9b6-d373321d23bb": true },
                {"827cc68d-a92d-4939-a9b6-d373321d23bb": true }
            ],
            "application_id":"20490c6b-1dcf-40ad-9534-37c6d4585b28"
        })



    Test('Should get 400 when creating HCP profile with existing email - Create HCP Profile', () => appInstance)
        .header('Authorization', 'bearer ' + defaultApplication.access_token)
        .post('/api/hcp-profiles', 400, {
            "first_name": "john",
            "last_name": "doe",
            "uuid": "ABCD123456789",
            "email": defaultUser.email,
            "password": "gffhjk",
            "phone": "9898989",
            "country_iso2": "DE",
            "status": "Approved",
            "consents":[
                {"827cc68d-a92d-4939-a9b6-d373321d23bb": true },
                {"827cc68d-a92d-4939-a9b6-d373321d23bb": true },
                {"827cc68d-a92d-4939-a9b6-d373321d23bb": true }
            ],
            "application_id": "20490c6b-1dcf-40ad-9534-37c6d4585b28"
        })

    it('Should get user details from master data with email or uuid', async () => {
        const response = await request
            .post('/api/hcp-profiles/master-details')
            .set('Authorization', `bearer ${defaultApplication.access_token}`)
            .send({
                email: faker.internet.email(),
                uuid: '59910379201'
            });

        expect(response.statusCode).toBe(200);
        expect(response.res.headers['content-type']).toMatch('application/json');
    });

    it('Should not found user details from master data with invalid email or uuid', async () => {
        const response = await request
            .post('/api/hcp-profiles/master-details')
            .set('Authorization', `bearer ${defaultApplication.access_token}`)
            .send({
                email: faker.internet.email(),
                uuid: faker.random.uuid()
            });

        expect(response.statusCode).toBe(404);
    });

    Test('Should edit an HCP user - Edit HCP user', () => appInstance)
        .cookie({ access_token: defaultAdmin.access_token })
        .put(`/api/hcps/${defaultUser.id}`, 200, {
            first_name: faker.name.firstName(),
            last_name: faker.name.lastName(),
            phone: faker.phone.phoneNumber()
        })

    Test('Should get 404 when trying to edit an non existing HCP user - Edit HCP user', () => appInstance)
        .cookie({ access_token: defaultAdmin.access_token })
        .put(`/api/hcps/${faker.random.uuid()}`, 404, {
            first_name: faker.name.firstName(),
            last_name: faker.name.lastName(),
            phone: faker.phone.phoneNumber()
        })

    it('Should get hcp users data', async () => {
            const response = await request.get('/api/hcps/?page=1&is_active=Approved')
            .set('Cookie', [`access_token=${defaultAdmin.access_token}`])

            expect(response.statusCode).toBe(200);
            expect(response.res.headers['content-type']).toMatch('application/json');
        });

    it('Should get hcp users data of all status when no is_active given', async () => {
            const response = await request.get('/api/hcps/?page=1&is_active=null')
            .set('Cookie', [`access_token=${defaultAdmin.access_token}`])

            expect(response.statusCode).toBe(200);
            expect(response.res.headers['content-type']).toMatch('application/json');
        });
});

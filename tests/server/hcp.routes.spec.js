const path = require('path');
const faker = require('faker');
const supertest = require('supertest');

const specHelper = require(path.join(process.cwd(), 'jest/spec.helper'));
const app = require(path.join(process.cwd(), 'src/config/server/lib/express'));

const { Test, PropTypes } = require('./helper')

const { defaultUser } = specHelper.hcp;
const { defaultApplication } = specHelper;

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

    it('Should get 404 when userID does not exist - Get HCP Profile', async () => {
        const response = await request
            .get(`/api/hcp-profiles/${faker.random.uuid()}`)
            .set('Authorization', 'bearer ' + defaultApplication.access_token)

        expect(response.statusCode).toBe(404);
    });

    Test('Should get 401 when sending request with invalid credential - Get HCP Profile', () => appInstance)
        .header('Authorization', 'bearer ' + defaultApplication.access_token.slice(0, -2)+'2xj')
        .get(`/api/hcp-profiles/${defaultUser.id}`, 401)

    it('Should reset password of HCP user when given valid email and id - HCP Reset Password', async () => {
        const password = faker.internet.password()
        const response = await request
            .put('/api/hcp-profiles/reset-password')
            .set('Authorization', 'bearer ' + defaultApplication.access_token)
            .send({
                email: defaultUser.email,
                password,
                confirm_password: password
            });

        expect(response.statusCode).toBe(200);
    });

    it('Should get 404 when email or ID not found in th DB - HCP Reset Password', async () => {
        const password = faker.internet.password()
        const response = await request
            .put('/api/hcp-profiles/reset-password')
            .set('Authorization', 'bearer ' + defaultApplication.access_token)
            .send({
                email: faker.internet.email(),
                password,
                confirm_password: password
            });

        expect(response.statusCode).toBe(404);
    });

    Test('Should get 400 when confirm password and new password does not match - HCP Reset Password', () => appInstance)
        .header('Authorization', 'bearer ' + defaultApplication.access_token)
        .put('/api/hcp-profiles/reset-password', 400, {
            email: defaultUser.email,
            password: faker.internet.password(),
            confirm_password: faker.internet.password()
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

    Test('Should get 401 when creating HCP profile with invalid credentials - Create HCP Profile', () => appInstance)
    .header('Authorization', 'bearer ' + defaultApplication.access_token.slice(0,-3)+'2xq')
        .post('/api/hcp-profiles', 401, {
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

    Test('Should get 200 when checking for HCP master data with existing email or UUID - Check HCP Master', () => appInstance)
        .header('Authorization', 'bearer ' + defaultApplication.access_token)
        .post('/api/hcp-profiles/master-details', 200, {
            email: '',
            uuid: '99910880301'
        })

    it('Should get 404 when queyring datasync for a HCP user that does not exists - Check HCP Master', async () => {
        const response = await request
            .post('/api/hcp-profiles/master-details')
            .set('Authorization', 'bearer ' + defaultApplication.access_token)
            .send({
                email: faker.internet.email(),
                uuid: faker.random.uuid()
            })

        expect(response.statusCode).toBe(404)
    })

    Test('Should get 401 when checking for HCP master data with Invalid credentials - Check HCP Master', () => appInstance)
        .header('Authorization', 'bearer ' + defaultApplication.access_token.slice(0,-3)+'2xq')
        .post('/api/hcp-profiles/master-details', 401, {
            email: faker.internet.email(),
            uuid: faker.random.uuid()
        })

});

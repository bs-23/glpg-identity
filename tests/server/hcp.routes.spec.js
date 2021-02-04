const path = require('path');
const faker = require('faker');
const supertest = require('supertest');
const axios = require('axios');
const MockAdapter =  require('axios-mock-adapter');

const specHelper = require(path.join(process.cwd(), 'jest/spec.helper'));
const app = require(path.join(process.cwd(), 'src/config/server/lib/express'));

const { defaultUser, userWithInvalidUUID, userWithValidUUID } = specHelper.hcp;
const { defaultApplication, users: { defaultAdmin } } = specHelper;
const { demoConsent } = specHelper.consent;
const { signCookie, generateConsentConfirmationToken } = specHelper;

let appInstance;
let request;
let fakeAxios;

jest.setTimeout(20000);

beforeAll(async () => {
    const config = require(path.join(process.cwd(), 'src/config/server/config'));
    await config.initEnvironmentVariables();
    appInstance = await app();
    request = supertest(appInstance);
    fakeAxios = new MockAdapter(axios);
});

describe('HCP Routes', () => {
    it('Should get hcp user by id', async () => {
        const response = await request
            .get(`/api/hcp-profiles/${defaultUser.id}`)
            // .set('Cookie', [`access_token=s:${signCookie(defaultAdmin.access_token)}`])
            .set('Authorization', 'bearer ' + defaultApplication.access_token);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('data');
        expect(response.res.headers['content-type']).toMatch('application/json');
    });

    it('Should get 404 when userID does not exist - Get HCP Profile', async () => {
        const response = await request
            .get(`/api/hcp-profiles/${faker.random.uuid()}`)
            // .set('Cookie', [`access_token=s:${signCookie(defaultAdmin.access_token)}`])
            .set('Authorization', 'bearer ' + defaultApplication.access_token)

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors).toHaveLength(1);
    });

    it('Should not change password with invalid credentials', async () => {
        const response = await request.put('/api/hcp-profiles/change-password')
            .set('Authorization', 'bearer ' + defaultApplication.access_token)
            .send({
                email: faker.internet.email(),
                current_password: faker.internet.password(),
                new_password: '123456',
                confirm_password: '123456'
            });

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors).toHaveLength(1);
    });

    it('Should not change password if password and confirm password does not match', async () => {
        const response = await request.put('/api/hcp-profiles/change-password')
            .set('Authorization', 'bearer ' + defaultApplication.access_token)
            .send({
                email: defaultUser.email,
                current_password: defaultUser.password,
                new_password: faker.internet.password(),
                confirm_password: faker.internet.password()
            });

        expect(response.statusCode).toBe(400);
    });

    it('Should change password with valid parameters', async () => {
        const response = await request.put('/api/hcp-profiles/change-password')
            .set('Authorization', 'bearer ' + defaultApplication.access_token)
            .send({
                email: defaultUser.email,
                current_password: defaultUser.password,
                new_password: 'P@ssword123',
                confirm_password: 'P@ssword123'
            });


        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('data');
    });

    it('Should not create a new HCP profile with existing email or uuid', async () => {
        const response = await request.post('/api/hcp-profiles')
            .set('Authorization', 'bearer ' + defaultApplication.access_token)
            .send({
                first_name: faker.name.lastName(),
                last_name: faker.name.firstName(),
                uuid: '218312938c',
                email: defaultUser.email,
                country_iso2: 'NL',
                language_code: 'nl',
                locale: 'nl_nl',
                salutation: 'Mr',
                specialty_onekey: 'SP.WNL.01',
                origin_url: 'www.example.com'
            });

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors).toHaveLength(1);
        expect(response.res.headers['content-type']).toMatch('application/json');
    });

    it('Should not get user details without a valid uuid in registration lookup', async () => {
        const response = await request
            .post('/api/hcp-profiles/registration-lookup')
            .set('Authorization', `bearer ${defaultApplication.access_token}`)
            .send({
                email: faker.internet.email(),
                uuid: faker.random.uuid()
            });

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors).toHaveLength(1);
        expect(response.res.headers['content-type']).toMatch('application/json');
    });

    // it('Should edit an HCP user - Edit HCP user', async () => {
    //     const response = await request.put(`/api/hcps/${defaultUser.id}`)
    //         .set('Cookie', [`access_token=s:${signCookie(defaultAdmin.access_token)}`])
    //         .send({
    //             first_name: faker.name.firstName(),
    //             last_name: faker.name.lastName()
    //         });

    //     expect(response.statusCode).toBe(200);
    //     expect(response.body).toHaveProperty('data');
    //     expect(response.res.headers['content-type']).toMatch('application/json');
    // });

    // it('Should get 404 when trying to edit an non existing HCP user - Edit HCP user', async () => {
    //     const response = await request.put(`/api/hcps/${faker.random.uuid()}`)
    //         .set('Cookie', [`access_token=s:${signCookie(defaultAdmin.access_token)}`])
    //         .send({
    //             first_name: faker.name.firstName(),
    //             last_name: faker.name.lastName(),
    //             telephone: faker.phone.phoneNumber()
    //         });

    //     expect(response.statusCode).toBe(404);
    //     expect(response.body).toHaveProperty('errors');
    //     expect(response.body.errors).toHaveLength(1);
    // });

    // it('Should edit an HCP user profile for hcp-portal - Edit HCP profile', async () => {
    //     const response = await request.put(`/api/hcp-profiles/${defaultUser.id}`)
    //         .set('Authorization', `bearer ${defaultApplication.access_token}`)
    //         .send({
    //             first_name: faker.name.firstName(),
    //             last_name: faker.name.lastName()
    //         });

    //     expect(response.statusCode).toBe(200);
    //     expect(response.body).toHaveProperty('data');
    //     expect(response.res.headers['content-type']).toMatch('application/json');
    // });

    // it('Should get hcp users data', async () => {
    //     const response = await request
    //         .get('/api/hcps/?page=1&status=self_verified')
    //         .set('Cookie', [`access_token=s:${signCookie(defaultAdmin.access_token)}`])

    //     expect(response.statusCode).toBe(200);
    //     expect(response.body).toHaveProperty('data');
    //     expect(response.res.headers['content-type']).toMatch('application/json');
    // });

    it('Should get specialties for given locale', async () => {
        const response = await request
            .get('/api/hcp-profiles/specialties?locale=nl_NL&country_iso2=nl')
            .set('Authorization', `bearer ${defaultApplication.access_token}`)


        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('data');
        expect(response.res.headers['content-type']).toMatch('application/json');
    });

    it('Should get "Bad Request" status for missing locale', async () => {
        const response = await request
            .get('/api/hcp-profiles/specialties')
            .set('Authorization', `bearer ${defaultApplication.access_token}`);

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors).toHaveLength(2);
    });

    it('Should get "Not Found" status for unknown locale', async () => {
        const response = await request
            .get('/api/hcp-profiles/specialties?locale=unknown_locale&country_iso2=nl')
            .set('Authorization', `bearer ${defaultApplication.access_token}`);

        expect(response.statusCode).toBe(204);
    });

    describe('HCP Registration Journeys', () => {
        let HCPModel;
        let HCPConsents;
        let singleOptInConsent;
        let doubleOptInConsent;
        let consentConfirmationToken;
        let getNumberOfConfirmedUnconfirmedConsents;

        beforeAll(() => {
            HCPModel = require(path.join(process.cwd(), 'src/modules/information/hcp/server/hcp-profile.model.js'));
            HCPConsents = require(path.join(process.cwd(), 'src/modules/information/hcp/server/hcp-consents.model.js'));

            singleOptInConsent =  {
                locale: 'nl_nl',
                country_iso2: 'nl',
                consents: [
                    { [demoConsent.slug] : true }
                ]
            }

            doubleOptInConsent = {
                locale: 'nl_be',
                country_iso2: 'be',
                consents: [
                    { [demoConsent.slug] : true }
                ]
            }

            getNumberOfConfirmedUnconfirmedConsents = async (userID) => {
                const hcpUserConsents = await HCPConsents.findAll({
                    where: {
                        user_id: userID
                    }
                });

                const numberOfConfirmedConsents = hcpUserConsents.filter(c => c.consent_confirmed === true).length;
                const numberOfUnConfirmedConsents = hcpUserConsents.filter(c => c.consent_confirmed === false).length;

                return [numberOfConfirmedConsents, numberOfUnConfirmedConsents];
            }
        });

        describe('Valid UUID Single Opt In', () => {
            beforeAll(async (done) => {
                await HCPModel.destroy({ where: {} });
                await HCPConsents.destroy({ where: {} });
                done();
            });

            it('Should create a new HCP profile with valid UUID', async () => {
                const response = await request.post('/api/hcp-profiles')
                    .set('Authorization', 'bearer ' + defaultApplication.access_token)
                    .send({
                        ...userWithValidUUID,
                        ...singleOptInConsent
                    });

                const hcpUserID = response.body.data.id;
                const [numberOfConfirmedConsents, numberOfUnConfirmedConsents] = await getNumberOfConfirmedUnconfirmedConsents(hcpUserID);

                expect(numberOfConfirmedConsents).toBe(1);
                expect(numberOfUnConfirmedConsents).toBe(0);

                expect(response.statusCode).toBe(200);
                expect(response.body).toHaveProperty('data');
                expect(response.body.data.status).toBe('self_verified');
                expect(response.body.data).toHaveProperty('password_reset_token');
                expect(response.res.headers['content-type']).toMatch('application/json');
            });

            it('Should reset password of HCP', async () => {
                const hcp = await HCPModel.findOne({ where: { email: userWithValidUUID.email.toLowerCase() } });

                const response = await request.put(`/api/hcp-profiles/reset-password?token=${hcp.reset_password_token}`)
                    .set('Authorization', 'bearer ' + defaultApplication.access_token)
                    .send({
                        new_password: 'P@ssword123',
                        confirm_password: 'P@ssword123'
                    });

                expect(response.statusCode).toBe(200);
            })
        });

        describe('Valid UUID Double Opt In', () => {
            beforeAll(async (done) => {
                await HCPModel.destroy({ where: {} });
                await HCPConsents.destroy({ where: {} });
                done();
            });

            it('Should create a new HCP user', async () => {
                const response = await request.post('/api/hcp-profiles')
                    .set('Authorization', 'bearer ' + defaultApplication.access_token)
                    .send({
                        ...userWithValidUUID,
                        ...doubleOptInConsent
                    });

                consentConfirmationToken = response.body.data.consent_confirmation_token;

                const hcpUserID = response.body.data.id;
                const [numberOfConfirmedConsents, numberOfUnConfirmedConsents] = await getNumberOfConfirmedUnconfirmedConsents(hcpUserID);

                expect(numberOfConfirmedConsents).toBe(0);
                expect(numberOfUnConfirmedConsents).toBe(1);

                expect(response.statusCode).toBe(200);
                expect(response.body).toHaveProperty('data');
                expect(response.body.data.status).toBe('consent_pending');
                expect(response.body.data).not.toHaveProperty('password_reset_token');
                expect(response.res.headers['content-type']).toMatch('application/json');
            });

            it('Should confirm consents of HCP user', async () => {
                const response = await request.post('/api/hcp-profiles/confirm-consents')
                    .set('Authorization', 'bearer ' + defaultApplication.access_token)
                    .send({ token: consentConfirmationToken });

                const hcpUserID = response.body.data.id;
                const [numberOfConfirmedConsents, numberOfUnConfirmedConsents] = await getNumberOfConfirmedUnconfirmedConsents(hcpUserID);

                expect(numberOfConfirmedConsents).toBe(1);
                expect(numberOfUnConfirmedConsents).toBe(0);

                expect(response.statusCode).toBe(200);
                expect(response.body).toHaveProperty('data');
                expect(response.body.data.status).toBe('self_verified');
                expect(response.body.data).toHaveProperty('password_reset_token');
                expect(response.res.headers['content-type']).toMatch('application/json');
            });
        })

        describe('Invalid UUID Single Opt In', () => {
            beforeAll(async (done) => {
                await HCPModel.destroy({ where: {} });
                await HCPConsents.destroy({ where: {} });
                done();
            });

            it('Should create a new HCP user', async () => {
                const response = await request.post('/api/hcp-profiles')
                    .set('Authorization', 'bearer ' + defaultApplication.access_token)
                    .send({
                        ...userWithInvalidUUID,
                        ...singleOptInConsent
                    });

                const hcpUserID = response.body.data.id;
                const [numberOfConfirmedConsents, numberOfUnConfirmedConsents] = await getNumberOfConfirmedUnconfirmedConsents(hcpUserID);

                expect(numberOfConfirmedConsents).toBe(1);
                expect(numberOfUnConfirmedConsents).toBe(0);

                expect(response.statusCode).toBe(200);
                expect(response.body).toHaveProperty('data');
                expect(response.body.data.status).toBe('not_verified');
                expect(response.res.headers['content-type']).toMatch('application/json');
            });

            it('Should approve not verified HCP user', async () => {
                const hcp = await HCPModel.findOne({ where: { email: userWithInvalidUUID.email.toLowerCase() }});

                fakeAxios.onPost(`https://www-dev.jyseleca.nl/bin/public/glpg-brandx/mail/approve-user`).reply(200);

                const response = await request.put(`/api/hcp-profiles/${hcp.id}/approve`)
                    .set('Cookie', [`access_token=s:${signCookie(defaultAdmin.access_token)}`])

                expect(response.statusCode).toBe(200);
                expect(response.body).toHaveProperty('data');
                expect(response.body.data.status).toBe('manually_verified');
                expect(response.res.headers['content-type']).toMatch('application/json');
            });

            it('Should reject not verified HCP user', async () => {
                await HCPModel.destroy({ where: {} });

                const { body: { data: hcp }} = await request.post('/api/hcp-profiles')
                    .set('Authorization', 'bearer ' + defaultApplication.access_token)
                    .send({
                        ...userWithInvalidUUID,
                        ...singleOptInConsent
                    });

                const response = await request.put(`/api/hcp-profiles/${hcp.id}/reject`)
                    .set('Cookie', [`access_token=s:${signCookie(defaultAdmin.access_token)}`])

                const doesHCPExistInDB = await HCPModel.findOne({ where: { id: hcp.id } });

                expect(doesHCPExistInDB).toBeFalsy();

                expect(response.statusCode).toBe(200);
                expect(response.body).toHaveProperty('data');
                expect(response.res.headers['content-type']).toMatch('application/json');
            });
        })

        describe('Invalid UUID Double Opt In', () => {
            beforeAll(async (done) => {
                await HCPModel.destroy({ where: {} });
                await HCPConsents.destroy({ where: {} });
                done();
            });

            it('Should create a new HCP user', async () => {
                const response = await request.post('/api/hcp-profiles')
                    .set('Authorization', 'bearer ' + defaultApplication.access_token)
                    .send({
                        ...userWithInvalidUUID,
                        ...doubleOptInConsent
                    });

                const hcpUserID = response.body.data.id;
                const [numberOfConfirmedConsents, numberOfUnConfirmedConsents] = await getNumberOfConfirmedUnconfirmedConsents(hcpUserID);

                expect(numberOfConfirmedConsents).toBe(0);
                expect(numberOfUnConfirmedConsents).toBe(1);

                expect(response.statusCode).toBe(200);
                expect(response.body).toHaveProperty('data');
                expect(response.body.data.status).toBe('not_verified');
                expect(response.res.headers['content-type']).toMatch('application/json');
            });

            it('Should approve not verified HCP user', async () => {
                const hcp = await HCPModel.findOne({ where: { email: userWithInvalidUUID.email.toLowerCase() }});

                fakeAxios.onPost(`https://www-dev.jyseleca.nl/bin/public/glpg-brandx/mail/approve-user`).reply(200);

                const response = await request.put(`/api/hcp-profiles/${hcp.id}/approve`)
                    .set('Cookie', [`access_token=s:${signCookie(defaultAdmin.access_token)}`])

                expect(response.statusCode).toBe(200);
                expect(response.body).toHaveProperty('data');
                expect(response.body.data.status).toBe('consent_pending');
                expect(response.res.headers['content-type']).toMatch('application/json');
            });

            it('Should confirm consents of HCP user', async () => {
                const hcp = await HCPModel.findOne({ where: { email: userWithInvalidUUID.email.toLowerCase() }});

                consentConfirmationToken = generateConsentConfirmationToken(hcp);

                const response = await request.post('/api/hcp-profiles/confirm-consents')
                    .set('Authorization', 'bearer ' + defaultApplication.access_token)
                    .send({ token: consentConfirmationToken });

                const hcpUserID = response.body.data.id;
                const [numberOfConfirmedConsents, numberOfUnConfirmedConsents] = await getNumberOfConfirmedUnconfirmedConsents(hcpUserID);

                expect(numberOfConfirmedConsents).toBe(1);
                expect(numberOfUnConfirmedConsents).toBe(0);

                expect(response.statusCode).toBe(200);
                expect(response.body).toHaveProperty('data');
                expect(response.body.data.status).toBe('manually_verified');
                expect(response.body.data).toHaveProperty('password_reset_token');
                expect(response.res.headers['content-type']).toMatch('application/json');
            });
        })
    })
});

const path = require('path');
const supertest = require('supertest');

const specHelper = require(path.join(process.cwd(), 'jest/spec.helper'));
const app = require(path.join(process.cwd(), 'src/config/server/lib/express'));

const { defaultApplication } = specHelper;
const { signCookie } = specHelper;
const { consent: { demoConsent } } = specHelper;
const { defaultAdmin, defaultUser } = specHelper.users;
const { serviceCategories } = specHelper;

let request;

jest.setTimeout(20000);

beforeAll(async () => {
    const config = require(path.join(process.cwd(), 'src/config/server/config'));
    await config.initEnvironmentVariables();

    const appInstance = await app();
    request = supertest(appInstance);
});

describe('Profile Routes', () => {
    it('Should get profiles', async () => {
        const response = await request
            .get(`/api/profiles`)
            .set('Cookie', [`access_token=s:${signCookie(defaultAdmin.access_token)}`]);

        expect(response.statusCode).toBe(200);
        expect(response.res.headers['content-type']).toMatch('application/json');
    });

    // it('Should create and edit profile', async () => {
    //     const response1 = await request
    //         .post(`/api/permissionSets`)
    //         .set('Cookie', [`access_token=s:${signCookie(defaultAdmin.access_token)}`])
    //         .send({
    //             title: "a",
    //             description: "a",
    //             countries: ["BE"],
    //             serviceCategories: [serviceCategories[0].id],
    //             applications: []
    //         });

    //     expect(response1.statusCode).toBe(200);
    //     expect(response1.res.headers['content-type']).toMatch('application/json');

    //     const response2 = await request
    //         .post(`/api/profiles`)
    //         .set('Cookie', [`access_token=s:${signCookie(defaultAdmin.access_token)}`])
    //         .send({
    //             title: "aa",
    //             description: "aa",
    //             permissionSets: [response1.body.id]
    //         });

    //     expect(response2.statusCode).toBe(200);
    //     expect(response2.res.headers['content-type']).toMatch('application/json');

    //     const response3 = await request
    //         .put(`/api/profiles/${response2.body.id}`)
    //         .set('Cookie', [`access_token=s:${signCookie(defaultAdmin.access_token)}`])
    //         .send({
    //             title: "a",
    //             description: "bb",
    //             permissionSets: [response1.body.id]});

    //     expect(response3.statusCode).toBe(200);
    //     expect(response3.res.headers['content-type']).toMatch('application/json');
    // });
});

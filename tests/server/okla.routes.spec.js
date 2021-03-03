const path = require('path');
const supertest = require('supertest');
const axios = require('axios');
const MockAdapter =  require('axios-mock-adapter');

const specHelper = require(path.join(process.cwd(), 'jest/spec.helper'));
const app = require(path.join(process.cwd(), 'src/config/server/lib/express'));

const { signCookie } = specHelper;
const { defaultAdmin, defaultUser } = specHelper.users;

let request;
let mockAxios;
let data;

jest.setTimeout(20000);

beforeAll(async () => {
    const config = require(path.join(process.cwd(), 'src/config/server/config'));
    await config.initEnvironmentVariables();

    const appInstance = await app();
    request = supertest(appInstance);
    mockAxios = new MockAdapter(axios);
    data = {
        response: {
            searchOutputFormatVersion: 1.4,
            success: true,
            status: 'SUCCESS',
            resultSize: 30,
            totalNumberOfResults: 18,
            numberOfIndividuals: 5,
            numberOfActivities: 17,
            numberOfWorkplaces: 17,
            results: [
                {
                    onekeyEid: 'WBEB0171456102',
                    relevancyScore: 350.95,
                    isInContract: false,
                    isPrivacyLaw: false,
                    entityType: 'ACTIVITY',
                    country: 'BE',
                    codBase: 'WBE',
                    activity: {
                      activityEid: 'WBEB0171456102',
                      isPrivacyLaw: false,
                      qualifications: {},
                      statusCode: '3',
                      statusCorporateLabel: 'Valid',
                      statusLabel: 'Valid'
                    },
                    individual: {
                      individualEid: 'WBEB01714561',
                      firstName: 'Johan',
                      firstName2: null,
                      genderCode: 'M',
                      genderCorporateLabel: 'Male',
                      genderLabel: 'Male',
                      lastName: 'De Bast',
                      lastName2: null,
                      middleName: null,
                      statusCode: '3',
                      statusCorporateLabel: 'Valid',
                      statusLabel: 'Valid',
                      typeCode: 'M',
                      typeCorporateLabel: 'Physician',
                      externalKeys: {
                        'I1,1': {
                            number: 1,
                            typeCode: 'I1',
                            typeCorporateLabel: 'Numéro INAMI (RIZIV en nééerlandais)',
                            typeLabel: 'INAMI',
                            value: '1-99722-01-520'
                        }
                      },
                      typeLabel: 'Médecin'
                    },
                    workplace: {
                        workplaceEid: 'WBEH01410437',
                        isPrivacyLaw: false,
                        managerWorkplaceUsualName: null,
                        managerWorkplaceUsualName2: null,
                        qualifications: {
                            'SP,1': {
                                country: 'BE',
                                statusCode: '3',
                                statusDate: '2000-01-07T00:00:00Z',
                                statusLabel: 'Valid',
                                subdivisions: {
                                COUNTRY: {
                                    longLabel: null,
                                    longLocalizedLabel: 'BELGIUM',
                                    officialEid: null,
                                    shortLabel: null,
                                    shortLocalizedLabel: null,
                                    typeCode: 'COUNTRY',
                                    typeCodeLabel: 'Pays'
                                },
                                'SUB.3': {
                                    longLabel: null,
                                    longLocalizedLabel: 'Brabant',
                                    officialEid: null,
                                    shortLabel: null,
                                    shortLocalizedLabel: null,
                                    typeCode: 'PROVINCE',
                                    typeCodeLabel: 'Province'
                                },
                                'SUB.5': {
                                    longLabel: null,
                                    longLocalizedLabel: 'BRUXELLES',
                                    officialEid: null,
                                    shortLabel: null,
                                    shortLocalizedLabel: null,
                                    typeCode: 'CITY',
                                    typeCodeLabel: 'Commune'
                                }
                                },
                                villageLabel: 'Brussel',
                                villageLabel2: null
                            }
                        },
                        statusCode: '3',
                        statusCorporateLabel: 'Valid',
                        statusLabel: 'Valid',
                        usualName: 'Centre Médical Malou',
                        usualName2: null,
                        workplaceAddresses: {
                            'P,1': {
                                address: {
                                    addressEid: 'WBE00000023060',
                                    addressLongLabel: 'Mont Saint-Lambert 5',
                                    addressLongLabel2: null,
                                    geocodingAddresses: {
                                        W: {
                                            geoCodingSystemCode: 'W',
                                            geoCodingSystemLabel: 'WGS84',
                                            latitude: 50.88632762432098,
                                            levelCode: null,
                                            levelLabel: null,
                                            longitude: 4.30989414453506,
                                            statusCode: null,
                                            statusDate: null,
                                            statusLabel: null
                                        }
                                    },
                                    postalTownReference: {
                                        country: 'BE',
                                        statusCode: '3',
                                        statusDate: '1994-05-27T00:00:00Z',
                                        statusLabel: 'Valid',
                                        subdivisions: {
                                        COUNTRY: {
                                            longLabel: null,
                                            longLocalizedLabel: 'BELGIUM',
                                            officialEid: null,
                                            shortLabel: null,
                                            shortLocalizedLabel: null,
                                            typeCode: 'COUNTRY',
                                            typeCodeLabel: 'Pays'
                                        },
                                        'SUB.3': {
                                            longLabel: null,
                                            longLocalizedLabel: 'Flandre Orientale',
                                            officialEid: null,
                                            shortLabel: null,
                                            shortLocalizedLabel: null,
                                            typeCode: 'PROVINCE',
                                            typeCodeLabel: 'Province'
                                        },
                                        'SUB.5': {
                                            longLabel: null,
                                            longLocalizedLabel: 'SAINT NICOLAS',
                                            officialEid: null,
                                            shortLabel: null,
                                            shortLocalizedLabel: null,
                                            typeCode: 'CITY',
                                            typeCodeLabel: 'Commune'
                                        }
                                        },
                                        villageLabel: 'Sint-Niklaas',
                                        villageLabel2: null
                                    }
                                },
                                rank: 1,
                                typeCode: 'P',
                                typeCodeCorporateLabel: 'Primary address',
                                typeCodeLabel: 'Adresse principale'
                            }
                        }
                    }
                }
            ],
            facetFields: []
        }
    }
});

describe('Okla Routes', () => {
    const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));
    const searchUrl = nodecache.getValue('OKLA_SEARCH_URL');

    it('Should discover hcps', async () => {
        mockAxios.onPost(searchUrl).reply(200, data);

        const searchResponse = {
            totalNumberOfResults: 18,
            numberOfIndividuals: 5,
            resultSize: 30,
            results: [
                {
                    firstName: 'Johan',
                    lastName: 'De Bast',
                    type: 'Physician',
                    individualEid: 'WBEB01714561',
                    countryIso2: 'BE',
                    codbase: 'WBE',
                    workplaces: [
                        {
                            id: 'WBEH01410437',
                            isInContract: false,
                            isValid: true,
                            name: 'Centre Médical Malou',
                            addresss: 'Mont Saint-Lambert 5',
                            city: 'Sint-Niklaas'
                        }
                    ],
                    onekeyEidList: [ 'WBEB0171456102' ],
                    isInContract: false,
                    isValid: true
                }
            ]
        }

        const response = await request
            .post(`/api/okla/hcps/search`)
            .set('Cookie', [`access_token=s:${signCookie(defaultAdmin.access_token)}`])
            .send({
                address: "",
                city: "",
                codbases: ["WBE"],
                duplicates: false,
                externalIdentifier: "",
                firstName: "john",
                individualEid: "",
                isInContract: false,
                lastName: "",
                onekeyId: "",
                phonetic: false,
                postCode: "",
                specialties: []
            });

        expect(response.statusCode).toBe(200);
        expect(response.res.headers['content-type']).toMatch('application/json');
        expect(response.body).toEqual(searchResponse);
    });

    it('Should discover hcos', async () => {
        mockAxios.onPost(searchUrl).reply(200, data);

        const searchResponse = {
            totalNumberOfResults: 18,
            numberOfWorkplaces: 17,
            resultSize: 30,
            results: [
                {
                    name: 'Centre Médical Malou',
                    workplaceEid: 'WBEH01410437',
                    isInContract: false,
                    isValid: true,
                    specialties: [ null ],
                    countryIso2: 'BE',
                    codbase: 'WBE',
                    address: 'Mont Saint-Lambert 5',
                    city: 'Sint-Niklaas'
                }
            ]
        }

        const response = await request
            .post(`/api/okla/hcos/search`)
            .set('Cookie', [`access_token=s:${signCookie(defaultAdmin.access_token)}`])
            .send({
                address: "",
                city: "france",
                codbases: ["WBE"],
                duplicates: false,
                firstName: "",
                isInContract: false,
                lastName: "",
                onekeyId: "",
                phonetic: false,
                postCode: "",
                specialties: [],
                workplaceEid: ""
            });

        expect(response.statusCode).toBe(200);
        expect(response.res.headers['content-type']).toMatch('application/json');
        expect(response.body).toEqual(searchResponse);
    });

    it('Should get hcp details', async () => {
        mockAxios.onPost(searchUrl).reply(200, data);

        const searchResponse = {
            firstName: 'Johan',
            lastName: 'De Bast',
            gender: 'Male',
            specialties: [],
            type: 'Physician',
            individualEid: 'WBEB01714561',
            externalIdentifiers: [ { name: 'INAMI', value: '1-99722-01-520' } ],
            countryIso2: 'BE',
            codbase: 'WBE',
            workplaces: [
              {
                id: 'WBEH01410437',
                isInContract: false,
                isValid: true,
                country: "BELGIUM",
                name: 'Centre Médical Malou',
                address: 'Mont Saint-Lambert 5',
                location: { latitude: 50.88632762432098, longitude: 4.30989414453506 },
                city: 'Sint-Niklaas',
                contactNumbers: []
              }
            ],
            onekeyEidList: [ 'WBEB0171456102' ],
            isInContract: false,
            isValid: true
        }

        const response = await request
            .get(`/api/okla/hcps/WBE/WBEB01714561`)
            .set('Cookie', [`access_token=s:${signCookie(defaultAdmin.access_token)}`]);

        expect(response.statusCode).toBe(200);
        expect(response.res.headers['content-type']).toMatch('application/json');
        expect(response.body).toEqual(searchResponse);
    });

    it('Should get hco details', async () => {
        mockAxios.onPost(searchUrl).reply(200, data);

        const searchResponse = {
            workplaceEid: 'WBEH01410437',
            name: 'Centre Médical Malou',
            isInContract: false,
            countryIso2: 'BE',
            codbase: 'WBE',
            specialties: [ null ],
            isValid: true,
            address: 'Mont Saint-Lambert 5',
            location: { latitude: 50.88632762432098, longitude: 4.30989414453506 },
            city: 'Sint-Niklaas',
            contactNumbers: [],
            externalIdentifiers: [],
        }

        const response = await request
            .get(`/api/okla/hcos/WBE/WBEB01714561`)
            .set('Cookie', [`access_token=s:${signCookie(defaultAdmin.access_token)}`]);

        expect(response.statusCode).toBe(200);
        expect(response.res.headers['content-type']).toMatch('application/json');
        expect(response.body).toEqual(searchResponse);
    });
});

const path = require('path');
const _ = require('lodash');
const axios = require('axios');
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));


const searchUrl = nodecache.getValue('OKLA_SEARCH_URL');
const auth = {
    username: nodecache.getValue('OKLA_USERNAME'),
    password: nodecache.getValue('OKLA_PASSWORD')
};

async function searchOkla(queryObj) {
    const { data } = await axios.post(searchUrl, queryObj, { auth });
    return data;
}

async function searchOklaHcps(req, res) {
    try {
        let { duplicates, isInContract, phonetic } = req.body;

        let page = req.query.page ? +req.query.page - 1 : 0;
        page = page < 0 ? 0 : page;
        const limit = 30;

        if ((duplicates && typeof duplicates !== 'boolean')
            || (phonetic && typeof phonetic !== 'boolean')
            || (isInContract && typeof isInContract !== 'boolean'))
            return res.status(400).send('Invalid request');

        const codbases = req.body.codbases && Array.isArray(req.body.codbases)
            ? req.body.codbases.filter(cb => 'string' === typeof cb)
            : null;

        if (!codbases || !codbases.length) return res.status(400).send('Invalid Codbases.');

        const fieldNameMap = {
            firstName: 'individual.firstName',
            lastName: 'individual.lastName',
            address: 'address.dispatchLabel',
            city: 'address.villageLabel',
            postCode: 'address.longPostalCode',
            onekeyId: 'activity.activityEid',
            individualEid: 'individual.individualEid',
            specialties: 'individual.speciality1'
        };

        const exactFields = ['onekeyId', 'individualEid', 'specialties'];

        const fields = Object.keys(fieldNameMap).map(key => {
            let value = req.body[key];
            if (Array.isArray(value) && value.length === 0) value = null;
            const isExact = exactFields.includes(key);
            if (value) {
                return {
                    name: fieldNameMap[key],
                    method: isExact
                        ? 'EXACT'
                        : phonetic === true
                            ? 'PHONETIC'
                            : "FUZZY",
                    values: Array.isArray(value) ? value : [value]
                }
            }
        }).filter(field => field);

        const queryObj = {
            entityType: 'activity',
            isInContract,
            duplicates,
            startIndex: page * limit,
            resultSize: limit,
            codBases: codbases,
            fields
        };

        const { response: searchResponse } = await searchOkla(queryObj);

        const groupedByIndividuals = _.groupBy(searchResponse.results, 'individual.individualEid');

        const results = [];
        Object.keys(groupedByIndividuals).forEach((individualEid) => {
            const activitiesOfIndividual = groupedByIndividuals[individualEid];
            const onekeyEidList = activitiesOfIndividual.map(i => i.onekeyEid);
            const individual = activitiesOfIndividual[0].individual;
            const isInContract = activitiesOfIndividual[0].isInContract;

            const workplaces = activitiesOfIndividual.map(g => {
                const workplace = g.workplace;
                const name = [workplace.managerWorkplaceUsualName, workplace.usualName].filter(i => i).join(' - ');
                return {
                    id: workplace.workplaceEid,
                    isMainActivity: g.activity.isMainActivity,
                    isValid: workplace.statusCorporateLabel === 'Valid',
                    name,
                    addresss: workplace.workplaceAddresses['P,1'].address.addressLongLabel,
                    city: workplace.workplaceAddresses['P,1'].address.postalTownReference.villageLabel
                };
            });

            const specialties = individual.qualifications
                ? Object.keys(individual.qualifications).map(key => {
                    return individual.qualifications[key].corporateLabel
                })
                : undefined;

            const res = {
                firstName: individual.firstName,
                lastName: individual.lastName,
                specialties,
                type: individual.typeCorporateLabel,
                individualEid: individual.individualEid,
                countryIso2: activitiesOfIndividual[0].country,
                codbase: activitiesOfIndividual[0].codBase,
                workplaces,
                onekeyEidList,
                isInContract,
                isValid: individual.statusCorporateLabel === 'Valid'
            };

            results.push(res);
        });

        const data = {
            totalNumberOfResults: searchResponse.totalNumberOfResults,
            numberOfIndividuals: searchResponse.numberOfIndividuals,
            resultSize: searchResponse.resultSize,
            results
        }
        res.json(data);
    } catch (err) {
        console.error(err);
        if (err.response.status === 400) {
            res.status(400).send(err.response.data.response.errors[0].message);
        } else {
            res.status(500).send('Internal server error');
        }
    }
}

async function searchOklaHcos(req, res) {
    try {
        let { duplicates, isInContract, phonetic } = req.body;

        let page = req.query.page ? +req.query.page - 1 : 0;
        page = page < 0 ? 0 : page;
        const limit = 30;

        if ((duplicates && typeof duplicates !== 'boolean')
            || (phonetic && typeof phonetic !== 'boolean')
            || (isInContract && typeof isInContract !== 'boolean'))
            return res.status(400).send('Invalid request');

        const codbases = req.body.codbases && Array.isArray(req.body.codbases)
            ? req.body.codbases.filter(cb => 'string' === typeof cb)
            : null;

        if (!codbases || !codbases.length) return res.status(400).send('Invalid Codbases.');

        const fieldNameMap = {
            address: 'address.dispatchLabel',
            city: 'address.villageLabel',
            postCode: 'address.longPostalCode',
            onekeyId: 'activity.activityEid',
            workplaceEid: 'workplace.workplaceEid',
            specialties: 'workplace.speciality1'
        };

        const exactFields = ['onekeyId', 'workplaceEid', 'specialties'];

        const fields = Object.keys(fieldNameMap).map(key => {
            let value = req.body[key];
            if (Array.isArray(value) && value.length === 0) value = null;
            const isExact = exactFields.includes(key);
            if (value) {
                return {
                    name: fieldNameMap[key],
                    method: isExact
                        ? 'EXACT'
                        : phonetic === true
                            ? 'PHONETIC'
                            : "FUZZY",
                    values: Array.isArray(value) ? value : [value]
                }
            }
        }).filter(field => field);

        const queryObj = {
            entityType: 'workplace',
            isInContract,
            duplicates,
            startIndex: page * limit,
            resultSize: limit,
            codBases: codbases,
            fields
        };

        const { response: searchResponse } = await searchOkla(queryObj);

        const results = searchResponse.results.map(({ isInContract, country, codBase, workplace }) => {
            const name = [workplace.managerWorkplaceUsualName, workplace.usualName].filter(i => i).join(' - ');
            const specialties = workplace.qualifications
                ? Object.keys(workplace.qualifications).map(key => {
                    return workplace.qualifications[key].corporateLabel
                })
                : undefined;
            return {
                name,
                workplaceEid: workplace.workplaceEid,
                isInContract,
                isValid: workplace.statusCorporateLabel === 'Valid',
                specialties,
                countryIso2: country,
                codbase: codBase,
                address: workplace.workplaceAddresses['P,1'].address.addressLongLabel,
                city: workplace.workplaceAddresses['P,1'].address.postalTownReference.villageLabel
            }
        });

        const data = {
            totalNumberOfResults: searchResponse.totalNumberOfResults,
            numberOfWorkplaces: searchResponse.numberOfWorkplaces,
            resultSize: searchResponse.resultSize,
            results
        };

        res.json(data);
    } catch (err) {
        console.error(err);
        if (err.response.status === 400) {
            res.status(400).send(err.response.data.response.errors[0].message);
        } else {
            res.status(500).send('Internal server error');
        }
    }
}

async function getOklaHcpDetails(req, res) {
    const { codbase, id } = req.params;
    if (!id || !codbase) return res.status(400).send('Invalid request.');

    try {
        const queryObj = {
            entityType: 'activity',
            codBases: [codbase],
            fields: [
                {
                    "name": "individual.individualEid",
                    "method": "EXACT",
                    "values": [id]
                }
            ]
        };

        const { response: searchResponse } = await searchOkla(queryObj);

        if (!searchResponse.results || !searchResponse.results.length) return res.status(404).send('No HCO found with this ID.');

        const activitiesOfIndividual = searchResponse.results.filter(r => r.individual.individualEid === id);

        const  onekeyEidList = activitiesOfIndividual.map(i => i.onekeyEid);
        const individual = activitiesOfIndividual[0].individual;
        const isInContract = activitiesOfIndividual[0].isInContract;

        const workplaces = activitiesOfIndividual.map(g => {
            const workplace = g.workplace;
            const name = [workplace.managerWorkplaceUsualName, workplace.usualName].filter(i => i).join(' - ');
            const contactNumbers = Object.keys(workplace.telephones || []).map(key => {
                return {
                    number: workplace.telephones[key].callNumberForSearch,
                    type: workplace.telephones[key].typeCorporateLabel
                };
            });
            return {
                id: workplace.workplaceEid,
                isMainActivity: g.activity.isMainActivity,
                isValid: workplace.statusCorporateLabel === 'Valid',
                name,
                address: workplace.workplaceAddresses['P,1'].address.addressLongLabel,
                postCode: workplace.workplaceAddresses['P,1'].address.longPostalCode,
                location: {
                    latitude: workplace.workplaceAddresses['P,1'].address.geocodingAddresses.W.latitude,
                    longitude: workplace.workplaceAddresses['P,1'].address.geocodingAddresses.W.longitude
                },
                city: workplace.workplaceAddresses['P,1'].address.postalTownReference.villageLabel,
                contactNumbers,
                type: workplace.typeCorporateLabel,
            };
        });

        const specialties = individual.qualifications
            ? Object.keys(individual.qualifications).map(key => {
                return individual.qualifications[key].corporateLabel
            })
            : [];

        const externalIdentifiers = Object.keys(individual.externalKeys).map(key => {
            const externalKey = individual.externalKeys[key];
            return {
                name: externalKey.typeLabel,
                value: externalKey.value
            };
        });

        const data = {
            firstName: individual.firstName,
            lastName: individual.lastName,
            salutation: individual.prefixNameCorporateLabel,
            title: individual.titleCorporateLabel,
            gender: individual.genderCorporateLabel,
            specialties,
            type: individual.typeCorporateLabel,
            individualEid: individual.individualEid,
            externalIdentifiers,
            countryIso2: activitiesOfIndividual[0].country,
            codbase: activitiesOfIndividual[0].codBase,
            workplaces,
            onekeyEidList,
            isInContract,
            isValid: individual.statusCorporateLabel === 'Valid',
            graduationYear: individual.thesisYear,
            birthYear: individual.birthYear,
        };

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

async function getOklaHcoDetails(req, res) {
    const { codbase, id } = req.params;
    if (!id || !codbase) return res.status(400).send('Invalid request.');

    try {
        const queryObj = {
            entityType: 'workplace',
            codBases: [codbase],
            fields: [
                {
                    "name": "workplace.workplaceEid",
                    "method": "EXACT",
                    "values": [id]
                }
            ]
        };

        const { response: searchResponse } = await searchOkla(queryObj);

        if (!searchResponse.results || !searchResponse.results.length) return res.status(404).send('No workplace found with this ID.');

        const { workplace, country, codBase, isInContract } = searchResponse.results[0];

        const name = [workplace.managerWorkplaceUsualName, workplace.usualName].filter(i => i).join(' - ');
        const specialties = workplace.qualifications
            ? Object.keys(workplace.qualifications).map(key => {
                return workplace.qualifications[key].corporateLabel
            })
            : undefined;
        const addressData = workplace.workplaceAddresses['P,1'].address;
        const contactNumbers = Object.keys(workplace.telephones || []).map(key => {
            return {
                number: workplace.telephones[key].callNumberForSearch,
                type: workplace.telephones[key].typeCorporateLabel
            };
        });

        const data = {
            workplaceEid: workplace.workplaceEid,
            name,
            activity: workplace.activityLocationCorporateLabel,
            isInContract,
            countryIso2: country,
            codbase: codBase,
            specialties,
            isValid: workplace.statusCorporateLabel === 'Valid',
            type: workplace.typeCorporateLabel,
            address: addressData.addressLongLabel,
            postCode: addressData.longPostalCode,
            location: {
                latitude: addressData.geocodingAddresses.W.latitude,
                longitude: addressData.geocodingAddresses.W.longitude
            },
            city: addressData.postalTownReference.villageLabel,
            contactNumbers
        };

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

exports.searchOklaHcps = searchOklaHcps;
exports.searchOklaHcos = searchOklaHcos;
exports.getOklaHcpDetails = getOklaHcpDetails;
exports.getOklaHcoDetails = getOklaHcoDetails;

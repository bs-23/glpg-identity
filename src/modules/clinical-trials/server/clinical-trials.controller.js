const path = require('path');
const _ = require('lodash');
const { Response, CustomError } = require(path.join(process.cwd(), 'src/modules/core/server/response'));
const History = require('./clinical-trials.history.model');
const https = require('https');
const Trial = require('./clinical-trials.trial.model');
const Location = require('./clinical-trials.location.model');

async function dumpAllData(req, res) {
    const response = new Response({}, []);
    const { urlToGetData, description } = req.body;

    try {
        https.get(urlToGetData, (resp) => {
        let data = '';
            resp.on('data', (chunk) => {
                data += chunk;
            });

            resp.on('end', async () => {
                let result = await History.create({
                    description: description,
                    value: data,
                    log: urlToGetData
                });

                if (!result) {
                    response.data = [];
                    return res.status(204).send(response);
                }

                response.data = result;
                res.json(response);
            });

        }).on("error", (err) => {
            console.log("Error: " + err.message);
        });
    } catch (err) {
        console.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

async function showAllVersions(req, res) {
    const response = new Response({}, []);
    try{
        let result = await History.findAll({
            attributes: {
                exclude: ['value']

            }
        });

        if (!result) {
            response.data = [];
            return res.status(204).send(response);
        }

        response.data = result;
        res.json(response);
    } catch (err) {
        console.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

async function mergeProcessData(req, res) {
    const response = new Response({}, []);
    const { ids } = req.body;

    try {
        let result = await History.findAll({
            where: {
                id: ids.includes(',')? ids.split(',') : [ids],
            }
        });
        let data = [];
        result.forEach(res => {
             jsonValue = JSON.parse(res.value);
             data = data.concat(data, jsonValue.FullStudiesResponse.FullStudies.map(element=>{
                 return {
                    "rank": element.Rank,
                    "protocolNumber": element.Study.ProtocolSection.IdentificationModule.OrgStudyIdInfo.OrgStudyId,
                    "govIdentifier": element.Study.ProtocolSection.IdentificationModule.NCTId,
                    "clinicalTrialPurpose": element.Study.ProtocolSection.DescriptionModule.BriefSummary,
                    "clinicalTrialSummary": element.Study.ProtocolSection.IdentificationModule.BriefTitle,
                    "gender": element.Study.ProtocolSection.EligibilityModule.Gender,
                    "minAge": element.Study.ProtocolSection.EligibilityModule.MinimumAge,
                    "maxAge": element.Study.ProtocolSection.EligibilityModule.MaximumAge,
                    "stdAge": element.Study.ProtocolSection.EligibilityModule.StdAgeList.StdAge,
                    "phase": element.Study.ProtocolSection.DesignModule.PhaseList.Phase,
                    "trialStatus": element.Study.ProtocolSection.StatusModule.OverallStatus,
                    "inclusionExclusionCriteria": element.Study.ProtocolSection.EligibilityModule.EligibilityCriteria,
                    "typeOfDrug": "Yet to fix",
                    "location": element.Study.ProtocolSection.ContactsLocationsModule.LocationList.Location
                }
             }));
        });

        Trial.bulkCreate(data,
                    {
                    returning: true,
                    ignoreDuplicates: false
                }).then(trial=>{
                    data = trial
                });

        if (!result) {
            response.data = [];
            return res.status(204).send(response);
        }

        response.data = {
            count: data.length,
            stitch: data[0]
        };
        res.json(response);
    } catch (err) {
        console.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

async function getTrials(req, res) {
    const response = new Response({}, []);
    let { items_per_page, page_no } = req.query;

    page_no = page_no ? Number(page_no) : 1;
    items_per_page = items_per_page? Number(items_per_page) : 100;

    try {
        let result = await Trial.findAll({
            offset: items_per_page*page_no,
            limit: items_per_page});

        let total_item_count = await Trial.count();

        if (!result) {
            response.data = [];
            return res.status(204).send(response);
        }

        response.data = {
           search_result: result,
           items: total_item_count
        }
        res.json(response);
    } catch (err) {
        console.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

async function getTrialDetails(req, res) {
    const response = new Response({}, []);

    try {
        if (!req.params.id) {
            return res.status(400).send('Invalid request.');
        }

        id = req.params.id;
        let result = await Trial.findOne({
            where: {
                id: id,
            }
        });

        if (!result) {
            response.data = [];
            return res.status(204).send(response);
        }

        response.data = result;
        res.json(response);
    } catch (err) {
        console.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

exports.dumpAllData = dumpAllData;
exports.showAllVersions = showAllVersions;
exports.mergeProcessData = mergeProcessData;
exports.getTrials = getTrials;
exports.getTrialDetails = getTrialDetails;

const path = require('path');
const _ = require('lodash');
const validator = require('validator');
const { Response, CustomError } = require(path.join(process.cwd(), 'src/modules/core/server/response'));
const history = require('./clinical-trials.history.model');
const https = require('https');
const Trial = require('./clinical-trials.trial.model');
const Location = require('./clinical-trials.location.model');
const { request } = require('http');

async function dumpAllData(req, res) {
    const response = new Response({}, []);
    const { urlToGetData, description } = req.body;
    try{
        https.get(urlToGetData, (resp) => {
        let data = '';

        resp.on('data', (chunk) => {
            data += chunk;
        });

        resp.on('end', async () => {
            let result = await history.create({
                description: description,
                value: data,
                log: urlToGetData,
                created_by: req.user.id,
                updated_by: req.user.id
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
        let result = await history.findAll({
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
    try{
        let result = await history.findAll({
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



exports.dumpAllData = dumpAllData;
exports.showAllVersions = showAllVersions;
exports.mergeProcessData = mergeProcessData;
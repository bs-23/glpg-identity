const path = require('path');
const _ = require('lodash');
const { Response, CustomError } = require(path.join(process.cwd(), 'src/modules/core/server/response'));
const History = require('./clinical-trials.history.model');
const https = require('https');
const Trial = require('./clinical-trials.trial.model');
const Location = require('./clinical-trials.location.model');
const { Op } = require('sequelize');
const { object } = require('yup');
const fetch = require('cross-fetch');

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

        }).on('error', (err) => {
            console.log('Error: ' + err.message);
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

async function getCoordinates(facility, zip, city, state, country)
{
    var API_KEY = "AIzaSyAXBeTXzlo_-vwKTza6MGrzNwRHn8ppHrQ";
    var BASE_URL = "https://maps.googleapis.com/maps/api/geocode/json?address=";
    var address = `${facility}, ${zip}, ${city}, ${state}, ${country}`;
    var url = BASE_URL + address + "&key=" + API_KEY;

    const response = await fetch(url);
    const json = await response.json()
    return json;
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
                 let locationList = element.Study.ProtocolSection.ContactsLocationsModule.LocationList;
                 return {
                    'rank': element.Rank,
                    'protocol_number': element.Study.ProtocolSection.IdentificationModule.OrgStudyIdInfo.OrgStudyId,
                    'gov_ddentifier': element.Study.ProtocolSection.IdentificationModule.NCTId,
                    'clinical_trial_purpose': element.Study.ProtocolSection.DescriptionModule.BriefSummary,
                    'clinical_trial_summary': element.Study.ProtocolSection.IdentificationModule.BriefTitle,
                    'gender': element.Study.ProtocolSection.EligibilityModule.Gender,
                    'min_age': element.Study.ProtocolSection.EligibilityModule.MinimumAge,
                    'max_age': element.Study.ProtocolSection.EligibilityModule.MaximumAge,
                    'std_age': element.Study.ProtocolSection.EligibilityModule.StdAgeList.StdAge,
                    'phase': element.Study.ProtocolSection.DesignModule.PhaseList.Phase,
                    'trial_status': element.Study.ProtocolSection.StatusModule.OverallStatus,
                    'inclusion_exclusion_criteria': element.Study.ProtocolSection.EligibilityModule.EligibilityCriteria,
                    'type_of_drug': 'Yet to fix',
                    'locations': locationList? locationList.Location.map(location=> {return {
                        'location_facility': location.LocationFacility,
                        'location_city': location.LocationFacility,
                        'location_state': location.LocationState,
                        'location_zip': location.LocationZip,
                        'location_country': location.LocationCountry,
                        'location_lat': 25.1,
                        'location_lng': 110.2
                  }}) : ''
                }
             }));
        });

        Trial.bulkCreate(data,
                    {
                    returning: true,
                    ignoreDuplicates: false,
                    include: { model: Location, as: 'locations' }
                }).then(trial=>{
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
    let { items_per_page, 
        page_number,
        status,
        phases,
        gender,
        location,
        distance,
        search_term,
        diseases,
        age_range } = req.query;

    page_number = page_number ? Number(page_number) : 1;
    items_per_page = items_per_page? Number(items_per_page) : 100;
    status = status? status.map(x=>{
        switch(x){
            case 'RECSTATUS_RECRUITING':
                return 'Enrolling by invitation';
                break;
            case 'RECSTATUS_NOT_YET_RECRUITING':
                return 'Active, not recruiting'
                break;
            case 'RECSTATUS_STUDY_COMPLETED':
                return 'Completed'
                break;
            case 'RECSTATUS_TERMINATED':
                return 'Withdrawn'
                break;
            default:
                return '';
                break;
        }
    }) : null;
    // phases = phases ? phases.map(x=> x.replace('_',' ').replace('PHASE','Phase')) : null;

    try {

        let query = {
            phase: phases , 
            trial_status: status
        }

        Object.keys(query).forEach(key=>{
            if (!query[key]){
                delete query[key]
            }
        });

        let pageing = {
            offset: items_per_page * Number(page_number - 1),
            limit: items_per_page,
        }
        let result = await Trial.findAll({
            where: query,
            ...pageing});

        let total_item_count = await Trial.count({
            where: query
        });

        if (!result) {
            response.data = [];
            return res.status(204).send(response);
        }

        response.data = {
           search_result: result,
           total_count: total_item_count
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
            },
            include: ['locations'] 
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

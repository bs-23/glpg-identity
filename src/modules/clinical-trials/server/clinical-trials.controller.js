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
const { DataTypes } = require('sequelize');
const { NonceProvider } = require('react-select');
const nodecache = require('../../../config/server/lib/nodecache');
const logger = require(path.join(process.cwd(), 'src/config/server/lib/winston'));

var seed = 1;
var API_KEY = nodecache.getValue('GOOGLE_MAP_API_KEY');

async function getCoordinates(facility, zip, city, state, country, index)
{
    var params = [facility, zip, city, state, country]
    var filteredParams = params.filter((el) => el != null);
    var BASE_URL = 'https://maps.googleapis.com/maps/api/geocode/json?address=';
    var joinedURL = BASE_URL + filteredParams.join('+') + '&key=' + API_KEY;
    var url = encodeURI(joinedURL.replace(/\s/g,'+').replace('#',''));

    try {
        await new Promise(resolve => setTimeout(resolve, index*1000));
        const response = await fetch(url);
        const json = await response.json();
        return json.results[0].geometry.location;
    }catch (error) {
        return {lat: -1, lng: -1}
    }
}

function haversineDistanceInKM(lat1,lon1, lat2, lon2){
	// ref: https://www.movable-type.co.uk/scripts/latlong.html
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180; // φ, λ in radians
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c * 0.001; // in km
}

String.prototype.capitalize = function(){return this.split(' ').map(x=>x.charAt(0).toUpperCase() + x.slice(1)).join(' ')};

function random(new_seed) {
    if (new_seed) seed = new_seed;
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function groupIndications(indication) {
    switch(indication){
        case 'Ankylosing Spondylitis':
        case 'Rheumatoid Arthritis':
        case 'Arthritis, Rheumatoid':
        case 'Rheumatoid Arthritis|Psoriatic Arthritis|Ankylosing Spondylitis|Non-Radiographical Axial Spondyloarthritis':
            return 'Ankylosing Spondylitis';
        case 'Crohn\'s Disease':
        case 'Fistulizing Crohn\'s Disease':
        case 'Small Bowel Crohn\'s Disease':
        case 'Inflammatory Bowel Disease':
            return 'Crohn\'s Disease';
        case 'Cutaneous Lupus Erythematosus':
        case 'Lupus Membranous Nephropathy':
            return 'Lupus Erythematosus';
        case 'Sjogren\'s Syndrome':
        case 'Primary Sjögren Syndrome':
            return 'Sjogren\'s Syndrome';
        case 'Ulcerative Colitis':
        case 'Inflammatory Bowel Disease':
            return 'Ulcerative Colitis';
        case 'Systemic Sclerosis':
            return 'Systemic Sclerosis';
        case 'Noninfectious Uveitis':
            return 'Uveitis';
        case 'RheumatoId Arthritis':
        case 'Rheumatoid Arthritis':
        case 'Rheumatoid Arthritis|Psoriatic Arthritis|Ankylosing Spondylitis|Non-Radiographical Axial Spondyloarthritis':
            return 'Rheumatoid Arthritis';
        case 'Atopic Dermatitis':
            return 'Atopic Dermatitis';
        case 'Autosomal Dominant Polycystic Kidney Disease':
            return 'Autosomal Dominant Polycystic Kidney Disease';
        case 'Idiopathic Pulmonary Fibrosis':
            return 'Idiopathic Pulmonary Fibrosis';
        case 'Osteoarthritis':
            return 'Osteoarthritis';
        case 'Psoriatic Arthritis':
            return 'Psoriatic Arthritis';
        default:
            return null;
    }
}

function statusInputTextMapping(status){
    status = status? status.split(',').map(x=>{
        switch(x){
            case 'RECSTATUS_ALL':
                return 'All';
                break;
            case 'RECSTATUS_RECRUITING':
                return 'Recruiting'
                break;
            case 'RECSTATUS_NOT_YET_RECRUITING':
                return 'Not yet recruiting'
                break;
            case 'RECSTATUS_ENROLLING_BY_INVITATION':
                return 'Enrolling by invitation'
                break;
            case 'RECSTATUS_ACTIVE_NOT_RECRUITING':
                return 'Active, not recruiting'
                break;
            case 'RECSTATUS_SUSPENDED':
                return 'Suspended'
                break;
            case 'RECSTATUS_TERMINATED':
                return 'Terminated'
                break;
            case 'RECSTATUS_STUDY_COMPLETED':
                return 'Completed'
                break;
            case 'RECSTATUS_WITHDRAWN':
                return 'Withdrawn'
                break;
            default:
                return '';
                break;
        }
    }) : null;
    if( status && status.includes('All')){
        status = ['Recruiting', 'Not yet recruiting', 'Enrolling by invitation', 'Active, not recruiting', 'Suspended', 'Terminated', 'Completed', 'Withdrawn']
    }
    return status;
}

function phaseInputTextMapping(phase){
    phase = phase? phase.split(',').map(x=>{
        switch(x){
            case 'PHASE_2':
                return 'Phase 2';
                break;
            case 'PHASE_3':
                return 'Phase 3'
                break;
            case 'PHASE_4':
                return 'Phase 4'
                break;
            default:
                return '';
                break;
        }
    }) : null;
    return phase;
}

function ageRangeInputTextMapping(age_range) {
    age_range = age_range? age_range.split(',').map(x=>{
        switch(x){
            case 'AGERANGE_ONE':
                return 'Child';
                break;
            case 'AGERANGE_TWO':
                return 'Adult'
                break;
            case 'AGERANGE_THREE':
                return 'Adult,Older Adult'
                break;
            default:
                return '';
                break;
        }
    }) : null;
    return age_range;
}

function genderInputTextMapping(gender) {
    gender = gender? gender.split(',').map(x=>{
        switch(x){
            case 'GENDER_ALL':
                return 'All';
                break;
            case 'GENDER_MALE':
                return 'Male'
                break;
            case 'GENDER_FEMALE':
                return 'Female'
                break;
            default:
                return '';
                break;
        }
    }) : null;
    return gender;
}

async function dumpAllData(req, res) {
    const response = new Response({}, []);
    const { urlToGetData, description } = req.body;
    res.set({ 'content-type': 'application/json; charset=utf-8' });
    try {
        res.json(await new Promise((resolve, reject) => {
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
                resolve(response);
            });

        }).on('error', (err) => {
            reject('Error: ' + err.message);
        });
    }));
    } catch (err) {
        logger.error(err);
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
        logger.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

async function updateLatLngCode(location, count, location_facility, location_zip, latLngNotFound){
    var {lat,lng} = await getCoordinates(location_facility, location_zip, location.location_city, location.location_state, location.location_country, count.to_update);
                location.lat = lat;
                location.lng = lng;
                count.to_update++;
                if(!latLngNotFound(location)) {
                    await location.save({ fields: ['lat', 'lng'] });
                    count.updated++
                }
                return location;
}

async function syncGeoCodes(req, res) {
    const response = new Response({}, []);
    res.set({ 'content-type': 'application/json; charset=utf-8' });

    try {
        let result = await Location.findAll({
        });
        let count = {
            to_update : 0,
            updated : 0
        };
        await Promise.all(result.map(async (location, index)=>{
            let latLngNotFound = (location)=>location.lat === -1 && location.lng === -1;
            if(latLngNotFound(location)) {
                location = await updateLatLngCode(location, count, location.location_facility, location.location_zip, latLngNotFound);
                if(latLngNotFound(location)) {
                    count.to_update--;
                    location = await updateLatLngCode(location, count, '', location.location_zip, latLngNotFound);
                    if(latLngNotFound(location)) {
                        count.to_update--;
                        location = await updateLatLngCode(location, count, '', '', latLngNotFound);
                    }
                }
            }
            return location;
        }));


        response.data = {
            count
        };
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
    res.set({ 'content-type': 'application/json; charset=utf-8' });

    try {
        let result = await History.findAll({
            where: {
                id: ids.includes(',')? ids.split(',') : [ids],
            }
        });
        let data = [];
        await Promise.all(result.map(async res => {
             jsonValue = JSON.parse(res.value);
             let data_chunk = await Promise.all(jsonValue.FullStudiesResponse.FullStudies.map(async element=>{
                 let locationList = element.Study.ProtocolSection.ContactsLocationsModule.LocationList;

                 if (element.Study.ProtocolSection.ConditionsModule.ConditionList.Condition[0].toLowerCase().includes('Acute Exacerbation of Remitting Relapsing Multiple Sclerosis'.toLowerCase()) ||
                    element.Study.ProtocolSection.ConditionsModule.ConditionList.Condition[0].toLowerCase().includes('Clinically Isolated Syndrome'.toLowerCase()) ||
                    element.Study.ProtocolSection.ConditionsModule.ConditionList.Condition[0].toLowerCase().includes('Cystic Fibrosis'.toLowerCase())){
                     return {};
                 }

                var paragraph = element.Study.ProtocolSection.EligibilityModule.EligibilityCriteria;
                var paragraph_lowercase = paragraph.toLowerCase();
                var inclusion_label_text = paragraph_lowercase.indexOf('key inclusion criteria')!==-1? 'key inclusion criteria' : 'inclusion criteria';
                var exclusion_label_text = paragraph_lowercase.lastIndexOf('key exclusion criteria')!==-1? 'key exclusion criteria' : 
                                            paragraph_lowercase.lastIndexOf('exclusion criteria')!==-1? 'exclusion criteria':
                                            paragraph_lowercase.lastIndexOf('note')!==-1? 'note': '';
                var note_label_text = paragraph_lowercase.lastIndexOf('note')!==-1?  'note' : '';
                 return { 
                    'trial_fixed_id': uuid(),
                    'indication': element.Study.ProtocolSection.ConditionsModule.ConditionList.Condition[0].capitalize().split('|').join(','),
                    'indication_group': groupIndications(element.Study.ProtocolSection.ConditionsModule.ConditionList.Condition[0]),
                    'protocol_number': element.Study.ProtocolSection.IdentificationModule.OrgStudyIdInfo.OrgStudyId,
                    'gov_identifier': element.Study.ProtocolSection.IdentificationModule.NCTId,
                    'eudract_number': element.Study.ProtocolSection.IdentificationModule.SecondaryIdInfoList && element.Study.ProtocolSection.IdentificationModule.SecondaryIdInfoList.SecondaryIdInfo.length ? element.Study.ProtocolSection.IdentificationModule.SecondaryIdInfoList.SecondaryIdInfo[0].SecondaryId : null,
                    'clinical_trial_brief_summary': element.Study.ProtocolSection.DescriptionModule.BriefSummary,
                    'clinical_trial_brief_title': element.Study.ProtocolSection.IdentificationModule.BriefTitle,
                    'official_title': element.Study.ProtocolSection.IdentificationModule.OfficialTitle,
                    'gender': element.Study.ProtocolSection.EligibilityModule.Gender,
                    'min_age': element.Study.ProtocolSection.EligibilityModule.MinimumAge? element.Study.ProtocolSection.EligibilityModule.MinimumAge.toLowerCase().replace('years', ' ').trim() : null,
                    'max_age': element.Study.ProtocolSection.EligibilityModule.MaximumAge? element.Study.ProtocolSection.EligibilityModule.MaximumAge.toLowerCase().replace('years', ' ').trim() : null,
                    'std_age': element.Study.ProtocolSection.EligibilityModule.StdAgeList.StdAge.join(','),
                    'phase': element.Study.ProtocolSection.DesignModule.PhaseList.Phase[0],
                    'trial_status': element.Study.ProtocolSection.StatusModule.OverallStatus,
                    'inclusion_criteria': (()=>{
                        try{
                            var inclusion_boundary = [paragraph_lowercase.indexOf(inclusion_label_text)+inclusion_label_text.length, paragraph_lowercase.indexOf(exclusion_label_text)];
                            var inclusion_text = paragraph.substring(inclusion_boundary[0],inclusion_boundary[1]);
                            var inclusion_html_single_list = `<li>${inclusion_text.replace(/^[ :]+/g,'').split('\n').join('</li><li>')}</li>`;
                            var inclusion_nested_sections = inclusion_html_single_list.match(/:<\/li>(<li><\/li>.+?<li><\/li>)/g);
                            var inclusion_html_nested_list = inclusion_html_single_list.split(/:<\/li><li><\/li>.+?<li><\/li>/g);
                            var inclusion_counter = 0;
                            var inclusion_html = inclusion_html_nested_list.reduce((a,b)=>`${a}:</li><li>${inclusion_nested_sections[inclusion_counter++].replace(/<li><\/li>/g,'').replace(/:<\/li>/g,'')}</li>${b}`);
                            inclusion_html = inclusion_html.replace(/<li><\/li>/g,'');
                            return inclusion_html;
                        }catch(ex){
                            return '';
                        }
                    })(),
                    'exclusion_criteria': (()=>{
                        try{
                            if (exclusion_label_text === 'note') return '';
                            var exclusion_end_index = paragraph_lowercase.indexOf(note_label_text) !==-1 && note_label_text !== ''? paragraph_lowercase.indexOf(note_label_text) : paragraph_lowercase.length;
                            var exclusion_boundary = [paragraph_lowercase.indexOf(exclusion_label_text)+exclusion_label_text.length, exclusion_end_index];
                            var exclusion_text = paragraph.substring(exclusion_boundary[0],exclusion_boundary[1])
                            var exclusion_html_single_list = `<li>${exclusion_text.replace(/^[ :]+/g,'').split('\n').join('</li><li>')}</li>`;
                            var exclusion_nested_sections = exclusion_html_single_list.match(/:<\/li>(<li><\/li>.+?<li><\/li>)/g);
                            var exclusion_html_nested_list = exclusion_html_single_list.split(/:<\/li><li><\/li>.+?<li><\/li>/g);
                            var exclusion_counter = 0;
                            var exclusion_html = exclusion_html_nested_list.reduce((a,b)=>`${a}:</li><li>${exclusion_nested_sections[exclusion_counter++].replace(/<li><\/li>/g,'').replace(/:<\/li>/g,'')}</li>${b}`);
                            exclusion_html = exclusion_html.replace(/<li><\/li>/g,'');
                            return exclusion_html
                        }catch(ex){
                            return '';
                        }
                    })(),
                    'note_criteria':(()=>{
                        try{
                            if(note_label_text == '') return  '';
                            var note_boundary = [paragraph_lowercase.indexOf(note_label_text)+note_label_text.length, paragraph_lowercase.length];
                            var note_text = paragraph.substring(note_boundary[0],note_boundary[1]).replace(/^[ :]+/g,'').replace('note:', '');
                            return note_text;
                        }catch(ex){
                            return '';
                        }
                    })(),
                    'type_of_drug': element.Study.ProtocolSection.ArmsInterventionsModule.InterventionList && element.Study.ProtocolSection.ArmsInterventionsModule.InterventionList.Intervention.length ? element.Study.ProtocolSection.ArmsInterventionsModule.InterventionList.Intervention.reduce((a,b)=>{b.InterventionName = a.InterventionName+','+b.InterventionName; return b}).InterventionName: null,
                    'story_telling': 'In this trial, doctors hope to find out how the study drug works together with your current standard treatment in terms of its effects on your lung function and IPF in general. People with IPF have increased levels of something called autotaxin, which is thought to have a role in the progression of IPF. The trial is investigating whether decreasing the activity of autotaxin can have a positive effect. It will also look at how well the study drug is tolerated.',
                    'trial_start_date': new Date(element.Study.ProtocolSection.StatusModule.StartDateStruct.StartDate),
                    'trial_end_date': element.Study.ProtocolSection.StatusModule.CompletionDateStruct.CompletionDate ? new Date(element.Study.ProtocolSection.StatusModule.CompletionDateStruct.CompletionDate) : null,
                    'locations': locationList? await Promise.all(locationList.Location.map(async (location,index)=> {
                        var {lat,lng} = {lat: -1, lng: -1};  
                        return {
                        'location_status': location.LocationStatus? location.LocationStatus : element.Study.ProtocolSection.StatusModule.OverallStatus,
                        'location_facility': location.LocationFacility,
                        'location_city': location.LocationCity,
                        'location_state': location.LocationState,
                        'location_zip': location.LocationZip,
                        'location_country': location.LocationCountry,
                        'lat': lat,
                        'lng': lng
                  }})) : ''
                }
             }));
             data = [...data, ...data_chunk];
        }));

        data = data.filter((el) => {return Object.keys(el).length != 0})
        data = await Trial.bulkCreate(data,
                    {
                    returning: true,
                    ignoreDuplicates: false,
                    include: { model: Location, as: 'locations' }
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
        logger.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

async function getTrials(req, res) {
    const response = new Response({}, []);
    let { items_per_page,
        page_number,
        status,
        gender,
        distance,
        search_term,
        free_text_search,
        age_ranges,
        country,
        zipcode,
        phase,
        indication } = req.query;

    page_number = page_number ? Number(page_number) : 1;
    items_per_page = items_per_page? Number(items_per_page) : 100;
    indication = indication? indication : null;
    status = statusInputTextMapping(status);
    phase = phaseInputTextMapping(phase);
    age_ranges = ageRangeInputTextMapping(age_ranges);
    gender = genderInputTextMapping(gender);
    free_text_search = free_text_search.toLowerCase();
    if (zipcode || country){
        cordinates = await getCoordinates('', zipcode, '', '', country, 0);
    } else {
        cordinates = {lat: -1, lng: -1}
    }

    try {
        let query = {
            [Op.and]: [
            {trial_status: status},
            {indication: indication},
            {indication_group: indication},
            {gender: gender},
            {phase: phase}
            ]
        }
        let remove_index = [];
        query[[Op.and][0]].forEach((sub_or_query, index) =>{
            Object.keys(sub_or_query).forEach(key=>{
                if (!sub_or_query[key]){
                    delete query[[Op.and][0]][index][key]
                    remove_index.push(index);
                }
        })});
        remove_index.sort(function(a,b){ return b - a; }).forEach(index=>{
            query[[Op.and][0]].splice(index, 1);
        });

        if (!query[[Op.and][0]].length){
            delete query[[Op.and][0]];
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
            attributes: ['protocol_number', 'indication_group', 'indication', 'trial_fixed_id', 'trial_status', 'max_age', 'min_age', 'official_title', 'gender', 'clinical_trial_brief_title', 'phase', 'std_age'],
            include: ['locations'], ...pageing});

        let total_item_count = await Trial.count({
            where: query
        });

        if (!result) {
            response.data = [];
            return res.status(204).send(response);
        }

        let search_result = result.map(x=>{ 
            let least_distance = Number.MAX_SAFE_INTEGER;
            x.dataValues.locations.map(location=>{
                let calculated_distance = haversineDistanceInKM(cordinates.lat, cordinates.lng, location.lat, location.lng)
                least_distance = Math.min(least_distance, calculated_distance);
                return {...location, calculated_distance};
            });
            delete x.dataValues.locations;
        if(distance){
            if(distance>= least_distance){
                return {...x.dataValues,  distance: Math.round(least_distance*10*100) / 100 + ' km'}
            } else {
                return '';
        }} else{
            return {...x.dataValues,  distance: Math.round(least_distance*10*100) / 100 + ' km'}
        }

    }).filter(x=>x!=='').filter(x=>{
        try{
        if(! free_text_search){
            return true;
        }
        if(x.indication.toLowerCase().includes(free_text_search)){
            return true;
        }
        if(x.indication_group.toLowerCase().includes(free_text_search)){
            return true;
        }
        if(x.phase.toLowerCase().includes(free_text_search)){
            return true;
        }
        if(x.gender.toLowerCase().includes(free_text_search)){
            return true;
        }
        if(x.std_age.toLowerCase().includes(free_text_search)){
            return true;
        }
        if(x.clinical_trial_brief_title.toLowerCase().includes(free_text_search)){
            return true;
        }
        if(x.official_title.toLowerCase().includes(free_text_search)){
            return true;
        }
        if(x.trial_status.toLowerCase().includes(free_text_search)){
            return true;
        }
    } catch(ex){
        
    }
        return false;

    });

        response.data = {
           search_result: search_result,
           total_count: search_result.length
        }
        res.json(response);
    } catch (err) {
        logger.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

async function getTrialDetails(req, res) {
    const response = new Response({}, []);
    res.set({ 'content-type': 'application/json; charset=utf-8' });
    try {
        if (!req.params.id) {
            return res.status(400).send('Invalid request.');
        }

        id = req.params.id;
        let result = await Trial.findOne({
            where: {
                [Op.or]: [
                {trial_fixed_id: id},
                {id: id}
                ]
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
        logger.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

async function updateClinicalTrials(req, res) {
    const response = new Response({}, []);
    const reqdata = req.body;
    res.set({ 'content-type': 'application/json; charset=utf-8' });
    try {
        let ids = reqdata.map(x=>x.trial_fixed_id)
        let trials = await Trial.findAll({
            where: {
                [Op.or]: [
                {trial_fixed_id: ids},
                {id: ids}
                ]
            }
        });

        let result = trials.map(trial=>{
            let newStoryItm = reqdata.filter(x=>x.trial_fixed_id === trial.trial_fixed_id)[0];
            trial.story_telling = newStoryItm.story_telling;
            trial.save({ fields: ['story_telling'] });
            return trial; 
        });

        if (!result) {
            response.data = [];
            return res.status(204).send(response);
        }

        response.data = result;
        res.json(response);
    } catch (err) {
        logger.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

async function getCountryList(req, res) {
    const response = new Response({}, []);
    res.set({ 'content-type': 'application/json; charset=utf-8' });
    let countriesWithISO = [
        {'code':'AR','name':'Argentina'
        },
        {'code':'AU','name':'Australia'
        },
        {'code':'AT','name':'Austria'
        },
        {'code':'BE','name':'Belgium'
        },
        {'code':'BA','name':'Bosnia and Herzegovina'
        },
        {'code':'BR','name':'Brazil'
        },
        {'code':'BG','name':'Bulgaria'
        },
        {'code':'CA','name':'Canada'
        },
        {'code':'CL','name':'Chile'
        },
        {'code':'CO','name':'Colombia'
        },
        {'code':'HR','name':'Croatia'
        },
        {'code':'CZ','name':'Czechia'
        },
        {'code':'DK','name':'Denmark'
        },
        {'code':'EE','name':'Estonia'
        },
        {'code':'FI','name':'Finland'
        },
        {'code':'FR','name':'France'
        },
        {'code':'GE','name':'Georgia'
        },
        {'code':'DE','name':'Germany'
        },
        {'code':'GR','name':'Greece'
        },
        {'code':'GT','name':'Guatemala'
        },
        {'code':'HK','name':'Hong Kong'
        },
        {'code':'HU','name':'Hungary'
        },
        {'code':'IS','name':'Iceland'
        },
        {'code':'IN','name':'India'
        },
        {'code':'IE','name':'Ireland'
        },
        {'code':'IL','name':'Israel'
        },
        {'code':'IT','name':'Italy'
        },
        {'code':'JP','name':'Japan'
        },
        {'code':'KR','name':'Korea, Republic of'
        },
        {'code':'LV','name':'Latvia'
        },
        {'code':'MY','name':'Malaysia'
        },
        {'code':'MX','name':'Mexico'
        },
        {'code':'NZ','name':'New Zealand'
        },
        {'code':'MD','name':'Moldova, Republic of'
        },
        {'code':'NL','name':'Netherlands'
        },
        {'code':'NZ','name':'New Zealand'
        },
        {'code':'NO','name':'Norway'
        },
        {'code':'OM','name':'Oman'
        },
        {'code':'PE','name':'Peru'
        },
        {'code':'PL','name':'Poland'
        },
        {'code':'PT','name':'Portugal'
        },
        {'code':'RO','name':'Romania'
        },
        {'code':'RU','name':'Russian Federation'
        },
        {'code':'RS','name':'Serbia'
        },
        {'code':'SG','name':'Singapore'
        },
        {'code':'SK','name':'Slovakia'
        },
        {'code':'ZA','name':'South Africa'
        },
        {'code':'ES','name':'Spain'
        },
        {'code':'LK','name':'Sri Lanka'
        },
        {'code':'SE','name':'Sweden'
        },
        {'code':'CH','name':'Switzerland'
        },
        {'code':'TW','name':'Taiwan'
        },
        {'code':'TH','name':'Thailand'
        },
        {'code':'TR','name':'Turkey'
        },
        {'code':'UA','name':'Ukraine'
        },
        {'code':'GB','name':'United Kingdom'
        },
        {'code':'US','name':'United States of America'
        }
    ];
    try {
        response.data = countriesWithISO;
        res.json(response);
    } catch (err) {
        logger.error(err);
    }
}

async function getConditions(req, res) {
    const response = new Response({}, []);
    let conditions = [
        'Ankylosing Spondylitis',
        'Atopic Dermatitis',
        'Autosomal Dominant Polycystic Kidney Disease',
        'Crohn\'s Disease',
        'Idiopathic Pulmonary Fibrosis',
        'Lupus Erythematosus',
        'Psoriatic Arthritis',
        'Osteoarthritis',
        'Rheumatoid Arthritis',
        'Sjogren\'s Syndrome',
        'Systemic Sclerosis',
        'Ulcerative Colitis',
        'Uveitis'
    ].sort();
    try {
        response.data = conditions;
        res.json(response);
        res.json(conditions);
    } catch (err) {
        logger.error(err);
    }
}

async function getConditionsWithDetails(req, res) {
    const response = new Response({}, []);
    let conditions = [
        {indication: 'Ankylosing Spondylitis', description: 'Ankylosing spondylitis (AS) is a type of arthritis in which there is a long-term inflammation of the joints of the spine. Typically the joints where the spine joins the pelvis are also affected. Occasionally other joints such as the shoulders or hips are involved. Eye and bowel problems may also occur.'},
        {indication: 'Atopic Dermatitis', description: 'Atopic dermatitis (eczema) is a condition that makes your skin red and itchy. It\'s common in children but can occur at any age. Atopic dermatitis is long lasting (chronic) and tends to flare periodically. It may be accompanied by asthma or hay fever.'},
        {indication: 'Autosomal Dominant Polycystic Kidney Disease', description:  'Autosomal dominant polycystic kidney disease (ADPKD) is a genetic disorder characterized by the growth of numerous cysts in the kidneys. Symptoms vary in severity and age of onset, but usually develop between the ages of 30 and 40. ADPKD is a progressive disease and symptoms tend to get worse over time. The most common symptoms are kidney cysts, pain in the back and the sides and headaches. Other symptoms include liver and pancreatic cysts, urinary tract infections, abnormal heart valves, high blood pressure, kidney stones, and brain aneurysms. ADPKD is most often caused by changes in the PKD1 and PKD2 genes, and less often by changes in the GANAB and DNAJB11 genes.[1] It is inherited in a dominant pattern. Treatment for ADPKD involves managing the symptoms and slowing disease progression. The most serious complication of ADPKD is kidney disease and kidney failure. ADPKD is the most common inherited disorder of the kidneys.'},
        {indication: 'Crohn\'s Disease', description:  'Crohn\'s disease is a type of inflammatory bowel disease (IBD). It causes inflammation of your digestive tract, which can lead to abdominal pain, severe diarrhea, fatigue, weight loss and malnutrition.'},
        {indication: 'Idiopathic Pulmonary Fibrosis', description:  'Idiopathic pulmonary fibrosis (IPF) is a rare, progressive illness of the respiratory system, characterized by the thickening and stiffening of lung tissue, associated with the formation of scar tissue. It is a type of chronic scarring lung disease characterized by a progressive and irreversible decline in lung function.[3][4] The tissue in the lungs becomes thick and stiff, which affects the tissue that surrounds the air sacs in the lungs.'},
        {indication: 'Lupus Erythematosus', description:  'Lupus, technically known as systemic lupus erythematosus (SLE), is an autoimmune disease in which the body\'s immune system mistakenly attacks healthy tissue in many parts of the body.[1] Symptoms vary between people and may be mild to severe.[1] Common symptoms include painful and swollen joints, fever, chest pain, hair loss, mouth ulcers, swollen lymph nodes, feeling tired, and a red rash which is most commonly on the face.[1] Often there are periods of illness, called flares, and periods of remission during which there are few symptoms.'},
        {indication: 'Psoriatic Arthritis', description:  'Psoriatic arthritis is a form of arthritis that affects some people who have psoriasis — a condition that features red patches of skin topped with silvery scales. Most people develop psoriasis first and are later diagnosed with psoriatic arthritis, but the joint problems can sometimes begin before skin patches appear.'},
        {indication: 'Osteoarthritis', description:'OsteoarthritisOsteoarthritis (OA) is a type of joint disease that results from breakdown of joint cartilage and underlying bone. The most common symptoms are joint pain and stiffness. Usually the symptoms progress slowly over years. Initially they may occur only after exercise but can become constant over time.'},
        {indication: 'Rheumatoid Arthritis', description:  'Rheumatoid arthritis is a chronic inflammatory disorder that can affect more than just your joints. In some people, the condition can damage a wide variety of body systems, including the skin, eyes, lungs, heart and blood vessels.'},
        {indication: 'Sjogren\'s Syndrome', description:  'Sjogren\'s syndrome is an autoimmune disease. This means that your immune system attacks parts of your own body by mistake. In Sjogren\'s syndrome, it attacks the glands that make tears and saliva. This causes a dry mouth and dry eyes. You may have dryness in other places that need moisture, such as your nose, throat, and skin. Sjogren\'s can also affect other parts of the body, including your joints, lungs, kidneys, blood vessels, digestive organs, and nerves.'},
        {indication: 'Systemic Sclerosis', description:'Systemic scleroderma, or systemic sclerosis, is an autoimmune rheumatic disease characterised by excessive production and accumulation of collagen, called fibrosis, in the skin and internal organs and by injuries to small arteries. There are two major subgroups of systemic sclerosis based on the extent of skin involvement: limited and diffuse. The limited form affects areas below, but not above, the elbows and knees with or without involvement of the face. The diffuse form also affects the skin above the elbows and knees and can also spread to the torso. Visceral organs, including the kidneys, heart, lungs, and gastrointestinal tract can also be affected by the fibrotic process. Prognosis is determined by the form of the disease and the extent of visceral involvement. Patients with limited systemic sclerosis have a better prognosis than those with the diffuse form. Death is most often caused by lung, heart, and kidney involvement. There is also a slight increase in the risk of cancer.'},
        {indication: 'Ulcerative Colitis', description: 'Ulcerative colitis (UC) is a long-term condition that results in inflammation and ulcers of the colon and rectum. The primary symptoms of active disease are abdominal pain and diarrhea mixed with blood. Weight loss, fever, and anemia may also occur.'},
        {indication: 'Uveitis', description:  'Uveitis is a form of eye inflammation. It affects the middle layer of tissue in the eye wall (uvea). Uveitis (u-vee-I-tis) warning signs often come on suddenly and get worse quickly. They include eye redness, pain and blurred vision.'}
    ].sort();
    try {
        response.data = conditions;
        res.json(response);
        res.json(conditions);
    } catch (err) {
        logger.error(err);
    }
}

async function validateAddress(req, res) {
    const response = new Response({}, []);
    let {country, zipcode} = req.body;
    let coordinate = await getCoordinates('', zipcode, '', '', country, 1)
    try {
        response.data = coordinate.lat !=-1 && coordinate.lng !=-1;
        res.json(response);
        console.log(country,zipcode)
    } catch (err) {
        logger.error(err);
    }
}

exports.dumpAllData = dumpAllData;
exports.showAllVersions = showAllVersions;
exports.mergeProcessData = mergeProcessData;
exports.getTrials = getTrials;
exports.getTrialDetails = getTrialDetails;
exports.getCountryList = getCountryList;
exports.getConditions = getConditions;
exports.getConditionsWithDetails = getConditionsWithDetails;
exports.validateAddress = validateAddress;
exports.syncGeoCodes = syncGeoCodes;
exports.updateClinicalTrials = updateClinicalTrials;

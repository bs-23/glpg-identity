const path = require('path');
const _ = require('lodash');
const { Response, CustomError } = require(path.join(process.cwd(), 'src/modules/core/server/response'));
const History = require('./clinical-trials.history.model');
const Story = require('./clinical-trials.story.model');
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
var countriesWithISO = [
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
    {'code':'US','name':'United States'
    }
];

function calculateDistanceToInteger(distance){
    return parseInt(Math.round(distance*100) / 100);
}

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
                return ['All', 'Male', 'Female'];
                break;
            case 'GENDER_MALE':
                return ['All', 'Male']  
                break;
            case 'GENDER_FEMALE':
                return ['All', 'Female']
                break;
            default:
                return '';
                break;
        }
    })[0] : null;
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
                var note_label_text = paragraph_lowercase.lastIndexOf('note:')!==-1?  'note:' : '';
                var inclusion_label_text = paragraph_lowercase.indexOf('key inclusion criteria')!==-1? 'key inclusion criteria' : 'inclusion criteria';
                var exclusion_label_text = paragraph_lowercase.lastIndexOf('key exclusion criteria')!==-1? 'key exclusion criteria' : 
                                            paragraph_lowercase.lastIndexOf('exclusion criteria')!==-1? 'exclusion criteria':
                                            paragraph_lowercase.lastIndexOf(note_label_text)!==-1? note_label_text : '';
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
                    'type_of_drug': element.Study.ProtocolSection.ArmsInterventionsModule.InterventionList && element.Study.ProtocolSection.ArmsInterventionsModule.InterventionList.Intervention.length ? element.Study.ProtocolSection.ArmsInterventionsModule.InterventionList.Intervention[0].InterventionName: null,
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
        previous_data = await Trial.findAll({ where: {}, include: ['locations']});
        if (previous_data.length){
            previous_data.forEach(itm=>{
                let in_exact_match_data = data.filter(x=>x.gov_identifier === itm.gov_identifier)[0];
                itm = Object.assign(itm,in_exact_match_data);
                itm.save();
            });
        }else {
        data = await Trial.bulkCreate(data,
                    {
                    returning: true,
                    ignoreDuplicates: false, 
                    include: { model: Location, as: 'locations' }
                });
        let filterdArray = data.reduce((dataItem,{trial_fixed_id,story_telling}) => [...dataItem,{trial_fixed_id,value:story_telling,version:1}],[]);
        await Story.bulkCreate(filterdArray,
            {
                returning: true,
                ignoreDuplicates: false
            });
        
        }

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
    free_text_search = free_text_search? free_text_search.toLowerCase() : '';
    distance = distance ? Number(distance) : 10000;
    country = countriesWithISO.filter(x=>x.code === country).length? countriesWithISO.filter(x=>x.code === country)[0].name : '';
    if (zipcode && country){
        cordinates = await getCoordinates('', zipcode, '', '', country, 0);
    } else {
        cordinates = {lat: -1, lng: -1}
    }

    try {
        let query = {
            [Op.and]: [
            {trial_status: status},
            {
                [Op.or] : [
                {indication: indication},
                {indication_group: indication}
                ]
            },
            {gender: gender},
            {phase: phase},
            {std_age: age_ranges}
            ]
        }
        let remove_index = [];
        if (!indication){
            query[[Op.and][0]][1] = {};
        }
        query[[Op.and][0]].forEach((sub_query, index) =>{
            Object.keys(sub_query).forEach(key=>{
                if (!sub_query[key]){
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
        let paging = {
            offset: items_per_page * Number(page_number - 1),
            limit: items_per_page,
        }
        let result = await Trial.findAll({
            where: query,
            attributes: ['story_telling','gov_identifier','protocol_number', 'indication_group', 'indication', 'trial_fixed_id', 'trial_status', 'max_age', 'min_age', 'official_title', 'gender', 'clinical_trial_brief_title', 'phase', 'std_age'],
            include: ['locations'], 
            ...paging});

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
                if (country && zipcode){
                let calculated_distance = haversineDistanceInKM(cordinates.lat, cordinates.lng, location.lat, location.lng)
                least_distance = Math.min(least_distance, calculated_distance);
                return {...location, calculated_distance};
                }
                else if (country && location && location.location_country){
                    if(location.location_country.toLowerCase() === country.toLowerCase()){
                        least_distance = 0;
                    }
                    return location;
                }
                else {
                    least_distance = 0;
                    return location;
                }
            });
            delete x.dataValues.locations;
            if(least_distance === Number.MAX_SAFE_INTEGER) {
                return '';
            }else if(least_distance === 0) { // same country
                return {...x.dataValues,  distance: ''};
            }else if(distance) {
                if(least_distance <= distance){
                    return {...x.dataValues,  distance: calculated_distance(least_distance) + ' km', distance_value: calculated_distance(least_distance)}
            } else {
                return '';
        }}
        else{
            return {...x.dataValues,  distance: calculated_distance(least_distance) + ' km', distance_value: calculated_distance(least_distance)}
        }

    }).filter(x=>x!=='').sort(function(a, b) {return a.distance_value - b.distance_value});

    let freetext_search_result = search_result.filter(x=>{
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
        if(String(x.distance).includes(free_text_search)){
            return true;
        }
    } catch(ex){
    }
        return false;

    });

        response.data = {
           search_result: freetext_search_result,
           total_count: freetext_search_result.length
        }
        res.json(response);
    } catch (err) {
        logger.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

async function getAllStoryVersions(req, res) {
    const response = new Response({}, []);
    res.set({ 'content-type': 'application/json; charset=utf-8' });
    try {
        if (!req.params.trial_fixed_id) {
            return res.status(400).send('Invalid request.');
        }

        let result = await Story.findAll({
            where: {
                trial_fixed_id: req.params.trial_fixed_id
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

async function getTrialDetails(req, res) {
    const response = new Response({}, []);
    res.set({ 'content-type': 'application/json; charset=utf-8' });
    try {
        if (!req.params.ids) {
            return res.status(400).send('Invalid request.');
        }

        ids = req.params.ids.split(',');
        let result = await Trial.findAll({
            where: {
                [Op.or]: [
                {trial_fixed_id: ids},
                {id: ids}
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


async function updateStories(req, res) {
    const response = new Response({}, []);
    const reqdata = req.body;
    res.set({ 'content-type': 'application/json; charset=utf-8' });
    try {
        let ids = reqdata.map(x=>x.trial_fixed_ids)[0];
        let story = reqdata.map(x=>x.story)[0];
        
        let trials = await Trial.findAll({
            where: {
                trial_fixed_id: ids             
            }
        });

        let result = trials.map(trial=>{
            trial.story_telling = story;
            trial.save({ fields: ['story_telling'] });
            return trial; 
        });

        let story_result = ids.map(id=>{
            Story.count({
                where: {
                    trial_fixed_id: id
                }
            }).then(countNo =>{
                Story.create({
                    trial_fixed_id: id,
                    version: countNo+1,
                    value: story
                })
            })
        });

        if (!result) {
            response.data = [];
            return res.status(204).send(response);
        }

        response.data = story_result;
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
        {indication: 'Ankylosing Spondylitis', description: 'Ankylosing spondylitis is an inflammatory condition that affects the joints of the spine. Pain and stiffness is often experienced, which can lead to loss of flexibility, and can have a significant effect on day-to-day life. There is currently no cure for ankylosing spondylitis; however, there are ways to help manage the symptoms, including improving flexibility through exercise.Although this is a rare disease, which can sometimes feel isolating, it’s thought to affect 1% of US adults (1.7 million people), with global levels varying. Along with support from your doctor, there are also specific patient association websites that can help you understand more about your condition and ideas on how to manage it, and provide you with access to a network of others who have the same condition. Galapagos is committed to developing treatments for rare medical conditions with an unmet need, such as ankylosing spondylitis. To find out if there is a clinical trial relevant to you, speak to your doctor. You can also search for relevant Galapagos clinical trials on this site.'},
        {indication: 'Atopic Dermatitis', description: 'Atopic dermatitis is common a skin disorder that occurs when the immune system becomes overactive, and results in symptoms including itchy and red skin. It can have a significant impact on day-to-day life, and as symptoms can come and go over time it can be difficult to manage. While the exact cause is unknown and there is currently no cure, symptoms can be reduced or controlled through a range of treatments.  Along with support from your doctor, there are also specific patient association websites that can help you understand more about your condition and ideas on how to manage it, and provide you with access to a network of other patients and caregivers who have the same condition. Galapagos is committed to developing treatments for rare medical conditions with an unmet need, such as atopic dermatitis. To find out if there is a clinical trial relevant to you, speak to your doctor. You can also search for relevant Galapagos clinical trials on this site.'},
        {indication: 'Autosomal Dominant Polycystic Kidney Disease', description:  'Autosomal dominant polycystic kidney disease is mainly an inherited condition caused by cells in the kidney not developing properly, which results in the kidney not working properly. It is thought that 1 in 500 to 1 in 2,500 have this medical condition. While the impact of the disease can vary widely from person to person, it can result in difficult-to-manage symptoms, such as back pain, high blood pressure, headaches and kidney stones. There is no cure for autosomal dominant polycystic kidney disease; however, most associated symptoms can be managed with treatments. For some patients, additional treatment, such as dialysis – where a machine replaces kidney function – or a transplant, may be required.  Along with support from your doctor, there are also specific patient association websites that can help you understand more about your condition and ideas on how to manage it, and provide you with access to a network of other patients and caregivers who have the same condition. Galapagos is committed to developing treatments for rare medical conditions with an unmet need, such as autosomal dominant polycystic kidney disease. To find out if there is a clinical trial relevant to you, speak to your doctor. You can also search for relevant Galapagos clinical trials on this site.'},
        {indication: 'Crohn\'s Disease', description:  'Crohn’s disease is a chronic medical condition that affects the bowel and causes inflammation to occur in the digestive tract. It results in a wide range of symptoms including diarrhea, stomach pain, blood in stools, and weight loss. Symptoms can come and go over time, which can have a significant impact on day-to-day life and make it difficult to manage. While the exact cause is unknown and there is currently no cure, symptoms can be reduced or effectively controlled through a range of treatments. Along with support from your doctor, specific patient association websites can help you understand more about your condition and ideas on how to manage it, and provide you with access to a network of other patients and caregivers who have the same condition. Galapagos is committed to developing treatments for medical conditions with an unmet need, such as Crohn’s disease. To find out if there is a clinical trial relevant to you, speak to your doctor. You can also search for relevant Galapagos clinical trials on this site.'},
        {indication: 'Idiopathic Pulmonary Fibrosis', description:  'Idiopathic pulmonary fibrosis (IPF) is a rare medical condition in which scar tissue forms on the lungs, resulting in symptoms of breathlessness,chronic dry cough and fatigue that can have a significant impact on day-to-day activities. Although there are currently some treatments available for IPF, there is no cure for this disease; however, understanding the symptoms and how they can be managed can help minimize their impact. Managing life with a rare disease can sometimes feel isolating; however, approximately 5 million people are currently living with IPF worldwide. Along with support from your doctor, there are also specific patient association websites that can help you understand more about your condition and ideas on how to manage it, and provide you with access to a network of other patients and caregivers who have the same condition. The exact cause of IPF is still unknown (“idiopathic” means no known cause), which can make it harder to develop specific treatments. Galapagos is committed to developing treatments for rare medical conditions with a high unmet need, such as IPF. We now have more than 10 years of experience within IPF and are currently enrolling patients onto our clinical trials. To find out if there is a clinical trial relevant to you, speak to your doctor. You can also search for relevant Galapagos clinical trials on this site.'},
        {indication: 'Lupus Erythematosus', description:  'Lupus erythematosus is a chronic medical condition that occurs as a result of the immune system not working as it should and the body attacking healthy cells by mistake, affecting multiple organs. The symptoms can come and go, which can make getting on with day-to-day life difficult; however, individualised management can help with controlling these symptoms. Along with support on treatment and management from your doctor, specific patient association websites can help you understand more about your condition and ideas on how to manage it, and provide you with access to a network of patients and caregivers who have the same condition. Galapagos is committed to developing treatments for medical conditions with an unmet need, such as lupus erythematosus. To find out if there is a clinical trial relevant to you, speak to your doctor. You can also search for relevant Galapagos clinical trials on this site.'},
        {indication: 'Psoriatic Arthritis', description:  'Psoriatic arthritis is a chronic, inflammatory type of arthritis that affects some people with the skin condition psoriasis. It can cause symptoms in the skin, joints and nails. The symptoms can directly impact day-to-day life, which can be made more difficult to manage as symptoms can go away and then come back in a period known as a flare-up; these flare-ups can last for days or months. While there is no cure for psoriatic arthritis, symptoms can be controlled with appropriate management.  Along with support on treatment and management from your doctor, specific patient association websites can help you understand more about your condition and ideas on how to manage it, and provide you with access to a network of other patients and caregivers who have the same condition. Galapagos is committed to developing treatments for medical conditions with an unmet need, such as psoriatic arthritis. To find out if there is a clinical trial relevant to you, speak to your doctor. You can also search for relevant Galapagos clinical trials on this site.'},
        {indication: 'Osteoarthritis', description:'Osteoarthritis is the most common type of arthritis and is caused by wear and tear to your joints. While joints are exposed to low-level impact in everyone, in people with osteoarthritis, joints become particularly stiff and painful. The severity of symptoms experienced varies from person to person, with some people experiencing mild symptoms that come and go and others experiencing much more severe symptoms that can considerably affect day-to-day life. Although there is no cure for osteoarthritis, symptoms don’t necessarily get worse and can often be reduced with appropriate management.  Along with support on treatment and management from your doctor, specific patient association websites can help you understand more about your condition and ideas on how to manage it, and provide you with access to a network of other patient and caregivers who have the same condition. The exact cause of osteoarthritis is still unknown, which can make it harder to develop specific treatments. Galapagos is committed to developing treatments for medical conditions with an unmet need, such as osteoarthritis. To find out if there is a clinical trial relevant to you, speak to your doctor. You can also search for relevant Galapagos clinical trials on this site.'},
        {indication: 'Rheumatoid Arthritis', description:  'Rheumatoid arthritis is a chronic medical condition that occurs as a result of the immune system not working as it should and the body attacking healthy cells by mistake; this causes swelling and pain in the joints. The symptoms can come and go and not knowing when symptoms might appear can be difficult. However, appropriate treatment can result in months or years between flare-ups, which helps in being able to get on with day-to-day life. Along with support on treatment and management from your doctor, specific patient association websites can help you understand more about your condition and ideas on how to manage it, and provide you with access to a network of others who have the same condition. There is currently no cure for rheumatoid arthritis. Galapagos is committed to developing treatments for medical conditions with an unmet need, such as rheumatoid arthritis. To find out if there is a clinical trial relevant to you, speak to your doctor. You can also search for relevant Galapagos clinical trials on this site.'},
        {indication: 'Sjogren\'s Syndrome', description:  'Sjogren\'s syndrome is a chronic autoimmune condition in which the immune system becomes overactive and attacks the healthy tissue, in particular the tear and salivary glands. It’s not clear why this happens, meaning it has been difficult to develop specific treatments; however, there are ways in which the symptoms can be controlled. Along with support on treatment and management from your doctor, specific patient association websites can help you understand more about your condition and ideas on how to manage it, and provide you with access to a network of other patients and caregivers who have the same condition. Galapagos is committed to developing treatments for medical conditions with an unmet need, such as Sjogren\'s Syndrome. To find out if there is a clinical trial relevant to you, speak to your doctor. You can also search for relevant Galapagos clinical trials on this site.'},
        {indication: 'Systemic Sclerosis', description:'Systemic sclerosis is a chronic autoimmune condition in which the immune system becomes overactive and attacks the connective tissue that sits under the skin, which leads to hardened areas forming. The exact symptoms can differ from person to person, with some people experiencing symptoms affecting the internal organs and blood vessels. It’s not clear why this happens to the immune system, meaning it has been difficult to develop specific treatments; however, your doctor can support you on how to best manage the disease.Along with support on treatment and management from your doctor, specific patient association websites can help you understand more about your condition and ideas on how to manage it, and provide you with access to a network of patients and caregivers who have the same condition. Galapagos is committed to developing treatments for medical conditions with an unmet need, such as systemic sclerosis. To find out if there is a clinical trial relevant to you, speak to your doctor. You can also search for relevant Galapagos clinical trials on this site.'},
        {indication: 'Ulcerative Colitis', description: 'Ulcerative colitis is a chronic condition that causes inflammation in the digestive tract. Common symptoms include diarrhea, rectal bleeding and weight loss. The exact cause of ulcerative colitis is unknown, but eating healthily and keeping on top of stress has been shown to be beneficial. While there is currently no cure for ulcerative colitis, doctors have lots of experience managing this condition and will develop a management approach to help with symptoms. Along with support on treatment and management from your doctor, specific patient association websites can help you understand more about your condition and ideas on how to manage it, and provide you with access to a network of other patient and caregivers who have the same condition. Galapagos is committed to developing treatments for medical conditions with an unmet need, such as ulcerative colitis. To find out if there is a clinical trial relevant to you, speak to your doctor. You can also search for relevant Galapagos clinical trials on this site.'},
        {indication: 'Uveitis', description:  'Uveitis is a medical condition that occurs due to inflammation in part of the eye, resulting in a wide range of symptoms including blurry vision, a red eye or headaches. It can be caused by infection or immune response, and some instances it’s difficult to find the exact cause. Usually the treatment will be similar no matter the cause, apart from in uveitis caused by infection, where treatment that fights the bacteria or virus will be used. Along with support on treatment and management from your doctor, specific patient association websites can help you understand more about your condition and ideas on how to manage it, and provide you with access to a network of other patients and caregivers who have the same condition. Galapagos is committed to developing treatments for medical conditions such as uveitis. To find out if there is a clinical trial relevant to you, speak to your doctor. You can also search for relevant Galapagos clinical trials on this site.'}
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
exports.updateStories = updateStories ;
exports.getAllStoryVersions = getAllStoryVersions ;

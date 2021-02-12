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

var seed = 1;
String.prototype.capitalize = function(){return this.split(' ').map(x=>x.charAt(0).toUpperCase() + x.slice(1)).join(' ')};
function random() {
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
                return 'Child';
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
        await new Promise((resolve, reject) => {
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
                resolve(res.json(response));
            });

        }).on('error', (err) => {
            reject('Error: ' + err.message);
        });
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

async function getCoordinates(facility, zip, city, state, country, index)
{
    var params = [facility, zip, city, state, country]
    var filteredParams = params.filter(function (el) {
        return el != null;
      });
      
    var API_KEY = "AIzaSyAXBeTXzlo_-vwKTza6MGrzNwRHn8ppHrQ";
    var BASE_URL = "https://maps.googleapis.com/maps/api/geocode/json?address=";
    var joinedURL = BASE_URL + filteredParams.join('+') + "&key=" + API_KEY;
    var url = encodeURI(joinedURL.replace(/\s/g,'+').replace('#',''));
    
    try {
        return {lat: -1, lng: -1}   
        await new Promise(resolve => setTimeout(resolve, index*1000));
        const response = await fetch(url);
        const json = await response.json();
        return json.results[0].geometry.location;
    }catch (error) {
        return {lat: -1, lng: -1}    
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
                    'inclusion_criteria': element.Study.ProtocolSection.EligibilityModule.EligibilityCriteria,
                    'exclusion_criteria': element.Study.ProtocolSection.EligibilityModule.EligibilityCriteria,
                    'type_of_drug': element.Study.ProtocolSection.ArmsInterventionsModule.InterventionList && element.Study.ProtocolSection.ArmsInterventionsModule.InterventionList.Intervention.length ? element.Study.ProtocolSection.ArmsInterventionsModule.InterventionList.Intervention[0].InterventionName: null,
                    'story_telling': 'In this trial, doctors hope to find out how the study drug works together with your current standard treatment in terms of its effects on your lung function and IPF in general. People with IPF have increased levels of something called autotaxin, which is thought to have a role in the progression of IPF. The trial is investigating whether decreasing the activity of autotaxin can have a positive effect. It will also look at how well the study drug is tolerated.',
                    'trial_start_date': new Date(element.Study.ProtocolSection.StatusModule.StartDateStruct.StartDate),
                    'trial_end_date': element.Study.ProtocolSection.StatusModule.CompletionDateStruct.CompletionDate ? new Date(element.Study.ProtocolSection.StatusModule.CompletionDateStruct.CompletionDate) : null,
                    'locations': locationList? await Promise.all(locationList.Location.map(async (location,index)=> {
                        var {lat,lng} = await getCoordinates(location.LocationFacility,
                            location.LocationZip,
                            location.LocationCity,
                            location.LocationState,
                            location.LocationCountry,
                            index);   
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
        gender,
        location,
        distance,
        search_term,
        free_text_search,
        age_ranges,
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

    try {
        let query = !free_text_search? {
            [Op.or]: [
            {trial_status: status},
            {indication: indication},
            {indication_group: indication},
            {phase: phase},
            {std_age: age_ranges},
            {gender: gender},
            ]
        } : {
            [Op.or]: [
            {trial_status: {[Op.like]: '%' + free_text_search+  '%'}},
            {indication: {[Op.like]: '%' + free_text_search+  '%'}},
            {indication_group: {[Op.like]: '%' + free_text_search+  '%'}},
            {phase: {[Op.like]: '%' + free_text_search+  '%'}},
            {std_age: {[Op.like]: '%' + free_text_search+  '%'}},
            {gender: {[Op.like]: '%' + free_text_search+  '%'}},
            {indication: {[Op.like]: '%' + free_text_search+  '%'}},
            {indication_group: {[Op.like]: '%' + free_text_search+  '%'}}
            ]
        }
        let remove_index = [];
        query[[Op.or][0]].forEach((sub_or_query, index) =>{
            Object.keys(sub_or_query).forEach(key=>{
                if (!sub_or_query[key]){
                    delete query[[Op.or][0]][index][key]
                    remove_index.push(index);
                }
        })});
        remove_index.sort(function(a,b){ return b - a; }).forEach(index=>{
            query[[Op.or][0]].splice(index, 1);
        });

        if (!query[[Op.or][0]].length){
            delete query[[Op.or][0]];
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
            ...pageing});

        let total_item_count = await Trial.count({
            where: query
        });

        if (!result) {
            response.data = [];
            return res.status(204).send(response);
        }

        response.data = {
           search_result: result.map(x=>{ return {...x.dataValues, distance: Math.round(random()*10*100) / 100 + ' km'}}),
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
        console.error(err);
        response.errors.push(new CustomError('Internal server error', 500));
        res.status(500).send(response);
    }
}

async function getCountryList(req, res) {
    const response = new Response({}, []);
    res.set({ 'content-type': 'application/json; charset=utf-8' });
    let countriesWithISO = [{"code":"AD","name":"Andorra"},{"code":"AE","name":"United Arab Emirates"},{"code":"AF","name":"Afghanistan"},{"code":"AG","name":"Antigua and Barbuda"},{"code":"AI","name":"Anguilla"},{"code":"AL","name":"Albania"},{"code":"AM","name":"Armenia"},{"code":"AO","name":"Angola"},{"code":"AQ","name":"Antarctica"},{"code":"AR","name":"Argentina"},{"code":"AS","name":"American Samoa"},{"code":"AT","name":"Austria"},{"code":"AU","name":"Australia"},{"code":"AW","name":"Aruba"},{"code":"AX","name":"Åland Islands"},{"code":"AZ","name":"Azerbaijan"},{"code":"BA","name":"Bosnia and Herzegovina"},{"code":"BB","name":"Barbados"},{"code":"BD","name":"Bangladesh"},{"code":"BE","name":"Belgium"},{"code":"BF","name":"Burkina Faso"},{"code":"BG","name":"Bulgaria"},{"code":"BH","name":"Bahrain"},{"code":"BI","name":"Burundi"},{"code":"BJ","name":"Benin"},{"code":"BL","name":"Saint Barthélemy"},{"code":"BM","name":"Bermuda"},{"code":"BN","name":"Brunei Darussalam"},{"code":"BO","name":"Bolivia, Plurinational State of"},{"code":"BQ","name":"Bonaire, Sint Eustatius and Saba"},{"code":"BR","name":"Brazil"},{"code":"BS","name":"Bahamas"},{"code":"BT","name":"Bhutan"},{"code":"BV","name":"Bouvet Island"},{"code":"BW","name":"Botswana"},{"code":"BY","name":"Belarus"},{"code":"BZ","name":"Belize"},{"code":"CA","name":"Canada"},{"code":"CC","name":"Cocos (Keeling) Islands"},{"code":"CD","name":"Congo, Democratic Republic of the"},{"code":"CF","name":"Central African Republic"},{"code":"CG","name":"Congo"},{"code":"CH","name":"Switzerland"},{"code":"CI","name":"Côte d'Ivoire"},{"code":"CK","name":"Cook Islands"},{"code":"CL","name":"Chile"},{"code":"CM","name":"Cameroon"},{"code":"CN","name":"China"},{"code":"CO","name":"Colombia"},{"code":"CR","name":"Costa Rica"},{"code":"CU","name":"Cuba"},{"code":"CV","name":"Cabo Verde"},{"code":"CW","name":"Curaçao"},{"code":"CX","name":"Christmas Island"},{"code":"CY","name":"Cyprus"},{"code":"CZ","name":"Czechia"},{"code":"DE","name":"Germany"},{"code":"DJ","name":"Djibouti"},{"code":"DK","name":"Denmark"},{"code":"DM","name":"Dominica"},{"code":"DO","name":"Dominican Republic"},{"code":"DZ","name":"Algeria"},{"code":"EC","name":"Ecuador"},{"code":"EE","name":"Estonia"},{"code":"EG","name":"Egypt"},{"code":"EH","name":"Western Sahara"},{"code":"ER","name":"Eritrea"},{"code":"ES","name":"Spain"},{"code":"ET","name":"Ethiopia"},{"code":"FI","name":"Finland"},{"code":"FJ","name":"Fiji"},{"code":"FK","name":"Falkland Islands (Malvinas)"},{"code":"FM","name":"Micronesia, Federated States of"},{"code":"FO","name":"Faroe Islands"},{"code":"FR","name":"France"},{"code":"GA","name":"Gabon"},{"code":"GB","name":"United Kingdom of Great Britain and Northern Ireland"},{"code":"GD","name":"Grenada"},{"code":"GE","name":"Georgia"},{"code":"GF","name":"French Guiana"},{"code":"GG","name":"Guernsey"},{"code":"GH","name":"Ghana"},{"code":"GI","name":"Gibraltar"},{"code":"GL","name":"Greenland"},{"code":"GM","name":"Gambia"},{"code":"GN","name":"Guinea"},{"code":"GP","name":"Guadeloupe"},{"code":"GQ","name":"Equatorial Guinea"},{"code":"GR","name":"Greece"},{"code":"GS","name":"South Georgia and the South Sandwich Islands"},{"code":"GT","name":"Guatemala"},{"code":"GU","name":"Guam"},{"code":"GW","name":"Guinea-Bissau"},{"code":"GY","name":"Guyana"},{"code":"HK","name":"Hong Kong"},{"code":"HM","name":"Heard Island and McDonald Islands"},{"code":"HN","name":"Honduras"},{"code":"HR","name":"Croatia"},{"code":"HT","name":"Haiti"},{"code":"HU","name":"Hungary"},{"code":"ID","name":"Indonesia"},{"code":"IE","name":"Ireland"},{"code":"IL","name":"Israel"},{"code":"IM","name":"Isle of Man"},{"code":"IN","name":"India"},{"code":"IO","name":"British Indian Ocean Territory"},{"code":"IQ","name":"Iraq"},{"code":"IR","name":"Iran, Islamic Republic of"},{"code":"IS","name":"Iceland"},{"code":"IT","name":"Italy"},{"code":"JE","name":"Jersey"},{"code":"JM","name":"Jamaica"},{"code":"JO","name":"Jordan"},{"code":"JP","name":"Japan"},{"code":"KE","name":"Kenya"},{"code":"KG","name":"Kyrgyzstan"},{"code":"KH","name":"Cambodia"},{"code":"KI","name":"Kiribati"},{"code":"KM","name":"Comoros"},{"code":"KN","name":"Saint Kitts and Nevis"},{"code":"KP","name":"Korea, Democratic People's Republic of"},{"code":"KR","name":"Korea, Republic of"},{"code":"KW","name":"Kuwait"},{"code":"KY","name":"Cayman Islands"},{"code":"KZ","name":"Kazakhstan"},{"code":"LA","name":"Lao People's Democratic Republic"},{"code":"LB","name":"Lebanon"},{"code":"LC","name":"Saint Lucia"},{"code":"LI","name":"Liechtenstein"},{"code":"LK","name":"Sri Lanka"},{"code":"LR","name":"Liberia"},{"code":"LS","name":"Lesotho"},{"code":"LT","name":"Lithuania"},{"code":"LU","name":"Luxembourg"},{"code":"LV","name":"Latvia"},{"code":"LY","name":"Libya"},{"code":"MA","name":"Morocco"},{"code":"MC","name":"Monaco"},{"code":"MD","name":"Moldova, Republic of"},{"code":"ME","name":"Montenegro"},{"code":"MF","name":"Saint Martin, (French part)"},{"code":"MG","name":"Madagascar"},{"code":"MH","name":"Marshall Islands"},{"code":"MK","name":"North Macedonia"},{"code":"ML","name":"Mali"},{"code":"MM","name":"Myanmar"},{"code":"MN","name":"Mongolia"},{"code":"MO","name":"Macao"},{"code":"MP","name":"Northern Mariana Islands"},{"code":"MQ","name":"Martinique"},{"code":"MR","name":"Mauritania"},{"code":"MS","name":"Montserrat"},{"code":"MT","name":"Malta"},{"code":"MU","name":"Mauritius"},{"code":"MV","name":"Maldives"},{"code":"MW","name":"Malawi"},{"code":"MX","name":"Mexico"},{"code":"MY","name":"Malaysia"},{"code":"MZ","name":"Mozambique"},{"code":"NA","name":"Namibia"},{"code":"NC","name":"New Caledonia"},{"code":"NE","name":"Niger"},{"code":"NF","name":"Norfolk Island"},{"code":"NG","name":"Nigeria"},{"code":"NI","name":"Nicaragua"},{"code":"NL","name":"Netherlands"},{"code":"NO","name":"Norway"},{"code":"NP","name":"Nepal"},{"code":"NR","name":"Nauru"},{"code":"NU","name":"Niue"},{"code":"NZ","name":"New Zealand"},{"code":"OM","name":"Oman"},{"code":"PA","name":"Panama"},{"code":"PE","name":"Peru"},{"code":"PF","name":"French Polynesia"},{"code":"PG","name":"Papua New Guinea"},{"code":"PH","name":"Philippines"},{"code":"PK","name":"Pakistan"},{"code":"PL","name":"Poland"},{"code":"PM","name":"Saint Pierre and Miquelon"},{"code":"PN","name":"Pitcairn"},{"code":"PR","name":"Puerto Rico"},{"code":"PS","name":"Palestine, State of"},{"code":"PT","name":"Portugal"},{"code":"PW","name":"Palau"},{"code":"PY","name":"Paraguay"},{"code":"QA","name":"Qatar"},{"code":"RE","name":"Réunion"},{"code":"RO","name":"Romania"},{"code":"RS","name":"Serbia"},{"code":"RU","name":"Russian Federation"},{"code":"RW","name":"Rwanda"},{"code":"SA","name":"Saudi Arabia"},{"code":"SB","name":"Solomon Islands"},{"code":"SC","name":"Seychelles"},{"code":"SD","name":"Sudan"},{"code":"SE","name":"Sweden"},{"code":"SG","name":"Singapore"},{"code":"SH","name":"Saint Helena, Ascension and Tristan da Cunha"},{"code":"SI","name":"Slovenia"},{"code":"SJ","name":"Svalbard and Jan Mayen"},{"code":"SK","name":"Slovakia"},{"code":"SL","name":"Sierra Leone"},{"code":"SM","name":"San Marino"},{"code":"SN","name":"Senegal"},{"code":"SO","name":"Somalia"},{"code":"SR","name":"Suriname"},{"code":"SS","name":"South Sudan"},{"code":"ST","name":"Sao Tome and Principe"},{"code":"SV","name":"El Salvador"},{"code":"SX","name":"Sint Maarten, (Dutch part)"},{"code":"SY","name":"Syrian Arab Republic"},{"code":"SZ","name":"Eswatini"},{"code":"TC","name":"Turks and Caicos Islands"},{"code":"TD","name":"Chad"},{"code":"TF","name":"French Southern Territories"},{"code":"TG","name":"Togo"},{"code":"TH","name":"Thailand"},{"code":"TJ","name":"Tajikistan"},{"code":"TK","name":"Tokelau"},{"code":"TL","name":"Timor-Leste"},{"code":"TM","name":"Turkmenistan"},{"code":"TN","name":"Tunisia"},{"code":"TO","name":"Tonga"},{"code":"TR","name":"Turkey"},{"code":"TT","name":"Trinidad and Tobago"},{"code":"TV","name":"Tuvalu"},{"code":"TW","name":"Taiwan, Province of China"},{"code":"TZ","name":"Tanzania, United Republic of"},{"code":"UA","name":"Ukraine"},{"code":"UG","name":"Uganda"},{"code":"UM","name":"United States Minor Outlying Islands"},{"code":"US","name":"United States of America"},{"code":"UY","name":"Uruguay"},{"code":"UZ","name":"Uzbekistan"},{"code":"VA","name":"Holy See"},{"code":"VC","name":"Saint Vincent and the Grenadines"},{"code":"VE","name":"Venezuela, Bolivarian Republic of"},{"code":"VG","name":"Virgin Islands, British"},{"code":"VI","name":"Virgin Islands, U.S."},{"code":"VN","name":"Viet Nam"},{"code":"VU","name":"Vanuatu"},{"code":"WF","name":"Wallis and Futuna"},{"code":"WS","name":"Samoa"},{"code":"YE","name":"Yemen"},{"code":"YT","name":"Mayotte"},{"code":"ZA","name":"South Africa"},{"code":"ZM","name":"Zambia"},{"code":"ZW","name":"Zimbabwe"}]
    try {
        response.data = countriesWithISO;
        res.json(response);
    } catch (err) {
        console.error(err);
    }
}

async function getConditions(req, res) {
    const response = new Response({}, []);
    let conditions = [
        "Ankylosing Spondylitis",
        "Crohn's Disease",
        "Lupus Erythematosus",
        "Sjogren's Syndrome",
        "Ulcerative Colitis",
        "Systemic Sclerosis",
        "Uveitis",
        "Rheumatoid Arthritis",
        "Atopic Dermatitis",
        "Autosomal Dominant Polycystic Kidney Disease",
        "Idiopathic Pulmonary Fibrosis",
        "Osteoarthritis",
        "Psoriatic Arthritis"
    ]
    try {
        response.data = conditions;
        res.json(response);
        res.json(conditions);
    } catch (err) {
        console.error(err);
    }
}

async function validateAddress(req, res) {
    const response = new Response({}, []);
    let {country, zipcode} = req.body;
    const api_res = await fetch(`https://maps.google.com/maps/api/geocode/json?address=${country},%20${zipcode}&key=AIzaSyAXBeTXzlo_-vwKTza6MGrzNwRHn8ppHrQ`);
    const json = await api_res.json()
    try {
        response.data = !!json.results.length;
        res.json(response);
        console.log(country,zipcode)
    } catch (err) {
        console.error(err);
    }
}

exports.dumpAllData = dumpAllData;
exports.showAllVersions = showAllVersions;
exports.mergeProcessData = mergeProcessData;
exports.getTrials = getTrials;
exports.getTrialDetails = getTrialDetails;
exports.getCountryList = getCountryList;
exports.getConditions = getConditions;
exports.validateAddress = validateAddress;
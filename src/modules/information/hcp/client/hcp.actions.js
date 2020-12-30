import axios from 'axios';
import Types from './hcp.types';
import store from '../../../core/client/store';

export function getHcpProfiles(
    query = "") {
    return {
        type: Types.GET_HCPS,
        payload: axios({
            method: 'get',
            url: `/api/hcps${query}`
        })
    };
}

// export function editHcpProfiles(data, id) {
//     return {
//         type: Types.EDIT_HCPS,
//         payload: axios({
//             method: 'put',
//             url: '/api/hcps/' + id,
//             data
//         })
//     };
// }

export function hcpsSort(type, val) {
    return {
        type: Types.SORT_HCPS,
        payload: {
            type: type,
            val: val
        }
    };
}

export function getHCPSpecialities(country_iso2, locale) {
    let { specialties } = store.getState().hcpReducer;
    const country_locale_key = `${country_iso2.toLowerCase()}_${locale.toLowerCase()}`;

    const extractSpecialties = (data) => {
        const { data: { data: specialty_by_country_locale } } = data;

        if(!specialty_by_country_locale) return [];

        const options = specialty_by_country_locale.reduce((acc, curr) => {
            const { cod_id_onekey } = curr;
            if(acc.has(cod_id_onekey)) {
                const localeOrEng = acc.get(cod_id_onekey).cod_locale;
                if(localeOrEng !== 'en') {
                    acc.set(cod_id_onekey, curr);
                }
            }else{
                acc.set(cod_id_onekey, curr);
            }
            return acc;
        }, new Map());

        return [...options].map(e => e[1]);
    }

    if (specialties && specialties[country_locale_key]) {
        return {
            type: Types.GET_HCP_SPECIALTIES_FULFILLED,
            payload: Promise.resolve({
                data: specialties[country_locale_key],
                country_locale_key,
            })
        };
    }

    return {
        type: Types.GET_HCP_SPECIALTIES,
        payload: new Promise((resolve, reject) => {
            axios({
                method: 'get',
                url: `/api/hcp-profiles/specialties-eng?country_iso2=${country_iso2}&locale=${locale}`,
            })
            .then(data => resolve({
                data: extractSpecialties(data),
                country_locale_key
            }))
            .catch(error => reject(error));
        })
    };
}

export function getOklaHcpDetails(codbase, individualEid) {
    return {
        type: Types.GET_OKLA_HCP_DETAILS,
        payload: axios({
            method: 'get',
            url: `/api/okla/hcps/${codbase}/${individualEid}`
        })
    };
}

export function setOklaHcpDetails(hcpDetails) {
    return {
        type: Types.SET_OKLA_HCP_DETAILS,
        payload: hcpDetails
    };
}

export function getOklaHcoDetails(codbase, workplaceEid) {
    return {
        type: Types.GET_OKLA_HCO_DETAILS,
        payload: axios({
            method: 'get',
            url: `/api/okla/hcos/${codbase}/${workplaceEid}`
        })
    };
}

export function setOklaHcoDetails(hcoDetails) {
    return {
        type: Types.SET_OKLA_HCO_DETAILS,
        payload: hcoDetails
    };
}

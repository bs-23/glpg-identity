import axios from 'axios';
import Types from './consent.types';

export function getConsentReport(page, codbase, process_activity, opt_type, orderBy, orderType) {
    const search_params = new URLSearchParams('');

    page && search_params.append('page', page);
    codbase && search_params.append('codbase', codbase);
    process_activity && search_params.append('process_activity', process_activity);
    opt_type && search_params.append('opt_type', opt_type);
    orderBy && search_params.append('orderBy', orderBy);
    orderType && search_params.append('orderType', orderType);

    const url = `/api/consent-performance-report${search_params.toString() !== '' ? '?' + search_params.toString() : '' }`;

    return {
        type: Types.GET_CONSENTS_REPORT,
        payload: axios({
            method: 'get',
            url
        })
    };
}


export function getVeevaConsentReport(page, codbase, process_activity, opt_type, orderBy, orderType) {
    const search_params = new URLSearchParams('');

    page && search_params.append('page', page);
    codbase && search_params.append('codbase', codbase);
    process_activity && search_params.append('process_activity', process_activity);
    opt_type && search_params.append('opt_type', opt_type);
    orderBy && search_params.append('orderBy', orderBy);
    orderType && search_params.append('orderType', orderType);

    const url = `/api/datasync-consent-performance-report${search_params.toString() !== '' ? '?' + search_params.toString() : '' }`;

    return {
        type: Types.GET_VEEVA_CONSENTS_REPORT,
        payload: axios({
            method: 'get',
            url
        })
    };
}

export function getCdpConsents(translations, category){
    const search_params = new URLSearchParams('');

    translations && search_params.append('translations', translations);
    category && search_params.append('category', category);

    const url = `/api/cdp-consents${search_params.toString() !== '' ? '?' + search_params.toString() : '' }`;

    return {
        type: Types.GET_CDP_CONSENTS,
        payload: axios({
            method: 'get',
            url
        })
    };
}



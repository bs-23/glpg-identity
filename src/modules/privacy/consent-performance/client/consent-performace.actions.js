import axios from 'axios';
import Types from './consent-performace.types';

export function getConsentReport(page, codbase, opt_type, orderBy, orderType) {
    const search_params = new URLSearchParams('');

    page && search_params.append('page', page);
    codbase && search_params.append('codbase', codbase);
    opt_type && search_params.append('opt_type', opt_type);
    orderBy && search_params.append('orderBy', orderBy);
    orderType && search_params.append('orderType', orderType);

    const url = `/api/cdp-consent-performance-report${search_params.toString() !== '' ? '?' + search_params.toString() : ''}`;

    return {
        type: Types.GET_CONSENTS_REPORT,
        payload: axios({
            method: 'get',
            url
        })
    };
}

export function getVeevaConsentReport(page, codbase, opt_type, orderBy, orderType) {
    const search_params = new URLSearchParams('');

    page && search_params.append('page', page);
    codbase && search_params.append('codbase', codbase);
    opt_type && search_params.append('opt_type', opt_type);
    orderBy && search_params.append('orderBy', orderBy);
    orderType && search_params.append('orderType', orderType);

    const url = `/api/veeva-consent-performance-report${search_params.toString() !== '' ? '?' + search_params.toString() : ''}`;

    return {
        type: Types.GET_VEEVA_CONSENTS_REPORT,
        payload: axios({
            method: 'get',
            url
        })
    };
}

import axios from 'axios';
import Types from './consent.types';

export function getConsentReport(page, codbase, process_activity, opt_type, sortBy, sortType) {
    const search_params = new URLSearchParams('');

    page && search_params.append('page', page);
    codbase && search_params.append('codbase', codbase);
    process_activity && search_params.append('process_activity', process_activity);
    opt_type && search_params.append('opt_type', opt_type);
    sortBy && search_params.append('sortBy', sortBy);
    sortType && search_params.append('sortType', sortType);

    const url = `/api/consent-performance-report${search_params.toString() !== '' ? '?' + search_params.toString() : '' }`;

    return {
        type: Types.GET_CONSENTS_REPORT,
        payload: axios({
            method: 'get',
            url
        })
    };
}



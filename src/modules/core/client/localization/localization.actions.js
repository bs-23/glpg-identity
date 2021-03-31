import axios from 'axios';
import Types from './localization.types';

export function getLocalizations() {
    return {
        type: Types.GET_LOCALIZATIONS,
        payload: axios({
            method: 'get',
            url: '/api/localizations'
        })
    };
}

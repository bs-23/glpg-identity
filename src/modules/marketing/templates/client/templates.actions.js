import axios from 'axios';
import Types from './templates.types';
import store from '../../../core/client/store';

export function getTemplates(page = 1) {
    return {
        type: Types.GET_TEMPLATES,
        payload: axios({
            method: 'get',
            url: `/api/templates?page=${page}`
        })
    };
}

import axios from 'axios';
import Types from './faq.types';

export function fetchFaqItem(id) {
    return {
        type: Types.GET_FAQ_ITEM,
        payload: axios({
            method: 'get',
            url: `/api/faq/${id}`
        })
    };
}

export function createFaqItem(data) {
    return {
        type: Types.POST_FAQ_ITEM,
        payload: axios({
            method: 'post',
            url: `/api/faq`,
            data
        })
    };
}

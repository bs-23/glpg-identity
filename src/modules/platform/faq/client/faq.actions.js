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

export function getFaqItems() {
    return {
        type: Types.GET_FAQ_ITEMS,
        payload: axios({
            method: 'get',
            url: `/api/faq`
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

export function editFaqItem(data, id) {
    return {
        type: Types.PUT_FAQ_ITEM,
        payload: axios({
            method: 'patch',
            url: `/api/faq/${id}`,
            data
        })
    };
}

export function deleteFaqItem(id) {
    return {
        type: Types.DELETE_FAQ_ITEM,
        payload: axios({
            method: 'delete',
            url: `/api/faq/${id}`
        })
    };
}

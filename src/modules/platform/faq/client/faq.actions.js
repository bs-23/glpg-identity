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

export function getFaqItems(page = 1, category, orderBy, orderType, limit = 30) {
    const url = `/api/faq?page=${page}`
        + (category ? `&category=${category}` : '')
        + (orderBy && orderBy !== 'null' ? `&orderBy=${orderBy}` : '')
        + (orderType && orderType !== 'null' ? `&orderType=${orderType}` : '')
        + (limit && limit !== 'null' ? `&limit=${limit}` : '');
    return {
        type: Types.GET_FAQ_ITEMS,
        payload: axios({
            method: 'get',
            url: url
        })
    };
}

export function getFaqCategories() {
    const url = `/api/faqCategories`;
    return {
        type: Types.GET_FAQ_CATEGORIES,
        payload: axios({
            method: 'get',
            url: url
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

export function createFaqCategory(data) {
    return {
        type: Types.POST_FAQ_CATEGORY,
        payload: axios({
            method: 'post',
            url: `/api/faqCategories`,
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

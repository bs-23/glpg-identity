import Types from './faq.types';

const initialState = {
    faq_item: null,
    faq_items: []
};

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case Types.GET_FAQ_ITEM_FULFILLED: {
            return { ...state, faq_item: action.payload.data };
        }
    }

    switch (action.type) {
        case Types.POST_FAQ_ITEM_FULFILLED: {
            return { ...state, faq_item: action.payload.data };
        }
    }

    return state;
}

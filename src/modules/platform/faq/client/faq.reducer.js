import Types from './faq.types';
const initialState = {
    faq_item: null,
    faq_items: {},
    faq_topics: []
};

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case Types.GET_FAQ_ITEM_FULFILLED: {
            return { ...state, faq_item: action.payload.data };
        }

        case Types.GET_FAQ_ITEMS_FULFILLED: {
            return { ...state, faq_items: action.payload.data };
        }

        case Types.GET_FAQ_CATEGORIES_FULFILLED: {
            return { ...state, faq_topics: action.payload.data };
        }


        case Types.POST_FAQ_CATEGORY_FULFILLED: {
            return {
                ...state,
                faq_topics: [...state.faq_topics, action.payload.data]
            };
        }

        case Types.POST_FAQ_ITEM_FULFILLED: {
            state.faq_items.faq.unshift(action.payload.data);
            return {
                ...state,
                faq_item: action.payload.data,
                faq_items: { ...state.faq_items, faq: state.faq_items.faq }
            };
        }

        case Types.PUT_FAQ_ITEM_FULFILLED: {
            return {
                ...state,
                faq_item: action.payload.data,
                faq_items: {
                    ...state.faq_items,
                    faq: (state.faq_items.faq).map(item => {
                        if (item.id === action.payload.data.id) {
                            return action.payload.data
                        }
                        return item
                    })
                }
            }
        }

        case Types.PUT_FAQ_CATEGORY_FULFILLED: {
            return {
                ...state,
                faq_topics: (state.faq_topics).map(item => {
                    if (item.id === action.payload.data.id) {
                        return action.payload.data
                    }
                    return item
                })
            }

        }

        case Types.DELETE_FAQ_ITEM_FULFILLED: {
            const id = action.payload.config.url.split("/api/faq/")[1];
            return {
                ...state,
                faq_items: {
                    ...state.faq_items,
                    faq: state.faq_items.faq.filter(x => x.id !== id)
                }
            }
        }
    }

    return state;
}

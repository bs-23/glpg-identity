import Types from './category.types';

const initialState = {
    consent_category: null,
    consent_categories: []
};

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case Types.GET_CONSENT_CATEGORY_FULFILLED: {
            return {
                ...state,
                consent_category: action.payload.data
            };
        }

        case Types.GET_CONSENT_CATEGORIES_FULFILLED: {
            return {
                ...state,
                consent_categories: action.payload.data
            }
        }

        case Types.POST_CONSENT_CATEGORY_FULFILLED: {
            return {
                ...state,
                consent_categories: state.consent_categories.concat(action.payload.data)
            };
        }

        case Types.PUT_CONSENT_CATEGORY_FULFILLED: {
            const consent_categories = state.consent_categories.map(function(x) {
                if(x.id === action.payload.data.id) {
                    x.title = action.payload.data.title;
                    x.legal_title = action.payload.data.legal_title;
                    x.slug = action.payload.data.slug;
                    x.is_active = action.payload.data.is_active;
                }
                return x;
            });
            return { ...state, consent_categories: consent_categories };
        }
    }
    return state;
}

import Types from './preference.types';

const initialState = {
    consent_preference: null,
    consent_preferences: []
};

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case Types.GET_CONSENT_PREFERENCE_FULFILLED: {
            return {
                ...state,
                consent_preference: action.payload.data
            };
        }

        case Types.GET_CONSENT_PREFERENCES_FULFILLED: {
            return {
                ...state,
                consent_preferences: action.payload.data
            }
        }

        case Types.POST_CONSENT_PREFERENCE_FULFILLED: {
            return {
                ...state,
                consent_preferences: state.consent_preferences.concat(action.payload.data)
            };
        }

        case Types.PUT_CONSENT_PREFERENCE_FULFILLED: {
            const consent_preferences = state.consent_preferences.map(function(x) {
                if(x.id === action.payload.data.id) {
                    x.title = action.payload.data.title;
                    x.slug = action.payload.data.slug;
                    x.is_active = action.payload.data.is_active;
                }
                return x;
            });
            return { ...state, consent_preferences: consent_preferences };
        }
    }
    return state;
}

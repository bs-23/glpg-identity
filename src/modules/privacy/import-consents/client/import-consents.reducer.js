import Types from './import-consents.types';

const initialState = {
    imported_consents: []
};

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case Types.GET_IMPORTED_CONSENT_DATA_FULFILLED: {
            console.log(action.payload.data);
            return {
                ...state,
                imported_consents: action.payload.data
            };
        }

    }
    return state;
}

import Types from './import-consents.types';

const initialState = {
    consent_import_records: []
};

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case Types.GET_CONSENT_IMPORT_RECORDS_FULFILLED: {
            return {
                ...state,
                consent_import_records: action.payload.data
            };
        }
    }
    return state;
}

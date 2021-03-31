import Types from './import-consents.types';

const initialState = {
    consent_import_jobs: []
};

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case Types.GET_CONSENT_IMPORT_JOBS_FULFILLED: {
            return {
                ...state,
                consent_import_jobs: action.payload.data
            };
        }
    }
    return state;
}

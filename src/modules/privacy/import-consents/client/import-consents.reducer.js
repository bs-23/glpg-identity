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

        case Types.DELETE_CONSENT_IMPORT_JOB_FULFILLED: {
            const id = action.payload.config.url.split("/api/consent-import-jobs/")[1];
            return {
                ...state,
                consent_import_jobs: state.consent_import_jobs.filter(x => x.id !== id)
            }
        }
    }
    return state;
}

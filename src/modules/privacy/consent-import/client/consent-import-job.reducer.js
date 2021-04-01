import Types from './consent-import-job.types';

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

        case Types.START_CONSENT_IMPORT_JOB_FULFILLED: {
            const updatedJob = action.payload.data;

            const index = state.consent_import_jobs.findIndex(job => job.id === updatedJob.id);
            const newJobs = [...state.consent_import_jobs];
            newJobs[index].status = updatedJob.status;
            newJobs[index].data = updatedJob.data;
            newJobs[index].updated_by = updatedJob.updated_by;
            newJobs[index].updated_at = updatedJob.updated_at;

            return {
                ...state,
                consent_import_jobs: newJobs
            }
        }

        case Types.CANCEL_CONSENT_IMPORT_JOB_FULFILLED: {
            const id = action.payload.config.url.split('/api/consent-import-jobs/')[1];

            const jobs = state.consent_import_jobs.map(job => {
                return {
                    ...job,
                    status: job.id === id ? 'cancelled' : job.status
                };
            });

            return {
                ...state,
                consent_import_jobs: jobs
            }
        }
    }
    return state;
}
